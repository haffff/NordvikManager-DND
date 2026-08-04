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
}

// Derives the resource-key suffix for a spell source from its display name —
// must match the derivation in dnd5e-nordvikcard's useSpellsData.js exactly,
// since that's how the character card finds the resource this settings card writes.
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

function AppInner({ Api, gameId }) {
  const [savedConfig, setSavedConfig] = useGlobalProperty([Api, "dnd5e_config", JSON.stringify(DEFAULT_CONFIG), gameId])
  const [savedContentProvider, setSavedContentProvider] = useGlobalProperty([Api, "dnd5e_content_provider", "", gameId])
  const [savedImageContentProvider, setSavedImageContentProvider] = useGlobalProperty([Api, "dnd5e_image_content_provider", "", gameId])

  const [draft, setDraft] = useState(null)
  const [contentProviderDraft, setContentProviderDraft] = useState(null)
  const [imageContentProviderDraft, setImageContentProviderDraft] = useState(null)
  const [dirty, setDirty] = useState(false)

  const [pingStatus, setPingStatus] = useState(null) // { ok, message } | null
  const [pinging, setPinging] = useState(false)

  const [spellSyncStatus, setSpellSyncStatus] = useState({}) // slug -> { syncing?, ok?, message? }

  useEffect(() => {
    if (savedConfig !== undefined && draft === null) {
      const parsedConfig = typeof savedConfig === 'string' ? JSON.parse(savedConfig) : savedConfig
      // Normalize legacy skill entries that may use "attribute" key instead of "modifier"
      const normalized = {
        ...parsedConfig,
        skills: (parsedConfig.skills ?? []).map(s => ({
          name: s.name,
          modifier: s.modifier ?? s.attribute ?? "",
        })),
        spellSources: parsedConfig.spellSources ?? [],
      }
      setDraft(normalized)
    }
  }, [savedConfig, draft])

  useEffect(() => {
    if (savedContentProvider !== undefined && contentProviderDraft === null) {
      setContentProviderDraft(savedContentProvider ?? "")
    }
  }, [savedContentProvider, contentProviderDraft])

  useEffect(() => {
    if (savedImageContentProvider !== undefined && imageContentProviderDraft === null) {
      setImageContentProviderDraft(savedImageContentProvider ?? "")
    }
  }, [savedImageContentProvider, imageContentProviderDraft])

  const markDirty = useCallback(() => setDirty(true), [])

  const handleSave = () => {
    setSavedConfig(JSON.stringify(draft))
    setSavedContentProvider(contentProviderDraft)
    setSavedImageContentProvider(imageContentProviderDraft)
    setDirty(false)
  }

  const handleReset = () => {
    if (savedConfig !== undefined) {
      const parsedConfig = typeof savedConfig === 'string' ? JSON.parse(savedConfig) : savedConfig
      setDraft(JSON.parse(JSON.stringify(parsedConfig)))
    }
    setContentProviderDraft(savedContentProvider ?? "")
    setImageContentProviderDraft(savedImageContentProvider ?? "")
    setPingStatus(null)
    setDirty(false)
  }

  // ── Content provider ping ────────────────────────────────────────────────────
  // Sandboxed card iframes have no allow-same-origin, but fetch() to an external
  // https URL still works — the browser just sends it with a null Origin. GitHub's
  // raw content host answers with Access-Control-Allow-Origin: *, so the response
  // is readable. We probe /data/items.json since that's the exact path the real
  // sync step (get_data.json / sync_data.json) requests.
  const testContentProvider = async () => {
    const base = (contentProviderDraft ?? "").trim().replace(/\/+$/, "")
    if (!base) {
      setPingStatus({ ok: false, message: "Enter a base URL first." })
      return
    }
    setPinging(true)
    setPingStatus(null)
    try {
      const url = `${base}/data/items.json`
      const resp = await fetch(url, { method: "GET" })
      if (resp.ok) {
        setPingStatus({ ok: true, message: `Reachable — found data/items.json (HTTP ${resp.status}).` })
      } else {
        setPingStatus({ ok: false, message: `Server responded HTTP ${resp.status} — check the URL and that data/items.json exists there.` })
      }
    } catch (err) {
      setPingStatus({ ok: false, message: `Request failed: ${err.message}. This can also mean the host blocks cross-origin requests.` })
    } finally {
      setPinging(false)
    }
  }

  // ── Spell source handlers ────────────────────────────────────────────────────

  const updateSpellSource = (index, field, value) => {
    setDraft({
      ...draft,
      spellSources: draft.spellSources.map((s, i) => i === index ? { ...s, [field]: value } : s),
    })
    markDirty()
  }

  const addSpellSource = () => {
    setDraft({ ...draft, spellSources: [...draft.spellSources, { name: "New Source", url: "" }] })
    markDirty()
  }

  const removeSpellSource = (index) => {
    setDraft({ ...draft, spellSources: draft.spellSources.filter((_, i) => i !== index) })
    setSpellSyncStatus({})
    markDirty()
  }

  // Triggers the server-side "dnd5e/sync_spell_source" action, which fetches the
  // URL through the SSRF-guarded backend proxy and stores it as a game-wide
  // resource keyed "dnd5e_spells_{slug}" — the same resource key dnd5e-nordvikcard's
  // useSpellsData reads and merges across every configured source. FireAction is
  // fire-and-forget over the socket, so completion arrives asynchronously via the
  // "dnd5e_sync_status_dnd5e_spells_{slug}" property subscribed below, not from
  // this call directly.
  const syncSpellSource = (source) => {
    const slug = slugify(source.name)
    const url = toRawGithubUrl((source.url ?? "").trim())
    if (!url) {
      setSpellSyncStatus(s => ({ ...s, [slug]: { ok: false, message: "No URL set" } }))
      return
    }
    setSpellSyncStatus(s => ({ ...s, [slug]: { syncing: true } }))
    Api.FireAction("dnd5e/sync_spell_source", { spell_url: url, spell_key: `dnd5e_spells_${slug}` })
  }

  const syncAllSpellSources = () => {
    draft.spellSources.forEach(syncSpellSource)
  }

  // Subscribes to each configured source's sync-status property so the table
  // reflects the outcome of the fire-and-forget syncSpellSource() calls above —
  // re-subscribing whenever sources are added/removed/renamed. On success, the
  // spell count comes from a local read of the already-synced resource (no
  // network fetch), so the UI still reports "Synced N spells" like before.
  useEffect(() => {
    if (!draft) return

    const subscriptions = draft.spellSources.map((source) => {
      const slug = slugify(source.name)
      const spellKey = `dnd5e_spells_${slug}`
      const statusProp = `dnd5e_sync_status_${spellKey}`

      const handleStatus = async (value) => {
        if (!value) return
        if (value === "ok") {
          let count = 0
          try {
            const data = await Api.Resources.Global.Read(spellKey)
            const text = data instanceof Blob ? await data.text() : (typeof data === "string" ? data : JSON.stringify(data))
            const parsed = JSON.parse(text)
            count = Array.isArray(parsed.spell) ? parsed.spell.length : 0
          } catch { /* leave count at 0 */ }
          setSpellSyncStatus(s => ({ ...s, [slug]: { ok: true, message: `Synced ${count} spells.` } }))
        } else if (value.startsWith("error:")) {
          setSpellSyncStatus(s => ({ ...s, [slug]: { ok: false, message: `Failed: HTTP ${value.slice(6)}` } }))
        }
      }

      const onChange = ({ value }) => handleStatus(value)
      Api.Properties.Global.Subscribe(gameId, statusProp, onChange)
      Api.Properties.Global.Get(gameId, statusProp).then(prop => { if (prop) handleStatus(prop.value) })

      return { statusProp, onChange }
    })

    return () => {
      subscriptions.forEach(({ statusProp, onChange }) => {
        Api.Properties.Global.Unsubscribe(gameId, statusProp, onChange)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Api, gameId, draft?.spellSources.map(s => slugify(s.name)).join(",")])

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

  if (draft === null || contentProviderDraft === null || imageContentProviderDraft === null) {
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
            <h2>Data Source</h2>
          </div>

          <div className="settings-field">
            <label htmlFor="content-provider">Content Provider (SRD data)</label>
            <div className="settings-field-row">
              <input
                id="content-provider"
                type="text"
                className="settings-text-input"
                placeholder="https://raw.githubusercontent.com/&lt;user&gt;/&lt;repo&gt;/refs/heads/main"
                value={contentProviderDraft}
                onChange={e => { setContentProviderDraft(e.target.value); setPingStatus(null); markDirty() }}
              />
              <button className="btn-secondary" onClick={testContentProvider} disabled={pinging}>
                {pinging ? "Testing…" : "Test"}
              </button>
            </div>
            {pingStatus && (
              <div className={`ping-status ${pingStatus.ok ? "ok" : "fail"}`}>{pingStatus.message}</div>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="image-content-provider">Image Content Provider (optional)</label>
            <input
              id="image-content-provider"
              type="text"
              className="settings-text-input"
              placeholder="Base URL for token/portrait art — leave blank if unused"
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

        {/* ── Spell sources ────────────────────────────────────────────────── */}
        <section className="settings-section settings-section-full">
          <div className="section-header">
            <h2>Spell Sources</h2>
            <div className="section-header-actions">
              <button className="btn-secondary" onClick={syncAllSpellSources}>Sync All</button>
              <button className="btn-add" onClick={addSpellSource}>+ Add</button>
            </div>
          </div>
          <p className="settings-field-hint settings-section-intro">
            Each source is downloaded once and cached as a resource; character cards read every
            configured source and merge their spell lists together, so you can combine the SRD
            with any homebrew or supplement files.
          </p>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {draft.spellSources.map((source, i) => {
                const status = spellSyncStatus[slugify(source.name)]
                return (
                  <tr key={i}>
                    <td className="settings-col-narrow">
                      <input
                        type="text"
                        value={source.name}
                        onChange={e => updateSpellSource(i, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="https://github.com/<user>/<repo>/blob/<branch>/<path>.json"
                        value={source.url}
                        onChange={e => updateSpellSource(i, 'url', e.target.value)}
                      />
                      {status && (
                        <div className={`ping-status ${status.ok ? "ok" : status.syncing ? "" : "fail"}`}>
                          {status.syncing ? "Syncing…" : status.message}
                        </div>
                      )}
                    </td>
                    <td className="settings-col-narrow">
                      <button
                        className="btn-secondary"
                        onClick={() => syncSpellSource(source)}
                        disabled={status?.syncing}
                      >
                        {status?.syncing ? "Syncing…" : "Sync"}
                      </button>
                    </td>
                    <td>
                      <button className="btn-remove" onClick={() => removeSpellSource(i)} title="Remove source">✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  )
}

export default App
