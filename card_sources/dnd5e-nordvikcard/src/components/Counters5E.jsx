import React from "react";
import {
  FaPlus, FaMinus, FaPen, FaLink, FaTrash, FaHourglassHalf, FaCampground, FaBed, FaHandPaper, FaStopwatch, FaCheck,
} from "react-icons/fa";
import { useProperty } from "../../hooks/useProperty";
import { usePropertyList } from "../../hooks/usePropertyList";
import {
  COUNTERS_PROPERTY, RESETS, PRESETS, parseCounters, newCounter, adjust, setValue, rest, activate, deactivate,
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
      <div className="dnd5e_ctr_field">
        <span>Refills</span>
        <div className="dnd5e_ctr_segmented" role="radiogroup">
          {Object.entries(RESETS).map(([value, label]) => {
            const Icon = RESET_ICON[value];
            return (
              <button
                key={value}
                role="radio"
                aria-checked={counter.reset === value}
                className={counter.reset === value ? "active" : ""}
                onClick={() => onChange({ ...counter, reset: value })}
              >
                <Icon /> {label}
              </button>
            );
          })}
        </div>
      </div>
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

  return (
    <div ref={ref} className={`dnd5e_ctr_tile${active ? " active" : ""}${focused ? " focused" : ""}`}>
      <div className="dnd5e_ctr_head">
        <span className="dnd5e_ctr_name">{counter.name || <em>Unnamed</em>}</span>
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

// Adds a counter: pick a preset (grouped by when it refills) or name your own, then its max.
const AddCounter = ({ onAdd, onClose }) => {
  const [preset, setPreset] = React.useState(null);
  const [name, setName] = React.useState("");
  const [max, setMax] = React.useState(1);
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
      {groups.map(([reset, list]) => (
        <div key={reset} className="dnd5e_ctr_add_group">
          <ResetBadge reset={reset} />
          <div className="dnd5e_ctr_chips">
            {list.map((p) => (
              <button
                key={p.name}
                className={`dnd5e_ctr_chip${preset?.name === p.name ? " active" : ""}`}
                onClick={() => { setPreset(p); setName(""); }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="dnd5e_ctr_add_row">
        <input
          placeholder="…or a name of your own"
          value={name}
          onChange={(e) => { setName(e.target.value); setPreset(null); }}
        />
        <label className="dnd5e_ctr_inline">
          Max <input type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} />
        </label>
        <button className="dnd5e_ctr_primary" disabled={!preset && !name.trim()} onClick={add}><FaPlus /> Add</button>
        <button className="dnd5e_ctr_ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export const Counters5E = ({ Api, focus, onShowFeat }) => {
  const [stored, setStored] = useProperty([Api, COUNTERS_PROPERTY, "[]"]);
  const counters = React.useMemo(() => parseCounters(stored), [stored]);
  const [feats] = usePropertyList([Api, "feats", true]);
  const [adding, setAdding] = React.useState(false);

  // Every change goes through one function of the list (src/counters.js).
  const apply = (fn) => setStored(JSON.stringify(fn(counters)));

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
