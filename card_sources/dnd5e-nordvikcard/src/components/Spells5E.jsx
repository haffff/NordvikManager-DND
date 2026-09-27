import React from "react";
import { FaSearch, FaPlus, FaMinus, FaAngleRight, FaAngleDown } from "react-icons/fa";
import { usePropertyList } from "../../hooks/usePropertyList";
import { useSpellsData } from "../../hooks/useSpellsData";
import { SCHOOL_LABEL, stripTags, spellFromSrd, mkId } from "../srdHelpers";

const SPELL_LEVELS = ["Cantrip", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

// Parses a spell's "Action args" JSON; anything that isn't a plain object is ignored.
const parseActionArgs = (str) => {
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) return parsed;
  } catch {}
  return {};
};

const SpellSearchPanel = ({ spellData, loading, error, onAdd, onClose }) => {
  const [query, setQuery] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState(null);
  const [schoolFilter, setSchoolFilter] = React.useState(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = React.useMemo(() => {
    if (!spellData) return [];
    let list = spellData;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (levelFilter !== null) list = list.filter((s) => (s.level ?? 0) === levelFilter);
    if (schoolFilter !== null) list = list.filter((s) => s.school === schoolFilter);
    return list
      .slice()
      .sort((a, b) => ((a.level ?? 0) === (b.level ?? 0) ? a.name.localeCompare(b.name) : (a.level ?? 0) - (b.level ?? 0)))
      .slice(0, 40);
  }, [spellData, query, levelFilter, schoolFilter]);

  const schools = React.useMemo(
    () => (spellData ? [...new Set(spellData.map((s) => s.school).filter(Boolean))].sort() : []),
    [spellData]
  );

  return (
    <div className="dnd5e_item_search_panel">
      <div className="dnd5e_item_search_bar">
        <FaSearch className="dnd5e_item_search_icon" />
        <input
          ref={inputRef}
          className="dnd5e_item_search_input"
          placeholder="Search spells…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="dnd5e_inventory_edit_btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="dnd5e_spell_filter_row">
        <button
          className={levelFilter === null ? "dnd5e_spell_filter_btn active" : "dnd5e_spell_filter_btn"}
          onClick={() => setLevelFilter(null)}
        >
          All
        </button>
        {SPELL_LEVELS.map((label, level) => (
          <button
            key={level}
            className={levelFilter === level ? "dnd5e_spell_filter_btn active" : "dnd5e_spell_filter_btn"}
            onClick={() => setLevelFilter(levelFilter === level ? null : level)}
          >
            {label}
          </button>
        ))}
      </div>
      {schools.length > 0 && (
        <div className="dnd5e_spell_filter_row">
          <button
            className={schoolFilter === null ? "dnd5e_spell_filter_btn active" : "dnd5e_spell_filter_btn"}
            onClick={() => setSchoolFilter(null)}
          >
            All Schools
          </button>
          {schools.map((school) => (
            <button
              key={school}
              className={schoolFilter === school ? "dnd5e_spell_filter_btn active" : "dnd5e_spell_filter_btn"}
              onClick={() => setSchoolFilter(schoolFilter === school ? null : school)}
            >
              {SCHOOL_LABEL[school] ?? school}
            </button>
          ))}
        </div>
      )}
      <div className="dnd5e_item_search_results">
        {loading && <div className="dnd5e_item_search_empty">Loading spell sources…</div>}
        {error && <div className="dnd5e_item_search_empty">Error: {error}</div>}
        {!loading && !error && results.length === 0 && <div className="dnd5e_item_search_empty">No spells found</div>}
        {results.map((spell, i) => (
          <div key={spell.name + (spell.source ?? "") + i} className="dnd5e_item_search_result" onClick={() => onAdd(spell)}>
            <span className="dnd5e_item_search_result_name">{spell.name}</span>
            <div className="dnd5e_item_search_result_tags">
              <span className="dnd5e_spell_search_level">{SPELL_LEVELS[parseInt(spell.level ?? 0, 10)]}</span>
              <span className="dnd5e_spell_search_school">{SCHOOL_LABEL[spell.school] ?? spell.school}</span>
              {spell.meta?.ritual && <span className="dnd5e_spell_search_badge">R</span>}
              {spell.duration?.[0]?.concentration && (
                <span className="dnd5e_spell_search_badge dnd5e_spell_search_badge_conc">C</span>
              )}
              {spell.source && <span className="dnd5e_spell_search_src">{spell.source}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Spells5E = ({ Api }) => {
  const [spells, , addSpell, removeSpell, updateSpell] = usePropertyList([Api, "spells", true]);
  const { spells: spellData, loading, error, load } = useSpellsData(Api);
  const [edit, setEdit] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="dnd5e_spells_container">
      <div className="dnd5e_inventory_toolbar">
        <button
          className="dnd5e_inventory_search_btn"
          onClick={() => {
            load();
            setSearchOpen(true);
          }}
        >
          <FaSearch /> Search Spells
        </button>
        <button
          className="dnd5e_inventory_add_btn"
          title="Add blank spell"
          onClick={() => {
            addSpell({
              id: mkId(),
              name: "",
              level: "1",
              school: "V",
              castingTime: "1 action",
              range: "60 ft.",
              duration: "Instantaneous",
              components: "",
              concentration: false,
              ritual: false,
              prepared: false,
              action: "",
              actionArgs: "",
              description: "",
              descHigher: "",
            });
            setEdit(true);
          }}
        >
          <FaPlus />
        </button>
        <button className="dnd5e_inventory_edit_btn" onClick={() => setEdit((v) => !v)}>
          {edit ? "✓ Done" : "Edit"}
        </button>
      </div>
      {searchOpen && (
        <SpellSearchPanel
          spellData={spellData}
          loading={loading}
          error={error}
          onAdd={(spell) => {
            addSpell(spellFromSrd(spell));
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {spells.length === 0 && !searchOpen && (
        <div className="dnd5e_inventory_empty">
          <span>No spells yet.</span>
          <span className="dnd5e_inventory_empty_sub">Search the SRD or add a blank spell above.</span>
        </div>
      )}
      {spells.length > 0 && (
        <div className="dnd5e_spells_body">
          <div className="dnd5e_spell_header">
            <div className="dnd5e_spell_col_prep">Prep</div>
            <div className="dnd5e_spell_col_name">Name</div>
            <div className="dnd5e_spell_col_level">Lvl</div>
            <div className="dnd5e_spell_col_school">School</div>
            <div className="dnd5e_spell_col_time">Cast Time</div>
            <div className="dnd5e_spell_col_range">Range</div>
            <div className="dnd5e_spell_col_duration">Duration</div>
            <div className="dnd5e_spell_col_action">{edit ? "Action / Args" : "Action"}</div>
            {edit && <div style={{ width: "28px", flexShrink: 0 }} />}
          </div>
          {spells.map((spell, index) => (
            <SpellRow
              key={spell.id ?? "spell_" + index}
              spell={spell}
              index={index}
              edit={edit}
              removeSpell={removeSpell}
              updateSpell={updateSpell}
              Api={Api}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SpellRow = ({ Api, spell, index, edit, removeSpell, updateSpell }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [name, setName] = React.useState(spell.name);
  const [level, setLevel] = React.useState(spell.level ?? "0");
  const [school, setSchool] = React.useState(spell.school ?? "V");
  const [prepared, setPrepared] = React.useState(spell.prepared ?? false);
  const [castingTime, setCastingTime] = React.useState(spell.castingTime ?? "1 action");
  const [range, setRange] = React.useState(spell.range ?? "");
  const [duration, setDuration] = React.useState(spell.duration ?? "");
  const [action, setAction] = React.useState(spell.action ?? "");
  const [actionArgs, setActionArgs] = React.useState(spell.actionArgs ?? "");

  const save = (overrides = {}) =>
    updateSpell(index, {
      ...spell,
      name,
      level,
      school,
      prepared,
      castingTime,
      range,
      duration,
      action,
      actionArgs,
      ...overrides,
    });

  const schoolLabel = SCHOOL_LABEL[school] ?? school;
  const levelLabel = SPELL_LEVELS[parseInt(level, 10)] ?? level;
  const concentration = spell.concentration;
  const ritual = spell.ritual;

  return (
    <div className={`dnd5e_spell_row_wrap${prepared ? " dnd5e_spell_prepared" : ""}`}>
      <div className="dnd5e_spell_row">
        <div className="dnd5e_spell_col_prep">
          <input
            type="checkbox"
            checked={prepared}
            onChange={(e) => {
              setPrepared(e.target.checked);
              save({ prepared: e.target.checked });
            }}
          />
        </div>
        <div className="dnd5e_spell_col_name">
          {edit ? (
            <input value={name} placeholder="Spell name" onChange={(e) => setName(e.target.value)} onBlur={() => save()} />
          ) : (
            <span className="dnd5e_spell_name_btn" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <FaAngleDown /> : <FaAngleRight />}
              {name || <em>unnamed</em>}
              {concentration && <span className="dnd5e_spell_tag dnd5e_spell_tag_conc">C</span>}
              {ritual && <span className="dnd5e_spell_tag dnd5e_spell_tag_ritual">R</span>}
            </span>
          )}
        </div>
        <div className="dnd5e_spell_col_level">
          {edit ? <input value={level} onChange={(e) => setLevel(e.target.value)} onBlur={() => save()} /> : <span>{levelLabel}</span>}
        </div>
        <div className="dnd5e_spell_col_school">
          {edit ? <input value={school} onChange={(e) => setSchool(e.target.value)} onBlur={() => save()} /> : <span>{schoolLabel}</span>}
        </div>
        <div className="dnd5e_spell_col_time">
          {edit ? (
            <input value={castingTime} onChange={(e) => setCastingTime(e.target.value)} onBlur={() => save()} />
          ) : (
            <span>{castingTime}</span>
          )}
        </div>
        <div className="dnd5e_spell_col_range">
          {edit ? <input value={range} onChange={(e) => setRange(e.target.value)} onBlur={() => save()} /> : <span>{range}</span>}
        </div>
        <div className="dnd5e_spell_col_duration">
          {edit ? (
            <input value={duration} onChange={(e) => setDuration(e.target.value)} onBlur={() => save()} />
          ) : (
            <span>{duration}</span>
          )}
        </div>
        <div className="dnd5e_spell_col_action">
          {edit && (
            <>
              <input placeholder="Action name" value={action} onChange={(e) => setAction(e.target.value)} onBlur={() => save()} />
              <input
                placeholder='Args {"key":"val"}'
                value={actionArgs}
                onChange={(e) => setActionArgs(e.target.value)}
                onBlur={() => save()}
              />
            </>
          )}
          {!edit && (
            <button
              className="dnd5e_use_btn"
              onClick={() => {
                const payload = {
                  name,
                  level,
                  levelLabel,
                  school,
                  schoolLabel,
                  castingTime,
                  range,
                  duration,
                  concentration: concentration ?? false,
                  ritual: ritual ?? false,
                  components: spell.components ?? "",
                  prepared,
                  description: spell.description ?? "",
                  descHigher: spell.descHigher ?? "",
                  source: spell.source ?? "",
                };
                const actionName = action || "dnd5e/DisplaySpellDescription";
                Api.FireAction(actionName, { ...payload, ...parseActionArgs(actionArgs) });
              }}
            >
              Cast
            </button>
          )}
        </div>
        {edit && (
          <button className="dnd5e_remove_btn" onClick={() => removeSpell(index)}>
            <FaMinus />
          </button>
        )}
      </div>
      {expanded && !edit && (
        <div className="dnd5e_spell_accordion">
          {spell.components && (
            <div className="dnd5e_spell_acc_row">
              <span className="dnd5e_spell_acc_label">Components</span>
              <span>{spell.components}</span>
            </div>
          )}
          {spell.source && (
            <div className="dnd5e_spell_acc_row">
              <span className="dnd5e_spell_acc_label">Source</span>
              <span>{spell.source}</span>
            </div>
          )}
          {spell.description && <p className="dnd5e_spell_acc_desc">{stripTags(spell.description)}</p>}
          {spell.descHigher && (
            <p className="dnd5e_spell_acc_higher">
              <strong>At Higher Levels.</strong> {stripTags(spell.descHigher)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
