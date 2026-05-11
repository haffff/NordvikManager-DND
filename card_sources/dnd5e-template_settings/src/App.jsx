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
}

function App({ Api }) {
  const [savedConfig, setSavedConfig] = useGlobalProperty([Api, "config", DEFAULT_CONFIG, Api.ClientMediator.sendCommand("Game","GetGameId")])
  const [draft, setDraft] = useState(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (savedConfig !== undefined && draft === null) {
      // Normalize legacy skill entries that may use "attribute" key instead of "modifier"
      const normalized = {
        ...savedConfig,
        skills: (savedConfig.skills ?? []).map(s => ({
          name: s.name,
          modifier: s.modifier ?? s.attribute ?? "",
        })),
      }
      setDraft(JSON.parse(JSON.stringify(normalized)))
    }
  }, [savedConfig, draft])

  const markDirty = useCallback(() => setDirty(true), [])

  const handleSave = () => {
    setSavedConfig(draft)
    setDirty(false)
  }

  const handleReset = () => {
    if (savedConfig !== undefined) {
      setDraft(JSON.parse(JSON.stringify(savedConfig)))
      setDirty(false)
    }
  }

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

  if (draft === null) {
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
    </div>
  )
}

export default App
