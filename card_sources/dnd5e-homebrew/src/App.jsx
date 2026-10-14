import React from "react";
import { ITEM_TYPE_LABEL, DMGTYPE_LABEL, SCHOOL_LABEL } from "../../dnd5e-nordvikcard/src/srdHelpers.js";
import { categoryLabel } from "../../dnd5e-nordvikcard/src/feats.js";
import { SIZE_NAME, ALIGNMENTS, MONSTER_TYPES } from "../../dnd5e-monstercard/src/monsterData.js";
import {
  KINDS, WEAPON_TYPES, ARMOR_TYPES, ABILITIES, SPEEDS, ACTION_KINDS, newAction,
  newForm, toEntry, toForm, validate, upsertEntry, removeEntry, exportFile, importFile,
} from "./homebrew.js";
import { visibleEntries, viewerIsGM } from "../../dnd5e-nordvikcard/src/sourceKeys.js";
import "./App.css";

const RARITIES = ["none", "common", "uncommon", "rare", "very rare", "legendary", "artifact"];
const FEAT_CATEGORIES = ["G", "O", "FS", "EB"];
const LANGUAGE_TYPES = ["standard", "rare", "exotic", "secret"];
const TIME_UNITS = ["action", "bonus", "reaction", "minute", "hour"];
const RANGE_KINDS = { feet: "Feet", self: "Self", touch: "Touch", sight: "Sight", unlimited: "Unlimited" };
const DURATION_KINDS = { instant: "Instantaneous", timed: "Timed", permanent: "Until dispelled" };
const DURATION_UNITS = ["round", "minute", "hour", "day"];
const EMPTY_LISTS = { item: [], spell: [], feat: [], language: [] };

const parseResource = async (data) => {
  if (!data) return null;
  if (data instanceof Blob) return JSON.parse(await data.text());
  if (typeof data === "string") return JSON.parse(data);
  return data;
};

// ── Form controls ─────────────────────────────────────────────────────────────

const Field = ({ label, error, children, wide }) => (
  <label className={`hb_field${wide ? " hb_field_wide" : ""}`}>
    <span className="hb_label">{label}</span>
    {children}
    {error && <span className="hb_error">{error}</span>}
  </label>
);

const Text = ({ form, set, name, ...rest }) => (
  <input type="text" value={form[name]} onChange={(e) => set(name, e.target.value)} {...rest} />
);
const Check = ({ form, set, name, label }) => (
  <label className="hb_check">
    <input type="checkbox" checked={!!form[name]} onChange={(e) => set(name, e.target.checked)} /> {label}
  </label>
);
const Select = ({ form, set, name, options }) => (
  <select value={form[name]} onChange={(e) => set(name, e.target.value)}>
    {Object.entries(options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
  </select>
);
const Area = ({ form, set, name, ...rest }) => (
  <textarea value={form[name]} onChange={(e) => set(name, e.target.value)} {...rest} />
);
const asOptions = (values, label = (v) => v) => Object.fromEntries(values.map((v) => [v, label(v)]));

const ItemForm = ({ form, set, errors }) => (
  <>
    <Field label="Type"><Select form={form} set={set} name="type" options={ITEM_TYPE_LABEL} /></Field>
    <Field label="Rarity"><Select form={form} set={set} name="rarity" options={asOptions(RARITIES)} /></Field>
    <Field label="Weight (lb.)" error={errors.weight}><Text form={form} set={set} name="weight" inputMode="decimal" /></Field>
    <Field label="Value (gp)" error={errors.valueGp}><Text form={form} set={set} name="valueGp" inputMode="decimal" /></Field>
    <Check form={form} set={set} name="attunement" label="Requires attunement" />
    {WEAPON_TYPES.includes(form.type) && (
      <>
        <Field label="Category"><Select form={form} set={set} name="weaponCategory" options={{ "": "—", simple: "Simple", martial: "Martial" }} /></Field>
        <Field label="Damage"><Text form={form} set={set} name="dmg1" placeholder="1d8" /></Field>
        <Field label="Damage type"><Select form={form} set={set} name="dmgType" options={{ "": "—", ...DMGTYPE_LABEL }} /></Field>
      </>
    )}
    {ARMOR_TYPES.includes(form.type) && (
      <Field label="Armor class" error={errors.ac}><Text form={form} set={set} name="ac" inputMode="numeric" /></Field>
    )}
    <Field label="Description (blank line between paragraphs)" wide><Area form={form} set={set} name="description" rows={6} /></Field>
  </>
);

const SpellForm = ({ form, set, errors }) => (
  <>
    <Field label="Level" error={errors.level}>
      <Select form={form} set={set} name="level" options={asOptions(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], (l) => (l === "0" ? "Cantrip" : l))} />
    </Field>
    <Field label="School"><Select form={form} set={set} name="school" options={SCHOOL_LABEL} /></Field>
    <Field label="Casting time" error={errors.timeAmount}>
      <span className="hb_row">
        <Text form={form} set={set} name="timeAmount" inputMode="numeric" className="hb_short" />
        <Select form={form} set={set} name="timeUnit" options={asOptions(TIME_UNITS)} />
      </span>
    </Field>
    <Field label="Range" error={errors.rangeFeet}>
      <span className="hb_row">
        <Select form={form} set={set} name="rangeKind" options={RANGE_KINDS} />
        {form.rangeKind === "feet" && <Text form={form} set={set} name="rangeFeet" inputMode="numeric" className="hb_short" />}
      </span>
    </Field>
    <Field label="Duration" error={errors.durationAmount}>
      <span className="hb_row">
        <Select form={form} set={set} name="durationKind" options={DURATION_KINDS} />
        {form.durationKind === "timed" && (
          <>
            <Text form={form} set={set} name="durationAmount" inputMode="numeric" className="hb_short" />
            <Select form={form} set={set} name="durationUnit" options={asOptions(DURATION_UNITS)} />
          </>
        )}
      </span>
    </Field>
    <span className="hb_row">
      <Check form={form} set={set} name="concentration" label="Concentration" />
      <Check form={form} set={set} name="ritual" label="Ritual" />
    </span>
    <span className="hb_row hb_field_wide">
      <span className="hb_label">Components</span>
      <Check form={form} set={set} name="v" label="V" />
      <Check form={form} set={set} name="s" label="S" />
      <Check form={form} set={set} name="m" label="M" />
      {form.m && <Text form={form} set={set} name="material" placeholder="Material (optional)" />}
    </span>
    <Field label="Description" wide><Area form={form} set={set} name="description" rows={6} /></Field>
    <Field label="At higher levels" wide><Area form={form} set={set} name="higher" rows={2} /></Field>
  </>
);

const FeatForm = ({ form, set }) => (
  <>
    <Field label="Category"><Select form={form} set={set} name="category" options={{ "": "—", ...asOptions(FEAT_CATEGORIES, categoryLabel) }} /></Field>
    <Field label="Prerequisite"><Text form={form} set={set} name="prerequisite" placeholder="e.g. Level 4+, Strength 13+" /></Field>
    <Check form={form} set={set} name="repeatable" label="Can be taken more than once" />
    <Field label="Description" wide><Area form={form} set={set} name="description" rows={6} /></Field>
  </>
);

const LanguageForm = ({ form, set }) => (
  <>
    <Field label="Type"><Select form={form} set={set} name="type" options={asOptions(LANGUAGE_TYPES, (t) => t[0].toUpperCase() + t.slice(1))} /></Field>
    <Field label="Script"><Text form={form} set={set} name="script" /></Field>
    <Field label="Typical speakers (comma separated)" wide><Text form={form} set={set} name="typicalSpeakers" /></Field>
  </>
);

// ── Monsters ──────────────────────────────────────────────────────────────────

const ACTION_TYPES = { attack: "Attack", save: "Saving throw", other: "Other" };
const SAVE_ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

// One row of a list field (traits, actions): its own fields, edited through `change`.
const RowText = ({ row, change, name, ...rest }) => (
  <input type="text" value={row[name] ?? ""} onChange={(e) => change({ ...row, [name]: e.target.value })} {...rest} />
);
const RowSelect = ({ row, change, name, options }) => (
  <select value={row[name] ?? ""} onChange={(e) => change({ ...row, [name]: e.target.value })}>
    {Object.entries(options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
  </select>
);

const ListField = ({ label, rows, onChange, newRow, renderRow }) => (
  <div className="hb_field_wide hb_list_field">
    <div className="hb_row">
      <span className="hb_label">{label}</span>
      <button onClick={() => onChange([...rows, newRow()])}>+ Add</button>
    </div>
    {rows.map((row, i) => (
      <div key={i} className="hb_list_item">
        {renderRow(row, (next) => onChange(rows.map((r, j) => (j === i ? next : r))))}
        <button className="hb_btn_danger" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
      </div>
    ))}
  </div>
);

const ActionRow = ({ row, change }) => (
  <>
    <span className="hb_row">
      <RowSelect row={row} change={change} name="kind" options={ACTION_KINDS} />
      <RowText row={row} change={change} name="name" placeholder="Name" />
      <RowSelect row={row} change={change} name="type" options={ACTION_TYPES} />
      <RowText row={row} change={change} name="recharge" placeholder="Recharge (e.g. 5–6)" className="hb_short" />
    </span>
    {row.type === "attack" && (
      <span className="hb_row">
        <RowText row={row} change={change} name="attackBonus" placeholder="+4" className="hb_short" />
        <RowText row={row} change={change} name="reach" placeholder="Reach (5 ft.)" />
        <RowText row={row} change={change} name="range" placeholder="Range (80/320 ft.)" />
      </span>
    )}
    {row.type === "save" && (
      <span className="hb_row">
        <RowText row={row} change={change} name="saveDc" placeholder="DC" className="hb_short" />
        <RowSelect row={row} change={change} name="saveAbility" options={asOptions(["", ...SAVE_ABILITIES], (a) => a || "Ability")} />
        <RowText row={row} change={change} name="range" placeholder="Range / area" />
      </span>
    )}
    {row.type !== "other" && (
      <span className="hb_row">
        <RowText row={row} change={change} name="damage" placeholder="Damage (2d6 + 3)" />
        <RowText row={row} change={change} name="damageType" placeholder="Damage type" />
      </span>
    )}
    <textarea rows={2} value={row.description ?? ""} placeholder="Description (optional for attacks and saves)"
      onChange={(e) => change({ ...row, description: e.target.value })} />
  </>
);

const MonsterForm = ({ form, set, errors }) => (
  <>
    <Field label="Size"><Select form={form} set={set} name="size" options={SIZE_NAME} /></Field>
    <Field label="Type"><Select form={form} set={set} name="type" options={asOptions(MONSTER_TYPES)} /></Field>
    <Field label="Subtype / tags"><Text form={form} set={set} name="subtype" placeholder="e.g. goblinoid" /></Field>
    <Field label="Alignment"><Select form={form} set={set} name="alignment" options={asOptions(ALIGNMENTS)} /></Field>
    <Field label="CR"><Text form={form} set={set} name="cr" className="hb_short" placeholder="1/4" /></Field>
    <Field label="Armor class" error={errors.ac}><Text form={form} set={set} name="ac" className="hb_short" /></Field>
    <Field label="Hit points" error={errors.hp}>
      <span className="hb_row">
        <Text form={form} set={set} name="hp" className="hb_short" />
        <Text form={form} set={set} name="hpFormula" placeholder="Formula (3d6 + 3)" />
      </span>
    </Field>
    <span className="hb_row hb_field_wide">
      <span className="hb_label">Speed (ft.)</span>
      {SPEEDS.map((k) => (
        <label key={k} className="hb_check">
          {k} <Text form={form} set={set} name={k} className="hb_short" />
          {errors[k] && <span className="hb_error">{errors[k]}</span>}
        </label>
      ))}
    </span>
    <div className="hb_field_wide hb_abilities">
      {ABILITIES.map((a) => (
        <label key={a} className="hb_field">
          <span className="hb_label">{a.toUpperCase()}</span>
          <Text form={form} set={set} name={a} className="hb_short" />
          <Text form={form} set={set} name={`save_${a}`} className="hb_short" placeholder="save" />
          {errors[a] && <span className="hb_error">{errors[a]}</span>}
        </label>
      ))}
    </div>
    <Field label="Skills"><Text form={form} set={set} name="skills" placeholder="Stealth +6, Perception +4" /></Field>
    <Field label="Senses"><Text form={form} set={set} name="senses" placeholder="darkvision 60 ft." /></Field>
    <Field label="Passive Perception" error={errors.passive}><Text form={form} set={set} name="passive" className="hb_short" /></Field>
    <Field label="Languages"><Text form={form} set={set} name="languages" placeholder="Common, Goblin" /></Field>
    <Field label="Damage immunities"><Text form={form} set={set} name="immune" /></Field>
    <Field label="Damage resistances"><Text form={form} set={set} name="resist" /></Field>
    <Field label="Damage vulnerabilities"><Text form={form} set={set} name="vulnerable" /></Field>
    <Field label="Condition immunities"><Text form={form} set={set} name="conditionImmune" /></Field>
    <ListField
      label="Traits"
      rows={form.traits}
      onChange={(rows) => set("traits", rows)}
      newRow={() => ({ name: "", description: "" })}
      renderRow={(row, change) => (
        <>
          <RowText row={row} change={change} name="name" placeholder="Name" />
          <textarea rows={2} value={row.description} placeholder="Description" onChange={(e) => change({ ...row, description: e.target.value })} />
        </>
      )}
    />
    <ListField
      label="Actions"
      rows={form.actions}
      onChange={(rows) => set("actions", rows)}
      newRow={newAction}
      renderRow={(row, change) => <ActionRow row={row} change={change} />}
    />
  </>
);

const FORMS = { item: ItemForm, spell: SpellForm, feat: FeatForm, language: LanguageForm, monster: MonsterForm };

// ── One kind: list + editor ───────────────────────────────────────────────────

const KindEditor = ({ kind, list, isGM, onSaveList }) => {
  const [query, setQuery] = React.useState("");
  const [form, setForm] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const original = form?.hbId ? list.find((e) => e.hbId === form.hbId) : undefined;
  const FormFields = FORMS[kind];

  // Only the list shown is filtered: saving always writes the whole list, hidden entries included.
  const shown = visibleEntries(list, isGM)
    .filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const open = (next) => { setForm(next); setErrors({}); setConfirmDelete(false); };
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const save = async () => {
    const problems = validate(kind, form);
    setErrors(problems);
    if (Object.keys(problems).length) return;
    const entry = toEntry(kind, form, original);
    if (await onSaveList(upsertEntry(list, entry))) setForm(toForm(kind, entry));
  };

  const remove = async () => {
    if (await onSaveList(removeEntry(list, form.hbId))) open(null);
  };

  return (
    <div className="hb_kind">
      <div className="hb_list">
        <div className="hb_list_bar">
          <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="hb_btn_primary" onClick={() => open(newForm(kind))}>+ New</button>
        </div>
        {shown.length === 0 && <div className="hb_empty">{list.length ? "Nothing matches." : "No homebrew yet."}</div>}
        {shown.map((e) => (
          <div
            key={e.hbId}
            className={`hb_list_row${form?.hbId === e.hbId ? " active" : ""}`}
            onClick={() => open(toForm(kind, e))}
          >
            {e.name}
            {e.hidden && <span className="hb_badge" title="Hidden from players">Hidden</span>}
          </div>
        ))}
      </div>

      <div className="hb_editor">
        {!form && <div className="hb_empty">Pick an entry to edit, or make a new one.</div>}
        {form && (
          <>
            <div className="hb_form">
              <Field label="Name" error={errors.name} wide><Text form={form} set={set} name="name" autoFocus /></Field>
              <Check form={form} set={set} name="hidden" label="Hidden from players (the GM still sees it in lists)" />
              <FormFields form={form} set={set} errors={errors} />
            </div>
            <div className="hb_actions">
              <button className="hb_btn_primary" onClick={save}>{form.hbId ? "Save" : "Create"}</button>
              {form.hbId && (
                <button onClick={() => open({ ...form, hbId: "", name: `${form.name} (copy)` })}>Duplicate</button>
              )}
              {form.hbId && !confirmDelete && <button className="hb_btn_danger" onClick={() => setConfirmDelete(true)}>Delete</button>}
              {confirmDelete && (
                <span className="hb_confirm">
                  Delete “{form.name}”? Characters keep the copies they already have.
                  <button className="hb_btn_danger" onClick={remove}>Delete</button>
                  <button onClick={() => setConfirmDelete(false)}>Keep</button>
                </span>
              )}
              <button onClick={() => open(null)}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Export / import ───────────────────────────────────────────────────────────

const ExportImport = ({ lists, onImport }) => {
  const exportRef = React.useRef(null);
  const [text, setText] = React.useState("");
  const [result, setResult] = React.useState(null);
  const exported = React.useMemo(() => exportFile(lists), [lists]);

  const readFile = async (file) => {
    if (file) setText(await file.text());
  };

  const runImport = async () => {
    try {
      const { lists: next, added, replaced } = importFile(text, lists);
      if (await onImport(next)) {
        setResult({ ok: true, message: `Imported: ${added} added, ${replaced} replaced.` });
        setText("");
      }
    } catch (e) {
      setResult({ ok: false, message: e.message });
    }
  };

  return (
    <div className="hb_transfer">
      <section>
        <h3>Export</h3>
        <p className="hb_hint">
          All of this game's homebrew as one file in the addon's data format. Copy it into a .json file: import it into another
          game here, or host it (e.g. on GitHub) and add its URL as an Item / Spell / Feat source in the settings.
        </p>
        <textarea ref={exportRef} readOnly value={exported} rows={10} />
        <button onClick={() => exportRef.current?.select()}>Select all</button>
      </section>
      <section>
        <h3>Import</h3>
        <p className="hb_hint">
          Paste a file exported here, or choose one. Its items, spells, feats, languages and monsters are added; entries with
          the same name as existing homebrew replace them.
        </p>
        <input type="file" accept=".json,application/json" onChange={(e) => readFile(e.target.files?.[0])} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder='{ "item": [ ... ] }' />
        <button className="hb_btn_primary" disabled={!text.trim()} onClick={runImport}>Import</button>
        {result && <div className={result.ok ? "hb_ok" : "hb_error"}>{result.message}</div>}
      </section>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App({ Api }) {
  const [lists, setLists] = React.useState(null);
  const [tab, setTab] = React.useState("item");
  const [status, setStatus] = React.useState(null);
  const [isGM, setIsGM] = React.useState(false);

  React.useEffect(() => { viewerIsGM(Api).then(setIsGM); }, [Api]);

  React.useEffect(() => {
    (async () => {
      const loaded = { ...EMPTY_LISTS };
      await Promise.all(KINDS.map(async ({ listKey, resourceKey }) => {
        try {
          const file = await parseResource(await Api.Resources.Global.Read(resourceKey));
          loaded[listKey] = Array.isArray(file?.[listKey]) ? file[listKey] : [];
        } catch (e) {
          console.warn(`Homebrew: couldn't read ${resourceKey}:`, e);
        }
      }));
      setLists(loaded);
    })();
  }, [Api]);

  // Writes the changed kinds; true when everything was saved.
  const saveLists = async (next) => {
    try {
      for (const { listKey, resourceKey } of KINDS) {
        if (next[listKey] === lists[listKey]) continue;
        const content = JSON.stringify({ _meta: { homebrew: true }, [listKey]: next[listKey] });
        await Api.Resources.Global.Upsert(resourceKey, content, resourceKey, "application/json");
      }
      setLists(next);
      setStatus({ ok: true, message: "Saved." });
      return true;
    } catch (e) {
      setStatus({ ok: false, message: `Not saved: ${e?.message ?? e}. Only the GM can save homebrew.` });
      return false;
    }
  };

  if (!lists) return <div className="hb_app hb_empty">Loading homebrew…</div>;

  return (
    <div className="hb_app">
      <header className="hb_header">
        <h1>5E Homebrew</h1>
        {status && <span className={status.ok ? "hb_ok" : "hb_error"}>{status.message}</span>}
      </header>
      <div className="hb_tabs">
        {[...KINDS.map(({ kind, label, listKey }) => [kind, `${label} (${lists[listKey].length})`]), ["transfer", "Export / Import"]].map(([key, label]) => (
          <button key={key} className={`hb_tab${tab === key ? " active" : ""}`} onClick={() => { setTab(key); setStatus(null); }}>
            {label}
          </button>
        ))}
      </div>
      <p className="hb_hint">
        Saved in this game and always offered next to the configured sources (item and monster creators, character sheets).
        Sheets already open pick up changes when reopened.
      </p>
      {KINDS.map(({ kind, listKey }) => tab === kind && (
        <KindEditor
          key={kind}
          kind={kind}
          list={lists[listKey]}
          isGM={isGM}
          onSaveList={(list) => saveLists({ ...lists, [listKey]: list })}
        />
      ))}
      {tab === "transfer" && <ExportImport lists={lists} onImport={saveLists} />}
    </div>
  );
}
