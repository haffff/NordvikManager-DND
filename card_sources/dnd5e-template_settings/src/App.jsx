import { useState, useEffect, useCallback } from 'react'
import { useGlobalProperty } from '../hooks/useGlobalProperty'
import './App.css'

const DEFAULT_CONFIG = {
  attributes: [
    { attribute: "strength",     initAttribute: 10, initModifier: 0 },
    { attribute: "dexterity",    initAttribute: 10, initModifier: 0 },
    { attribute: "constitution", initAttribute: 10, initModifier: 0 },
    { attribute: "intelligence", initAttribute: 10, initModifier: 0 },
    { attribute: "wisdom",       initAttribute: 10, initModifier: 0 },
    { attribute: "charisma",     initAttribute: 10, initModifier: 0 },
  ],
  skills: [
    { name: "Acrobatics",     modifier: "dexterity"    },
    { name: "Animal Handling",modifier: "wisdom"       },
    { name: "Arcana",         modifier: "intelligence" },
    { name: "Athletics",      modifier: "strength"     },
    { name: "Deception",      modifier: "charisma"     },
    { name: "History",        modifier: "intelligence" },
    { name: "Insight",        modifier: "wisdom"       },
    { name: "Intimidation",   modifier: "charisma"     },
    { name: "Investigation",  modifier: "intelligence" },
    { name: "Medicine",       modifier: "wisdom"       },
    { name: "Nature",         modifier: "intelligence" },
    { name: "Perception",     modifier: "wisdom"       },
    { name: "Performance",    modifier: "charisma"     },
    { name: "Persuasion",     modifier: "charisma"     },
    { name: "Religion",       modifier: "intelligence" },
    { name: "Sleight of Hand",modifier: "dexterity"    },
    { name: "Stealth",        modifier: "dexterity"    },
    { name: "Survival",       modifier: "wisdom"       },
  ],
  spellSources: [
    { name: "SRD", url: "https://github.com/haffff/NordvikManager-DND/blob/main/data/spells_srd.json" },
  ],
  itemSources: [
    { name: "SRD", url: "https://github.com/haffff/NordvikManager-DND/blob/main/data/items.json" },
  ],
  bestiarySources: [],
}

// Derives the resource-key suffix for a source from its display name — must
// match the derivation in each consuming card's own useXData.js hook exactly
// (useSpellsData.js, useItemsData.js, the future useBestiaryData.js), since
// that's how a source's display name maps to the resource key it synced.
const slugify = (name) =>
  (name ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "source"

// Converts a GitHub "blob" viewer URL (which serves an HTML page, not raw JSON)
// to the equivalent raw.githubusercontent.com URL. Passes through anything else
// (e.g. URLs already pointing at raw.githubusercontent.com) unchanged.
const toRawGithubUrl = (url) => {
  const m = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
  if (!m) return url
  const [, user, repo, ref, path] = m
  return `https://raw.githubusercontent.com/${user}/${repo}/${ref}/${path}`
}

function App({ Api }) {
  const [gameId, setGameId] = useState(null)

  useEffect(() => {
    const fetchGameId = async () => {
      const id = await Api.ClientMediator.sendCommandAsync('Game', 'GetGameId')
      setGameId(id ?? 'fallback')
    }
    fetchGameId()
  }, [Api])

  if (!gameId) return <div className="settings-loading">Loading…</div>
  return <AppInner Api={Api} gameId={gameId} />
}

// ── Generic multi-source (name+url list) sync — spells/items/bestiary all
// follow the exact same shape: an array of {name,url} inside dnd5e_config,
// each row synced independently by firing one `dnd5e/sync_<kind>_source`
// action (a client-side loop over the array, one FireAction per row — there's
// no backend batching primitive for this), with per-row status tracked via a
// `dnd5e_sync_status_<resourcePrefix><slug>` property, and the resulting
// resources concatenated at READ time by the consuming card's own hook (not
// merged server-side). This is exactly how spell sources already worked;
// generalized here so items/bestiary reuse it instead of copy-pasting it.
function useSourceSync({ Api, gameId, draft, setDraft, markDirty, configKey, resourcePrefix, syncActionName, urlArgName, keyArgName, countField }) {
  const [syncStatus, setSyncStatus] = useState({})
  const sources = draft?.[configKey] ?? []

  const update = (index, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [configKey]: prev[configKey].map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }))
    markDirty()
  }

  const add = () => {
    setDraft((prev) => ({ ...prev, [configKey]: [...prev[configKey], { name: "New Source", url: "" }] }))
    markDirty()
  }

  const remove = (index) => {
    setDraft((prev) => ({ ...prev, [configKey]: prev[configKey].filter((_, i) => i !== index) }))
    setSyncStatus({})
    markDirty()
  }

  const syncOne = (source) => {
    const slug = slugify(source.name)
    const url = toRawGithubUrl((source.url ?? "").trim())
    if (!url) {
      setSyncStatus((s) => ({ ...s, [slug]: { ok: false, message: "No URL set" } }))
      return
    }
    setSyncStatus((s) => ({ ...s, [slug]: { syncing: true } }))
    Api.FireAction(syncActionName, { [urlArgName]: url, [keyArgName]: `${resourcePrefix}${slug}` })
  }

  const syncAll = () => sources.forEach(syncOne)

  // Subscribes to each configured source's sync-status property so the table
  // reflects the outcome of the fire-and-forget syncOne() calls above —
  // re-subscribing whenever sources are added/removed/renamed.
  useEffect(() => {
    if (!draft) return

    const subscriptions = sources.map((source) => {
      const slug = slugify(source.name)
      const resourceKey = `${resourcePrefix}${slug}`
      const statusProp = `dnd5e_sync_status_${resourceKey}`

      const handleStatus = async (value) => {
        if (!value) return
        if (value === "ok") {
          let count = 0
          try {
            const data = await Api.Resources.Global.Read(resourceKey)
            const text = data instanceof Blob ? await data.text() : (typeof data === "string" ? data : JSON.stringify(data))
            const parsed = JSON.parse(text)
            count = Array.isArray(parsed[countField]) ? parsed[countField].length : 0
          } catch { /* leave count at 0 */ }
          setSyncStatus((s) => ({ ...s, [slug]: { ok: true, message: `Synced ${count} ${countField}s.` } }))
        } else if (value.startsWith("error:")) {
          setSyncStatus((s) => ({ ...s, [slug]: { ok: false, message: `Failed: HTTP ${value.slice(6)}` } }))
        }
      }

      const onChange = ({ value }) => handleStatus(value)
      Api.Properties.Global.Subscribe(gameId, statusProp, onChange)
      Api.Properties.Global.Get(gameId, statusProp).then((prop) => { if (prop) handleStatus(prop.value) })

      return { statusProp, onChange }
    })

    return () => {
      subscriptions.forEach(({ statusProp, onChange }) => {
        Api.Properties.Global.Unsubscribe(gameId, statusProp, onChange)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Api, gameId, sources.map((s) => slugify(s.name)).join(",")])

  return { sources, syncStatus, update, add, remove, syncOne, syncAll }
}

// ── Presentational table for a useSourceSync() result ───────────────────────

const SourceListSection = ({ title, hint, urlPlaceholder, sync }) => (
  <section className="settings-section settings-section-full">
    <div className="section-header">
      <h2>{title}</h2>
      <div className="section-header-actions">
        <button className="btn-secondary" onClick={sync.syncAll}>Sync All</button>
        <button className="btn-add" onClick={sync.add}>+ Add</button>
      </div>
    </div>
    {hint && <p className="settings-field-hint settings-section-intro">{hint}</p>}
    <table className="settings-table">
      <thead>
        <tr><th>Name</th><th>URL</th><th></th><th></th></tr>
      </thead>
      <tbody>
        {sync.sources.map((source, i) => {
          const status = sync.syncStatus[slugify(source.name)]
          return (
            <tr key={i}>
              <td className="settings-col-narrow">
                <input type="text" value={source.name} onChange={(e) => sync.update(i, 'name', e.target.value)} />
              </td>
              <td>
                <input
                  type="text"
                  placeholder={urlPlaceholder}
                  value={source.url}
                  onChange={(e) => sync.update(i, 'url', e.target.value)}
                />
                {status && (
                  <div className={`ping-status ${status.ok ? "ok" : status.syncing ? "" : "fail"}`}>
                    {status.syncing ? "Syncing…" : status.message}
                  </div>
                )}
              </td>
              <td className="settings-col-narrow">
                <button className="btn-secondary" onClick={() => sync.syncOne(source)} disabled={status?.syncing}>
                  {status?.syncing ? "Syncing…" : "Sync"}
                </button>
              </td>
              <td>
                <button className="btn-remove" onClick={() => sync.remove(i)} title="Remove source">✕</button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </section>
)

function AppInner({ Api, gameId }) {
  const [savedConfig, setSavedConfig] = useGlobalProperty([Api, "dnd5e_config", JSON.stringify(DEFAULT_CONFIG), gameId])
  const [savedImageContentProvider, setSavedImageContentProvider] = useGlobalProperty([Api, "dnd5e_image_content_provider", "", gameId])
  const [savedLanguageSourceUrl, setSavedLanguageSourceUrl] = useGlobalProperty([Api, "dnd5e_language_source_url", "", gameId])
  const [savedProficiencySourceUrl, setSavedProficiencySourceUrl] = useGlobalProperty([Api, "dnd5e_proficiency_source_url", "", gameId])

  const [draft, setDraft] = useState(null)
  const [imageContentProviderDraft, setImageContentProviderDraft] = useState(null)
  const [languageSourceUrlDraft, setLanguageSourceUrlDraft] = useState(null)
  const [proficiencySourceUrlDraft, setProficiencySourceUrlDraft] = useState(null)
  const [dirty, setDirty] = useState(false)

  const [pingStatus, setPingStatus] = useState({}) // fieldKey -> { ok, message } | undefined
  const [pinging, setPinging] = useState({})

  useEffect(() => {
    if (savedConfig !== undefined && draft === null) {
      const parsedConfig = typeof savedConfig === 'string' ? JSON.parse(savedConfig) : savedConfig
      // Normalize legacy skill entries that may use "attribute" key instead of "modifier",
      // and backfill source-list keys that predate this addon version.
      const normalized = {
        ...parsedConfig,
        skills: (parsedConfig.skills ?? []).map(s => ({
          name: s.name,
          modifier: s.modifier ?? s.attribute ?? "",
        })),
        spellSources: parsedConfig.spellSources ?? [],
        itemSources: parsedConfig.itemSources ?? [],
        bestiarySources: parsedConfig.bestiarySources ?? [],
      }
      setDraft(normalized)
    }
  }, [savedConfig, draft])

  useEffect(() => {
    if (savedImageContentProvider !== undefined && imageContentProviderDraft === null) {
      setImageContentProviderDraft(savedImageContentProvider ?? "")
    }
  }, [savedImageContentProvider, imageContentProviderDraft])

  useEffect(() => {
    if (savedLanguageSourceUrl !== undefined && languageSourceUrlDraft === null) {
      setLanguageSourceUrlDraft(savedLanguageSourceUrl ?? "")
    }
  }, [savedLanguageSourceUrl, languageSourceUrlDraft])

  useEffect(() => {
    if (savedProficiencySourceUrl !== undefined && proficiencySourceUrlDraft === null) {
      setProficiencySourceUrlDraft(savedProficiencySourceUrl ?? "")
    }
  }, [savedProficiencySourceUrl, proficiencySourceUrlDraft])

  const markDirty = useCallback(() => setDirty(true), [])

  const handleSave = () => {
    setSavedConfig(JSON.stringify(draft))
    setSavedImageContentProvider(imageContentProviderDraft)
    setSavedLanguageSourceUrl(languageSourceUrlDraft)
    setSavedProficiencySourceUrl(proficiencySourceUrlDraft)
    setDirty(false)
  }

  const handleReset = () => {
    if (savedConfig !== undefined) {
      const parsedConfig = typeof savedConfig === 'string' ? JSON.parse(savedConfig) : savedConfig
      setDraft(JSON.parse(JSON.stringify(parsedConfig)))
    }
    setImageContentProviderDraft(savedImageContentProvider ?? "")
    setLanguageSourceUrlDraft(savedLanguageSourceUrl ?? "")
    setProficiencySourceUrlDraft(savedProficiencySourceUrl ?? "")
    setPingStatus({})
    setDirty(false)
  }

  // A dedicated URL field is a full file URL now, not a base to join a
  // hardcoded relative path onto — so testing it is just fetching it directly.
  const testUrl = async (fieldKey, url) => {
    const trimmed = (url ?? "").trim()
    if (!trimmed) {
      setPingStatus((s) => ({ ...s, [fieldKey]: { ok: false, message: "Enter a URL first." } }))
      return
    }
    setPinging((p) => ({ ...p, [fieldKey]: true }))
    setPingStatus((s) => ({ ...s, [fieldKey]: undefined }))
    try {
      const resp = await fetch(toRawGithubUrl(trimmed), { method: "GET" })
      setPingStatus((s) => ({
        ...s,
        [fieldKey]: resp.ok
          ? { ok: true, message: `Reachable (HTTP ${resp.status}).` }
          : { ok: false, message: `Server responded HTTP ${resp.status}.` },
      }))
    } catch (err) {
      setPingStatus((s) => ({ ...s, [fieldKey]: { ok: false, message: `Request failed: ${err.message}.` } }))
    } finally {
      setPinging((p) => ({ ...p, [fieldKey]: false }))
    }
  }

  const spellSync = useSourceSync({
    Api, gameId, draft, setDraft, markDirty,
    configKey: "spellSources", resourcePrefix: "dnd5e_spells_",
    syncActionName: "dnd5e/sync_spell_source", urlArgName: "spell_url", keyArgName: "spell_key",
    countField: "spell",
  })
  const itemSync = useSourceSync({
    Api, gameId, draft, setDraft, markDirty,
    configKey: "itemSources", resourcePrefix: "dnd5e_items_",
    syncActionName: "dnd5e/sync_item_source", urlArgName: "item_url", keyArgName: "item_key",
    countField: "item",
  })
  const bestiarySync = useSourceSync({
    Api, gameId, draft, setDraft, markDirty,
    configKey: "bestiarySources", resourcePrefix: "dnd5e_bestiary_",
    syncActionName: "dnd5e/sync_bestiary_source", urlArgName: "bestiary_url", keyArgName: "bestiary_key",
    countField: "monster",
  })

  // ── Attribute handlers ───────────────────────────────────────────────────────

  const updateAttribute = (index, field, rawValue) => {
    const value = field === 'attribute' ? rawValue : (parseInt(rawValue, 10) || 0)
    const oldName = draft.attributes[index].attribute
    const newAttributes = draft.attributes.map((a, i) =>
      i === index ? { ...a, [field]: value } : a
    )
    // Cascade rename into skill modifiers
    const newSkills = field === 'attribute'
      ? draft.skills.map(s => s.modifier === oldName ? { ...s, modifier: value } : s)
      : draft.skills
    setDraft({ ...draft, attributes: newAttributes, skills: newSkills })
    markDirty()
  }

  const addAttribute = () => {
    setDraft({
      ...draft,
      attributes: [...draft.attributes, { attribute: "new-attribute", initAttribute: 10, initModifier: 0 }],
    })
    markDirty()
  }

  const removeAttribute = (index) => {
    const name = draft.attributes[index].attribute
    setDraft({
      ...draft,
      attributes: draft.attributes.filter((_, i) => i !== index),
      skills: draft.skills.filter(s => s.modifier !== name),
    })
    markDirty()
  }

  // ── Skill handlers ───────────────────────────────────────────────────────────

  const updateSkill = (index, field, value) => {
    setDraft({
      ...draft,
      skills: draft.skills.map((s, i) => i === index ? { ...s, [field]: value } : s),
    })
    markDirty()
  }

  const addSkill = () => {
    const firstAttr = draft.attributes[0]?.attribute ?? ""
    setDraft({ ...draft, skills: [...draft.skills, { name: "New Skill", modifier: firstAttr }] })
    markDirty()
  }

  const removeSkill = (index) => {
    setDraft({ ...draft, skills: draft.skills.filter((_, i) => i !== index) })
    markDirty()
  }

  if (draft === null || imageContentProviderDraft === null || languageSourceUrlDraft === null || proficiencySourceUrlDraft === null) {
    return <div className="settings-loading">Loading configuration…</div>
  }

  return (
    <div className="settings">
      <header className="settings-header">
        <h1>D&amp;D 5e Card Settings</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleReset} disabled={!dirty}>Revert</button>
          <button className="btn-primary"   onClick={handleSave}  disabled={!dirty}>Save</button>
        </div>
      </header>

      {dirty && <div className="unsaved-banner">Unsaved changes</div>}

      <div className="settings-body">

        {/* ── Data source ──────────────────────────────────────────────────── */}
        <section className="settings-section settings-section-full">
          <div className="section-header">
            <h2>Data Sources</h2>
          </div>
          <p className="settings-field-hint settings-section-intro">
            Each data type has its own dedicated URL (or list of URLs, for Items/Spells/Bestiary
            below) — no shared base URL is guessed at anymore, so any source can point anywhere.
          </p>

          <div className="settings-field">
            <label htmlFor="language-source-url">Languages source URL</label>
            <div className="settings-field-row">
              <input
                id="language-source-url"
                type="text"
                className="settings-text-input"
                placeholder="https://raw.githubusercontent.com/<user>/<repo>/refs/heads/main/data/languages.json"
                value={languageSourceUrlDraft}
                onChange={e => { setLanguageSourceUrlDraft(e.target.value); setPingStatus((s) => ({ ...s, language: undefined })); markDirty() }}
              />
              <button className="btn-secondary" onClick={() => testUrl("language", languageSourceUrlDraft)} disabled={pinging.language}>
                {pinging.language ? "Testing…" : "Test"}
              </button>
            </div>
            {pingStatus.language && (
              <div className={`ping-status ${pingStatus.language.ok ? "ok" : "fail"}`}>{pingStatus.language.message}</div>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="proficiency-source-url">Proficiencies source URL</label>
            <div className="settings-field-row">
              <input
                id="proficiency-source-url"
                type="text"
                className="settings-text-input"
                placeholder="https://raw.githubusercontent.com/<user>/<repo>/refs/heads/main/data/proficiencies.json"
                value={proficiencySourceUrlDraft}
                onChange={e => { setProficiencySourceUrlDraft(e.target.value); setPingStatus((s) => ({ ...s, proficiency: undefined })); markDirty() }}
              />
              <button className="btn-secondary" onClick={() => testUrl("proficiency", proficiencySourceUrlDraft)} disabled={pinging.proficiency}>
                {pinging.proficiency ? "Testing…" : "Test"}
              </button>
            </div>
            {pingStatus.proficiency && (
              <div className={`ping-status ${pingStatus.proficiency.ok ? "ok" : "fail"}`}>{pingStatus.proficiency.message}</div>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="image-content-provider">Image Content Provider (optional)</label>
            <input
              id="image-content-provider"
              type="text"
              className="settings-text-input"
              placeholder="Base URL for item/monster/token art — leave blank if unused"
              value={imageContentProviderDraft}
              onChange={e => { setImageContentProviderDraft(e.target.value); markDirty() }}
            />
            <div className="settings-field-hint">No known file to probe here yet, so there's no test button — this is just stored as-is.</div>
          </div>
        </section>

        <div className="settings-row">
        {/* ── Attributes ──────────────────────────────────────────────────── */}
        <section className="settings-section">
          <div className="section-header">
            <h2>Attributes</h2>
            <button className="btn-add" onClick={addAttribute}>+ Add</button>
          </div>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Init value</th>
                <th>Init modifier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {draft.attributes.map((attr, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={attr.attribute}
                      onChange={e => updateAttribute(i, 'attribute', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="input-number"
                      type="number"
                      min={1} max={30}
                      value={attr.initAttribute}
                      onChange={e => updateAttribute(i, 'initAttribute', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="input-number"
                      type="number"
                      min={-10} max={10}
                      value={attr.initModifier}
                      onChange={e => updateAttribute(i, 'initModifier', e.target.value)}
                    />
                  </td>
                  <td>
                    <button className="btn-remove" onClick={() => removeAttribute(i)} title="Remove attribute and its skills">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Skills ──────────────────────────────────────────────────────── */}
        <section className="settings-section">
          <div className="section-header">
            <h2>Skills</h2>
            <button className="btn-add" onClick={addSkill}>+ Add</button>
          </div>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Attribute modifier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {draft.skills.map((skill, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={e => updateSkill(i, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={skill.modifier}
                      onChange={e => updateSkill(i, 'modifier', e.target.value)}
                    >
                      {draft.attributes.map(a => (
                        <option key={a.attribute} value={a.attribute}>{a.attribute}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn-remove" onClick={() => removeSkill(i)} title="Remove skill">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        </div>

        {/* ── Item / Spell / Bestiary sources ──────────────────────────────── */}
        <SourceListSection
          title="Item Sources"
          hint="Each source is downloaded once and cached as a resource; the item creator reads every configured source and merges their item lists together, so you can combine the SRD with any homebrew items pack."
          urlPlaceholder="https://github.com/<user>/<repo>/blob/<branch>/<path>.json"
          sync={itemSync}
        />

        <SourceListSection
          title="Spell Sources"
          hint="Each source is downloaded once and cached as a resource; character cards read every configured source and merge their spell lists together, so you can combine the SRD with any homebrew or supplement files."
          urlPlaceholder="https://github.com/<user>/<repo>/blob/<branch>/<path>.json"
          sync={spellSync}
        />

        <SourceListSection
          title="Bestiary Sources"
          hint="Same pattern as Items/Spells above — add your own monster sources here once a bestiary creator card is available."
          urlPlaceholder="https://github.com/<user>/<repo>/blob/<branch>/<path>.json"
          sync={bestiarySync}
        />

      </div>
    </div>
  )
}

export default App
