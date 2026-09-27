import React from "react";
import { FaSearch } from "react-icons/fa";
import { usePropertyList } from "../../hooks/usePropertyList";
import { useResourceData } from "../../hooks/useResourceData";
import { mkId } from "../srdHelpers";

const LanguageSearchPanel = ({ langData, loading, onAdd, onClose }) => {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = React.useMemo(() => {
    if (!Array.isArray(langData)) return [];
    // One entry per name, preferring the PHB/XPHB version.
    const byName = {};
    for (const lang of langData) {
      if (!byName[lang.name] || ["XPHB", "PHB"].includes(lang.source)) byName[lang.name] = lang;
    }
    const sorted = Object.values(byName).sort((a, b) => {
      const order = { standard: 0, exotic: 1, rare: 2, secret: 3 };
      const ra = order[a.type] ?? 4;
      const rb = order[b.type] ?? 4;
      return ra === rb ? a.name.localeCompare(b.name) : ra - rb;
    });
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter((lang) => lang.name.toLowerCase().includes(q));
  }, [langData, query]);

  return (
    <div className="dnd5e_lang_search_panel">
      <div className="dnd5e_lang_search_bar">
        <input
          ref={inputRef}
          className="dnd5e_lang_search_input"
          placeholder="Search languages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="dnd5e_profs_close_btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="dnd5e_lang_results">
        {loading && <div className="dnd5e_lang_status">Loading…</div>}
        {!loading && results.length === 0 && <div className="dnd5e_lang_status">No results</div>}
        {results.slice(0, 30).map((lang) => (
          <div key={lang.name} className="dnd5e_lang_result_row" onClick={() => onAdd(lang)}>
            <span className="dnd5e_lang_result_name">{lang.name}</span>
            <span className={`dnd5e_lang_type_badge dnd5e_lang_type_${lang.type || "standard"}`}>{lang.type || "std"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddChipRow = ({ placeholder, onAdd }) => {
  const [value, setValue] = React.useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
  };

  return (
    <div className="dnd5e_profs_add_row">
      <input
        className="dnd5e_profs_input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <button className="dnd5e_profs_add_btn" onClick={submit}>
        +
      </button>
    </div>
  );
};

export const ProficienciesLanguages5E = ({ Api }) => {
  const [languages, , addLanguage, removeLanguage] = usePropertyList([Api, "languages", true]);
  const [proficiencies, , addProficiency, removeProficiency] = usePropertyList([Api, "proficiencies", true]);
  const { items: langData, loading, load } = useResourceData(Api, "dnd5e_languages", (d) => d.language ?? d.item ?? d);
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="dnd5e_profs_container">
      <div className="dnd5e_profs_section">
        <div className="dnd5e_profs_toolbar">
          <span className="dnd5e_profs_title">Languages</span>
          <button
            className="dnd5e_profs_search_btn"
            title="Search SRD languages"
            onClick={() => {
              load();
              setSearchOpen(true);
            }}
          >
            <FaSearch />
          </button>
        </div>
        {searchOpen && (
          <LanguageSearchPanel
            langData={langData}
            loading={loading}
            onAdd={(lang) => {
              addLanguage({ id: mkId(), name: lang.name, type: lang.type || "standard", source: lang.source });
              setSearchOpen(false);
            }}
            onClose={() => setSearchOpen(false)}
          />
        )}
        <div className="dnd5e_chips_list">
          {languages.map((lang, index) => (
            <span key={lang.id ?? index} className={`dnd5e_chip dnd5e_chip_${lang.type || "standard"}`}>
              {lang.name}
              <button className="dnd5e_chip_remove" onClick={() => removeLanguage(index)}>
                ×
              </button>
            </span>
          ))}
        </div>
        <AddChipRow placeholder="Custom language…" onAdd={(name) => addLanguage({ id: mkId(), name, type: "custom" })} />
      </div>
      <div className="dnd5e_profs_section">
        <div className="dnd5e_profs_toolbar">
          <span className="dnd5e_profs_title">Proficiencies</span>
        </div>
        <div className="dnd5e_chips_list">
          {proficiencies.map((prof, index) => (
            <span key={prof.id ?? index} className="dnd5e_chip">
              {prof.name}
              <button className="dnd5e_chip_remove" onClick={() => removeProficiency(index)}>
                ×
              </button>
            </span>
          ))}
        </div>
        <AddChipRow placeholder="Add proficiency…" onAdd={(name) => addProficiency({ id: mkId(), name })} />
      </div>
    </div>
  );
};
