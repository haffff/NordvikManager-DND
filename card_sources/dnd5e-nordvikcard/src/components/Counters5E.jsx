import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useProperty } from "../../hooks/useProperty";
import {
  COUNTERS_PROPERTY, parseCounters, newCounter, adjust, setValue, rest, activate, deactivate, PRESETS,
} from "../counters";

const RESET_LABEL = { short: "Short rest", long: "Long rest", none: "Never" };

// Adds a counter: a preset (name, reset, duration filled in) or a custom one, with its max.
const AddCounterForm = ({ onAdd }) => {
  const [preset, setPreset] = React.useState(PRESETS[0].name);
  const [name, setName] = React.useState("");
  const [max, setMax] = React.useState(1);

  const add = () => {
    const base = PRESETS.find((p) => p.name === preset) ?? { name: name.trim() || "Counter", reset: "long" };
    onAdd(newCounter({ ...base, max: Math.max(0, parseInt(max, 10) || 0) }));
    setName("");
  };

  return (
    <div className="dnd5e_counter_add">
      <select value={preset} onChange={(e) => setPreset(e.target.value)}>
        {PRESETS.map((p) => (
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
        <option value="">Custom…</option>
      </select>
      {preset === "" && <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />}
      <label>
        Max <input className="dnd5e_counter_num" type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} />
      </label>
      <button className="dnd5e_inventory_add_btn" title="Add counter" onClick={add}>
        <FaPlus />
      </button>
    </div>
  );
};

const CounterRow = ({ counter, edit, onChange, onRemove, apply }) => {
  const active = counter.roundsLeft > 0;
  return (
    <div className={`dnd5e_counter_row${active ? " dnd5e_counter_active" : ""}`}>
      {edit ? (
        <>
          <input className="dnd5e_counter_name_input" value={counter.name} onChange={(e) => onChange({ ...counter, name: e.target.value })} />
          <label>
            Max{" "}
            <input
              className="dnd5e_counter_num"
              type="number"
              min={0}
              value={counter.max}
              onChange={(e) => onChange({ ...counter, max: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            />
          </label>
          <select value={counter.reset} onChange={(e) => onChange({ ...counter, reset: e.target.value })}>
            {Object.entries(RESET_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <label title="How many of your turns one activation lasts; empty for none">
            Rounds{" "}
            <input
              className="dnd5e_counter_num"
              type="number"
              min={0}
              value={counter.durationRounds ?? ""}
              onChange={(e) => onChange({ ...counter, durationRounds: parseInt(e.target.value, 10) || null })}
            />
          </label>
          <button className="dnd5e_remove_btn" title="Remove counter" onClick={onRemove}>
            <FaMinus />
          </button>
        </>
      ) : (
        <>
          <span className="dnd5e_counter_name">{counter.name}</span>
          <button className="dnd5e_counter_step" onClick={() => apply((list) => adjust(list, counter.id, -1))}>−</button>
          <input
            className="dnd5e_counter_num"
            type="number"
            min={0}
            value={counter.current}
            onChange={(e) => apply((list) => setValue(list, counter.id, e.target.value))}
          />
          <button className="dnd5e_counter_step" onClick={() => apply((list) => adjust(list, counter.id, 1))}>+</button>
          {counter.max > 0 && <span className="dnd5e_counter_max">/ {counter.max}</span>}
          <span className="dnd5e_counter_reset">{RESET_LABEL[counter.reset] ?? ""}</span>
          {counter.durationRounds > 0 && (active ? (
            <>
              <span className="dnd5e_counter_rounds">{counter.roundsLeft} rounds left</span>
              <button className="dnd5e_use_btn" onClick={() => apply((list) => deactivate(list, counter.id))}>End</button>
            </>
          ) : (
            <button
              className="dnd5e_use_btn"
              disabled={!(counter.current > 0)}
              title={`Spend one and start ${counter.durationRounds} rounds`}
              onClick={() => apply((list) => activate(list, counter.id))}
            >
              Activate
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export const Counters5E = ({ Api }) => {
  const [stored, setStored] = useProperty([Api, COUNTERS_PROPERTY, "[]"]);
  const counters = React.useMemo(() => parseCounters(stored), [stored]);
  const [edit, setEdit] = React.useState(false);

  // Every change goes through one function of the list (src/counters.js).
  const apply = (fn) => setStored(JSON.stringify(fn(counters)));

  return (
    <div className="dnd5e_spells_container">
      <div className="dnd5e_inventory_toolbar">
        <button className="dnd5e_inventory_search_btn" title="Refill short-rest counters" onClick={() => apply((list) => rest(list, "short"))}>
          Short rest
        </button>
        <button className="dnd5e_inventory_search_btn" title="Refill short- and long-rest counters" onClick={() => apply((list) => rest(list, "long"))}>
          Long rest
        </button>
        <button className="dnd5e_inventory_edit_btn" onClick={() => setEdit((v) => !v)}>
          {edit ? "✓ Done" : "Edit"}
        </button>
      </div>
      <AddCounterForm onAdd={(counter) => apply((list) => [...list, counter])} />
      {counters.length === 0 && (
        <div className="dnd5e_inventory_empty">
          <span>No counters yet.</span>
          <span className="dnd5e_inventory_empty_sub">Add one above, e.g. Rage, and set how many uses you have.</span>
        </div>
      )}
      <div className="dnd5e_spells_body">
        {counters.map((counter) => (
          <CounterRow
            key={counter.id}
            counter={counter}
            edit={edit}
            apply={apply}
            onChange={(updated) => apply((list) => list.map((c) => (c.id === counter.id ? updated : c)))}
            onRemove={() => apply((list) => list.filter((c) => c.id !== counter.id))}
          />
        ))}
      </div>
    </div>
  );
};
