import React from "react";
import { useSourceData } from "../hooks/useSourceData";
import { monsterToProps } from "../../dnd5e-monstercard/src/monsterData.js";
import { searchMonsters, filterOptions, crOf, typeName } from "./monsterSearch.js";
import "./App.css";

const MAX_RESULTS = 100;
const ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

// Opened from the battle map's right-click "Add" menu, open_monster_creator passes
// %battleMapId%/%position%; opened from the toolbar those never substitute, so anything
// unparsable or incomplete means "no map context" (same as the item creator).
const readMapContext = (additionalArguments) => {
  try {
    const parsed = additionalArguments ? JSON.parse(additionalArguments) : null;
    return parsed?.battleMapId && parsed?.position ? parsed : null;
  } catch {
    return null;
  }
};

const listItems = (props, name) =>
  Array.from({ length: Number(props[`${name}_count`] ?? 0) }, (_, i) => JSON.parse(props[`${name}_${i}`]));

const Preview = ({ monster }) => {
  const props = React.useMemo(
    () => Object.fromEntries(monsterToProps(monster).map(({ name, value }) => [name, value])),
    [monster]
  );
  const line = [props.monster_size, props.monster_type, props.monster_subtype && `(${props.monster_subtype})`, props.monster_alignment]
    .filter(Boolean).join(" ");
  const actions = listItems(props, "actions");
  const traits = listItems(props, "traits");
  return (
    <div className="mc_preview">
      <h2>{props.monster_name}</h2>
      <div className="mc_muted">{line}</div>
      <div className="mc_stats">
        <span><b>AC</b> {props.armor}</span>
        <span><b>HP</b> {props.hp}</span>
        <span><b>Speed</b> {props.speed}</span>
        <span><b>CR</b> {props.cr}</span>
      </div>
      <div className="mc_abilities">
        {ABILITIES.map((a) => (
          <div key={a}>
            <div className="mc_ability_name">{a.slice(0, 3).toUpperCase()}</div>
            <div>{props[`${a}_attribute`]} ({Number(props[`${a}_mod`]) >= 0 ? "+" : ""}{props[`${a}_mod`]})</div>
          </div>
        ))}
      </div>
      {[["Saves", props.saving_throws], ["Skills", props.skills_text], ["Senses", props.senses], ["Languages", props.languages],
        ["Immunities", props.immunities], ["Resistances", props.resistances]].filter(([, v]) => v).map(([label, value]) => (
        <div key={label} className="mc_row"><b>{label}</b> {value}</div>
      ))}
      {traits.length > 0 && <div className="mc_row"><b>Traits</b> {traits.map((t) => t.name).join(", ")}</div>}
      {actions.length > 0 && <div className="mc_row"><b>Actions</b> {actions.map((a) => a.name).join(", ")}</div>}
    </div>
  );
};

export default function App({ Api, additionalArguments }) {
  const { data: monsters, loading, error, load } = useSourceData(Api, "bestiarySources", "dnd5e_bestiary_", (d) => d.monster);
  const [filters, setFilters] = React.useState({ query: "", type: "", cr: "", edition: "" });
  const [selected, setSelected] = React.useState(null);
  const mapContext = React.useMemo(() => readMapContext(additionalArguments), [additionalArguments]);

  React.useEffect(() => { load(); }, [load]);

  const options = React.useMemo(() => filterOptions(monsters ?? []), [monsters]);
  const results = React.useMemo(() => searchMonsters(monsters ?? [], filters), [monsters, filters]);
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const create = () => {
    if (!selected) return;
    Api.FireAction("dnd5e/create_monster_from_srd", {
      name: selected.name,
      props: monsterToProps(selected),
      // Always sent, so the action's If can rely on it (see the item creator).
      hasMapContext: mapContext ? "true" : "false",
      ...(mapContext ? { battleMapId: mapContext.battleMapId, position: mapContext.position } : {}),
    });
    Api.Close?.();
  };

  return (
    <div className="mc_app">
      <header className="mc_header">
        <h1>5E Monster Creator</h1>
      </header>
      <div className="mc_filters">
        <input placeholder="Search monsters…" value={filters.query} onChange={set("query")} autoFocus />
        <select value={filters.type} onChange={set("type")}>
          <option value="">All types</option>
          {options.types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.cr} onChange={set("cr")}>
          <option value="">Any CR</option>
          {options.crs.map((cr) => <option key={cr} value={cr}>CR {cr}</option>)}
        </select>
        {options.editions.length > 1 && (
          <select value={filters.edition} onChange={set("edition")}>
            <option value="">All editions</option>
            {options.editions.map((e) => <option key={e} value={e}>SRD {e}</option>)}
          </select>
        )}
      </div>
      <div className="mc_body">
        <div className="mc_list">
          {loading && <div className="mc_muted">Loading bestiary sources…</div>}
          {error && <div className="mc_error">Error: {error}</div>}
          {!loading && monsters?.length === 0 && (
            <div className="mc_muted">No monsters. Add a Bestiary source (e.g. + SRD 5.2) in 5E Settings and sync it.</div>
          )}
          {results.slice(0, MAX_RESULTS).map((m, i) => (
            <div
              key={`${m.name}|${m.source}|${i}`}
              className={`mc_list_row${selected === m ? " active" : ""}`}
              onClick={() => setSelected(m)}
            >
              <span>{m.name}</span>
              <span className="mc_muted">
                CR {crOf(m)} · {typeName(m)}{m.srdEditions?.length ? ` · SRD ${m.srdEditions.join("/")}` : ` · ${m.source ?? ""}`}
              </span>
            </div>
          ))}
          {results.length > MAX_RESULTS && <div className="mc_muted">…and {results.length - MAX_RESULTS} more; narrow the search.</div>}
        </div>
        <div className="mc_detail">
          {!selected && <div className="mc_muted">Pick a monster to see its stats.</div>}
          {selected && (
            <>
              <Preview monster={selected} />
              <button className="mc_create" onClick={create}>
                {mapContext ? "Create card and place token" : "Create monster card"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
