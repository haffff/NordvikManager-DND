import React from "react";
import { FaSearch, FaPlus, FaMinus, FaAngleRight, FaAngleDown, FaStopwatch } from "react-icons/fa";
import { usePropertyList } from "../../hooks/usePropertyList";
import { useCounters } from "../../hooks/useCounters";
import { linkedCounter, counterForFeat, showsPips } from "../counters";
import { useFeatsData } from "../../hooks/useFeatsData";
import { featFromSrd, customFeat, searchFeats, categoryLabel, prerequisiteText } from "../feats";

const FeatSearchPanel = ({ featData, loading, error, onAdd, onClose }) => {
  const [query, setQuery] = React.useState("");
  const [edition, setEdition] = React.useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const editions = React.useMemo(
    () => (featData ? [...new Set(featData.flatMap((f) => f.srdEditions ?? []))].sort() : []),
    [featData]
  );
  const results = React.useMemo(() => (featData ? searchFeats(featData, query, edition).slice(0, 60) : []), [featData, query, edition]);

  return (
    <div className="dnd5e_item_search_panel">
      <div className="dnd5e_item_search_bar">
        <FaSearch className="dnd5e_item_search_icon" />
        <input
          ref={inputRef}
          className="dnd5e_item_search_input"
          placeholder="Search feats…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="dnd5e_inventory_edit_btn" onClick={onClose}>
          ✕
        </button>
      </div>
      {editions.length > 1 && (
        <div className="dnd5e_spell_filter_row">
          <button className={edition === "" ? "dnd5e_spell_filter_btn active" : "dnd5e_spell_filter_btn"} onClick={() => setEdition("")}>
            All
          </button>
          {editions.map((e) => (
            <button
              key={e}
              className={edition === e ? "dnd5e_spell_filter_btn active" : "dnd5e_spell_filter_btn"}
              onClick={() => setEdition(edition === e ? "" : e)}
            >
              SRD {e}
            </button>
          ))}
        </div>
      )}
      <div className="dnd5e_item_search_results">
        {loading && <div className="dnd5e_item_search_empty">Loading feat sources…</div>}
        {error && <div className="dnd5e_item_search_empty">Error: {error}</div>}
        {!loading && !error && results.length === 0 && (
          <div className="dnd5e_item_search_empty">No feats found. Add a feat source in the addon settings.</div>
        )}
        {results.map((feat, i) => (
          <div key={feat.name + (feat.source ?? "") + i} className="dnd5e_item_search_result" onClick={() => onAdd(feat)}>
            <span className="dnd5e_item_search_result_name">{feat.name}</span>
            <div className="dnd5e_item_search_result_tags">
              {feat.category && <span className="dnd5e_spell_search_school">{categoryLabel(feat.category)}</span>}
              {feat.prerequisite && <span className="dnd5e_spell_search_level">{prerequisiteText(feat.prerequisite)}</span>}
              <span className="dnd5e_spell_search_src">{feat.srdEditions?.length ? `SRD ${feat.srdEditions.join("/")}` : feat.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// The feat's counter (Counters tab) at a glance; clicking it shows the counter.
const FeatCounterChip = ({ counter, onClick }) => (
  <button
    className={`dnd5e_feat_counter${counter.roundsLeft > 0 ? " active" : ""}`}
    title="Show its counter"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
  >
    {showsPips(counter) ? (
      <span className="dnd5e_ctr_pips" aria-hidden="true">
        {Array.from({ length: counter.max }, (_, i) => (
          <span key={i} className={`dnd5e_ctr_pip${i < counter.current ? " filled" : ""}`} />
        ))}
      </span>
    ) : (
      <span>{counter.current}{counter.max > 0 ? ` / ${counter.max}` : ""}</span>
    )}
    {counter.roundsLeft > 0 && <span><FaStopwatch /> {counter.roundsLeft}</span>}
  </button>
);

export const Feats5E = ({ Api, focus, onShowCounter }) => {
  const [feats, , addFeat, removeFeat, updateFeat] = usePropertyList([Api, "feats", true]);
  const [counters, applyCounters] = useCounters(Api);

  // Starts a counter for the feat and shows it.
  const trackUses = (feat) => {
    const counter = counterForFeat(feat);
    applyCounters((list) => [...list, counter]);
    onShowCounter?.(counter.id);
  };
  const { feats: featData, loading, error, load } = useFeatsData(Api);
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
          <FaSearch /> Search Feats
        </button>
        <button
          className="dnd5e_inventory_add_btn"
          title="Add custom feat"
          onClick={() => {
            addFeat(customFeat(""));
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
        <FeatSearchPanel
          featData={featData}
          loading={loading}
          error={error}
          onAdd={(feat) => {
            addFeat(featFromSrd(feat));
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {feats.length === 0 && !searchOpen && (
        <div className="dnd5e_inventory_empty">
          <span>No feats yet.</span>
          <span className="dnd5e_inventory_empty_sub">Search the feat sources or add a custom feat above.</span>
        </div>
      )}
      {feats.length > 0 && (
        <div className="dnd5e_spells_body">
          {feats.map((feat, index) => (
            <FeatRow
              key={feat.id ?? "feat_" + index}
              feat={feat}
              index={index}
              edit={edit}
              removeFeat={removeFeat}
              updateFeat={updateFeat}
              counter={linkedCounter(counters, feat)}
              focused={focus?.id === feat.id ? focus.at : null}
              onShowCounter={onShowCounter}
              onTrackUses={() => trackUses(feat)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeatRow = ({ feat, index, edit, removeFeat, updateFeat, counter, focused, onShowCounter, onTrackUses }) => {
  const [expanded, setExpanded] = React.useState(false);
  // Shown from its counter: opened once per jump (then it's the user's to close), and scrolled to.
  const [openedFor, setOpenedFor] = React.useState(null);
  if (focused && focused !== openedFor) {
    setOpenedFor(focused);
    setExpanded(true);
  }
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (focused) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused]);
  const [name, setName] = React.useState(feat.name);
  const [description, setDescription] = React.useState(feat.description ?? "");
  const [notes, setNotes] = React.useState(feat.notes ?? "");

  const save = (overrides = {}) => updateFeat(index, { ...feat, name, description, notes, ...overrides });

  return (
    <div ref={ref} className={`dnd5e_spell_row_wrap${focused ? " focused" : ""}`}>
      <div className="dnd5e_spell_row">
        <div className="dnd5e_spell_col_name">
          {edit ? (
            <input value={name} placeholder="Feat name" onChange={(e) => setName(e.target.value)} onBlur={() => save()} />
          ) : (
            <span className="dnd5e_spell_name_btn" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <FaAngleDown /> : <FaAngleRight />}
              {name || <em>unnamed</em>}
            </span>
          )}
        </div>
        <div className="dnd5e_spell_col_school">{feat.category && <span>{feat.category}</span>}</div>
        <div className="dnd5e_spell_col_duration">
          <span>{feat.source}</span>
        </div>
        {!edit && feat.id && (
          counter ? (
            <FeatCounterChip counter={counter} onClick={() => onShowCounter?.(counter.id)} />
          ) : (
            <button className="dnd5e_feat_counter ghost" title="Start a counter for this feat" onClick={onTrackUses}>
              <FaPlus /> Track uses
            </button>
          )
        )}
        {edit && (
          <button className="dnd5e_remove_btn" onClick={() => removeFeat(index)}>
            <FaMinus />
          </button>
        )}
      </div>
      {(expanded || edit) && (
        <div className="dnd5e_spell_accordion">
          {feat.prerequisite && (
            <div className="dnd5e_spell_acc_row">
              <span className="dnd5e_spell_acc_label">Prerequisite</span>
              <span>{feat.prerequisite}</span>
            </div>
          )}
          {edit && feat.source === "Custom" ? (
            <textarea
              className="dnd5e_feat_textarea"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => save()}
            />
          ) : (
            description && <p className="dnd5e_spell_acc_desc dnd5e_feat_desc">{description}</p>
          )}
          <div className="dnd5e_spell_acc_row">
            <span className="dnd5e_spell_acc_label">Notes</span>
          </div>
          <textarea
            className="dnd5e_feat_textarea"
            placeholder="Your notes (choices made, e.g. the ability or spells picked)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => save()}
          />
        </div>
      )}
    </div>
  );
};
