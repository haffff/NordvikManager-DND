import React from "react";
import {
  FaPlus, FaMinus, FaPen, FaLink, FaTrash, FaHourglassHalf, FaCampground, FaBed, FaHandPaper, FaStopwatch, FaCheck,
} from "react-icons/fa";
import { usePropertyList } from "../../hooks/usePropertyList";
import { useCounters } from "../../hooks/useCounters";
import { COUNTER_ICONS, SHOW_ON_TOKEN, iconOf, tokenIconProps, iconProperty } from "../tokenIcons";
import { counterIcon } from "../counterIcons";
import {
  RESETS, PRESETS, newCounter, adjust, setValue, rest, activate, deactivate,
  tickRound, showsPips,
} from "../counters";

const RESET_ICON = { round: FaHourglassHalf, short: FaCampground, long: FaBed, none: FaHandPaper };

const ResetBadge = ({ reset }) => {
  const Icon = RESET_ICON[reset] ?? FaHandPaper;
  return (
    <span className={`dnd5e_ctr_badge dnd5e_ctr_badge_${reset}`} title={`Refills: ${RESETS[reset] ?? "manual"}`}>
      <Icon /> {RESETS[reset] ?? "Manual"}
    </span>
  );
};

// Pips for small counters: click a pip to set the count to it (click the last filled one to spend it).
const Pips = ({ counter, apply }) => (
  <div className="dnd5e_ctr_pips" role="group" aria-label={`${counter.name}: ${counter.current} of ${counter.max}`}>
    {Array.from({ length: counter.max }, (_, i) => {
      const filled = i < counter.current;
      const next = filled && i === counter.current - 1 ? i : i + 1;
      return (
        <button
          key={i}
          className={`dnd5e_ctr_pip${filled ? " filled" : ""}`}
          title={filled ? "Spend" : "Regain"}
          onClick={() => apply((list) => setValue(list, counter.id, next))}
        />
      );
    })}
  </div>
);

const CounterValue = ({ counter, apply }) => (
  <div className="dnd5e_ctr_value_row">
    <button className="dnd5e_ctr_step" aria-label="Spend one" onClick={() => apply((list) => adjust(list, counter.id, -1))}>
      <FaMinus />
    </button>
    {showsPips(counter) ? (
      <div className="dnd5e_ctr_pips_wrap">
        <Pips counter={counter} apply={apply} />
        <span className="dnd5e_ctr_count">{counter.current} / {counter.max}</span>
      </div>
    ) : (
      <div className="dnd5e_ctr_big">
        <input
          className="dnd5e_ctr_big_input"
          type="number"
          min={0}
          aria-label={`${counter.name} current`}
          value={counter.current}
          onChange={(e) => apply((list) => setValue(list, counter.id, e.target.value))}
        />
        {counter.max > 0 && <span className="dnd5e_ctr_big_max">/ {counter.max}</span>}
        {counter.max > 0 && (
          <div className="dnd5e_ctr_bar"><div style={{ width: `${Math.min(100, (counter.current / counter.max) * 100)}%` }} /></div>
        )}
      </div>
    )}
    <button className="dnd5e_ctr_step" aria-label="Regain one" onClick={() => apply((list) => adjust(list, counter.id, 1))}>
      <FaPlus />
    </button>
  </div>
);

const CounterEditor = ({ counter, feats, onChange, onRemove, onDone }) => {
  const [confirm, setConfirm] = React.useState(false);
  const number = (value) => Math.max(0, parseInt(value, 10) || 0);
  return (
    <div className="dnd5e_ctr_editor">
      <label className="dnd5e_ctr_field">
        <span>Name</span>
        <input value={counter.name} onChange={(e) => onChange({ ...counter, name: e.target.value })} autoFocus />
      </label>
      <div className="dnd5e_ctr_field_row">
        <label className="dnd5e_ctr_field">
          <span>Max</span>
          <input type="number" min={0} value={counter.max} onChange={(e) => onChange({ ...counter, max: number(e.target.value) })} />
        </label>
        <label className="dnd5e_ctr_field">
          <span>Lasts (rounds)</span>
          <input
            type="number"
            min={0}
            placeholder="—"
            value={counter.durationRounds ?? ""}
            onChange={(e) => onChange({ ...counter, durationRounds: number(e.target.value) || null })}
          />
        </label>
      </div>
      <label className="dnd5e_ctr_field">
        <span>Refills</span>
        <select value={counter.reset} onChange={(e) => onChange({ ...counter, reset: e.target.value })}>
          {Object.entries(RESETS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="dnd5e_ctr_field">
        <span>Token icon</span>
        <div className="dnd5e_ctr_icon_grid" role="radiogroup" aria-label="Token icon">
          <button
            role="radio"
            aria-checked={!counter.icon}
            className={`dnd5e_ctr_icon_choice none${!counter.icon ? " active" : ""}`}
            title="No icon"
            onClick={() => onChange({ ...counter, icon: "" })}
          >
            —
          </button>
          {COUNTER_ICONS.map(({ key, label }) => {
            return (
              <button
                key={key}
                role="radio"
                aria-checked={counter.icon === key}
                className={`dnd5e_ctr_icon_choice${counter.icon === key ? " active" : ""}`}
                title={label}
                onClick={() => onChange({ ...counter, icon: key, showOnToken: iconOf(counter).showOnToken === "never" ? (counter.durationRounds ? "active" : "uses") : counter.showOnToken })}
              >
                {counterIcon(key)}
              </button>
            );
          })}
        </div>
      </div>
      {counter.icon && (
        <label className="dnd5e_ctr_field">
          <span>Show on token</span>
          <select value={iconOf(counter).showOnToken} onChange={(e) => onChange({ ...counter, showOnToken: e.target.value })}>
            {Object.entries(SHOW_ON_TOKEN).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      )}
      <label className="dnd5e_ctr_field">
        <span>Feat</span>
        <select value={counter.featId ?? ""} onChange={(e) => onChange({ ...counter, featId: e.target.value || undefined })}>
          <option value="">{feats.length ? "None (or the feat with the same name)" : "No feats on this character"}</option>
          {feats.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </label>
      <div className="dnd5e_ctr_editor_actions">
        {!confirm && <button className="dnd5e_ctr_ghost danger" onClick={() => setConfirm(true)}><FaTrash /> Delete</button>}
        {confirm && (
          <span className="dnd5e_ctr_confirm">
            Delete “{counter.name}”?
            <button className="dnd5e_ctr_ghost danger" onClick={onRemove}>Delete</button>
            <button className="dnd5e_ctr_ghost" onClick={() => setConfirm(false)}>Keep</button>
          </span>
        )}
        <button className="dnd5e_ctr_primary" onClick={onDone}><FaCheck /> Done</button>
      </div>
    </div>
  );
};

const CounterTile = ({ counter, feat, feats, apply, focused, onShowFeat }) => {
  const [editing, setEditing] = React.useState(false);
  const ref = React.useRef(null);
  const active = counter.roundsLeft > 0;

  React.useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused]);

  const change = (updated) => apply((list) => list.map((c) => (c.id === counter.id ? updated : c)));
  const tokenIcon = counterIcon(counter.icon);
  const onToken = !!tokenIcon && tokenIconProps([counter])[iconProperty(counter.icon)] === "true";

  return (
    <div ref={ref} className={`dnd5e_ctr_tile${active ? " active" : ""}${focused ? " focused" : ""}`}>
      <div className="dnd5e_ctr_head">
        <span className="dnd5e_ctr_name">
          {tokenIcon && (
            <span
              className={`dnd5e_ctr_token_icon${onToken ? " on" : ""}`}
              title={onToken ? "Showing on the token" : `On the token ${SHOW_ON_TOKEN[iconOf(counter).showOnToken].toLowerCase()}`}
            >
              {tokenIcon}
            </span>
          )}
          {counter.name || <em>Unnamed</em>}
        </span>
        {!editing && (
          <button className="dnd5e_ctr_icon_btn" aria-label={`Edit ${counter.name}`} title="Edit" onClick={() => setEditing(true)}>
            <FaPen />
          </button>
        )}
      </div>
      <div className="dnd5e_ctr_meta">
        <ResetBadge reset={counter.reset} />
        {feat && (
          <button className="dnd5e_ctr_feat_chip" title="Show the feat" onClick={() => onShowFeat(feat.id)}>
            <FaLink /> {feat.name}
          </button>
        )}
      </div>

      {editing ? (
        <CounterEditor
          counter={counter}
          feats={feats}
          onChange={change}
          onRemove={() => apply((list) => list.filter((c) => c.id !== counter.id))}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
          <CounterValue counter={counter} apply={apply} />
          {counter.durationRounds > 0 && (
            <div className="dnd5e_ctr_duration">
              {active ? (
                <>
                  <span className="dnd5e_ctr_rounds"><FaStopwatch /> {counter.roundsLeft} {counter.roundsLeft === 1 ? "round" : "rounds"} left</span>
                  <button className="dnd5e_ctr_ghost" onClick={() => apply((list) => deactivate(list, counter.id))}>End</button>
                </>
              ) : (
                <button
                  className="dnd5e_ctr_primary"
                  disabled={!(counter.current > 0)}
                  title={`Spend one and start ${counter.durationRounds} rounds`}
                  onClick={() => apply((list) => activate(list, counter.id))}
                >
                  Activate · {counter.durationRounds} rounds
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CUSTOM = "__custom";

// Adds a counter: a preset (grouped by when it refills) or one of your own, and its max.
const AddCounter = ({ onAdd, onClose }) => {
  const [choice, setChoice] = React.useState(PRESETS[0].name);
  const [name, setName] = React.useState("");
  const [max, setMax] = React.useState(1);
  const preset = PRESETS.find((p) => p.name === choice);
  const groups = Object.keys(RESETS)
    .map((reset) => [reset, PRESETS.filter((p) => p.reset === reset)])
    .filter(([, list]) => list.length);

  const add = () => {
    const base = preset ?? { name: name.trim(), reset: "long" };
    if (!base.name) return;
    onAdd(newCounter({ ...base, max: Math.max(0, parseInt(max, 10) || 0) }));
  };

  return (
    <div className="dnd5e_ctr_add">
      <div className="dnd5e_ctr_add_title">New counter</div>
      <div className="dnd5e_ctr_add_grid">
        <label className="dnd5e_ctr_field">
          <span>Counter</span>
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            {groups.map(([reset, list]) => (
              <optgroup key={reset} label={RESETS[reset]}>
                {list.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </optgroup>
            ))}
            <option value={CUSTOM}>Custom…</option>
          </select>
        </label>
        {!preset && (
          <label className="dnd5e_ctr_field">
            <span>Name</span>
            <input value={name} placeholder="e.g. Hunter's Mark" onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
        )}
        <label className="dnd5e_ctr_field dnd5e_ctr_field_narrow">
          <span>Max</span>
          <input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} />
        </label>
      </div>
      {preset && (
        <div className="dnd5e_ctr_add_hint">
          <ResetBadge reset={preset.reset} />
          {preset.durationRounds ? <span>Lasts {preset.durationRounds} rounds when activated</span> : null}
        </div>
      )}
      <div className="dnd5e_ctr_add_actions">
        <button className="dnd5e_ctr_ghost" onClick={onClose}>Cancel</button>
        <button className="dnd5e_ctr_primary" disabled={!preset && !name.trim()} onClick={add}><FaPlus /> Add</button>
      </div>
    </div>
  );
};

export const Counters5E = ({ Api, focus, onShowFeat }) => {
  // Every change goes through one function of the list (src/counters.js); the
  // token's counter icons are updated with it.
  const [counters, apply] = useCounters(Api);
  const [feats] = usePropertyList([Api, "feats", true]);
  const [adding, setAdding] = React.useState(false);


  const featOf = (counter) =>
    feats.find((f) => f.id === counter.featId) ??
    (counter.featId ? undefined : feats.find((f) => f.name?.trim().toLowerCase() === counter.name?.trim().toLowerCase()));

  return (
    <div className="dnd5e_ctr">
      <div className="dnd5e_ctr_toolbar">
        <div className="dnd5e_ctr_group" role="group" aria-label="Refill">
          <button title="Start of a new round: count durations down, refill per-round counters" onClick={() => apply((list) => tickRound(list).counters)}>
            <FaHourglassHalf /> New round
          </button>
          <button title="Refill per-round and short-rest counters" onClick={() => apply((list) => rest(list, "short"))}>
            <FaCampground /> Short rest
          </button>
          <button title="Refill everything that refills on a rest" onClick={() => apply((list) => rest(list, "long"))}>
            <FaBed /> Long rest
          </button>
        </div>
        <button className="dnd5e_ctr_primary" onClick={() => setAdding((v) => !v)}>
          <FaPlus /> Add counter
        </button>
      </div>

      {adding && (
        <AddCounter
          onAdd={(counter) => { apply((list) => [...list, counter]); setAdding(false); }}
          onClose={() => setAdding(false)}
        />
      )}

      {counters.length === 0 && !adding && (
        <div className="dnd5e_ctr_empty">
          <FaHourglassHalf className="dnd5e_ctr_empty_icon" />
          <div>No counters yet.</div>
          <div className="dnd5e_ctr_empty_sub">
            Track uses like Rage, Reactions or Focus Points. On the Feats tab, “Track uses” makes one for a feat.
          </div>
          <button className="dnd5e_ctr_primary" onClick={() => setAdding(true)}><FaPlus /> Add counter</button>
        </div>
      )}

      <div className="dnd5e_ctr_grid">
        {counters.map((counter) => (
          <CounterTile
            key={counter.id}
            counter={counter}
            feat={featOf(counter)}
            feats={feats}
            apply={apply}
            focused={focus?.id === counter.id ? focus.at : null}
            onShowFeat={onShowFeat}
          />
        ))}
      </div>
    </div>
  );
};
