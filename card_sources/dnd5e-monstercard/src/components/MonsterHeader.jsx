import React from "react";
import { useProperty } from "../../hooks/useProperty";

const SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const TYPES = ["aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"];
const ALIGNMENTS = ["unaligned", "lawful good", "neutral good", "chaotic good", "lawful neutral", "neutral", "chaotic neutral", "lawful evil", "neutral evil", "chaotic evil", "any alignment", "any non-good", "any non-lawful", "any chaotic"];

export const MonsterHeader = ({ Api }) => {
  const [name, setName] = useProperty([Api, "monster_name", ""]);
  const [nameDraft, setNameDraft] = React.useState("");
  const [type, setType] = useProperty([Api, "monster_type", "humanoid"]);
  const [subtype, setSubtype] = useProperty([Api, "monster_subtype", ""]);
  const [subtypeDraft, setSubtypeDraft] = React.useState("");
  const [size, setSize] = useProperty([Api, "monster_size", "Medium"]);
  const [alignment, setAlignment] = useProperty([Api, "monster_alignment", "unaligned"]);
  const [cr, setCr] = useProperty([Api, "cr", "1"]);
  const [crDraft, setCrDraft] = React.useState("");

  React.useEffect(() => { setNameDraft(name ?? ""); }, [name]);
  React.useEffect(() => { setSubtypeDraft(subtype ?? ""); }, [subtype]);
  React.useEffect(() => { setCrDraft(cr ?? "1"); }, [cr]);

  return (
    <div className="monster_header dnd-panel">
      <div className="monster_name_row">
        <input
          className="monster_name_input dnd5e_text_value"
          type="text"
          placeholder="Monster Name"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => { if (nameDraft !== (name ?? "")) setName(nameDraft); }}
        />
        <div className="monster_cr_box">
          <div className="dnd5e_text_name">CR</div>
          <input
            className="dnd5e_attribute_value"
            type="text"
            value={crDraft}
            onChange={(e) => setCrDraft(e.target.value)}
            onBlur={() => { if (crDraft !== (cr ?? "1")) setCr(crDraft); }}
          />
        </div>
      </div>
      <div className="monster_meta_row">
        <select className="monster_meta_select" value={size ?? "Medium"} onChange={(e) => setSize(e.target.value)}>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="monster_meta_select" value={type ?? "humanoid"} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          className="monster_subtype_input dnd5e_text_value"
          type="text"
          placeholder="subtype (optional)"
          value={subtypeDraft}
          onChange={(e) => setSubtypeDraft(e.target.value)}
          onBlur={() => { if (subtypeDraft !== (subtype ?? "")) setSubtype(subtypeDraft); }}
        />
        <select className="monster_meta_select" value={alignment ?? "unaligned"} onChange={(e) => setAlignment(e.target.value)}>
          {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
};
