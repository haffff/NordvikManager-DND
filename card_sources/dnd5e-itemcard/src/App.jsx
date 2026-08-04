import React from 'react'
import './App.css'
import { useProperty } from '../hooks/useProperty'
import { usePropertyList } from '../hooks/usePropertyList'

const RARITIES = ['none', 'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact']

// ── Image panel ──────────────────────────────────────────────────────────────

const ItemImage = ({ Api }) => {
  const IMAGE_KEY = 'item_image_data'
  const [imageKey, setImageKey] = useProperty([Api, 'item_image_key', ''])
  const [imgSrc, setImgSrc] = React.useState(null)
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    if (!imageKey) { setImgSrc(null); return; }
    Api.Resources.Read(IMAGE_KEY).then((data) => {
      if (!data) return
      if (data instanceof Blob) {
        setImgSrc(URL.createObjectURL(data))
      } else {
        setImgSrc(data)
      }
    })
  }, [imageKey])

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result
      await Api.Resources.Upsert(IMAGE_KEY, dataUrl, file.name, file.type)
      setImageKey(IMAGE_KEY)
      setImgSrc(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="item_image_area"
      onClick={() => inputRef.current?.click()}
      title="Click to upload image"
    >
      {imgSrc
        ? <img src={imgSrc} alt="Item" className="item_image" />
        : <div className="item_image_placeholder">
            <span className="item_image_icon">🖼</span>
            <span className="item_image_hint">Upload image</span>
          </div>
      }
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}

// ── Token image panel ────────────────────────────────────────────────────────
// Ported from dnd5e-nordvikcard's Bio5E.jsx (separate micro-frontend packages
// don't share source files in this repo) — lets the item card upload a
// dedicated token image, distinct from the main item image, the same way the
// character card already does.

const ImageUploadPanel = ({ Api, label, propertyKey, resourceKey, isToken = false }) => {
  const [storedKey, setStoredKey] = useProperty([Api, propertyKey, ''])
  const [src, setSrc] = React.useState('')
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef(null)

  const cardId = Api.cardId || 'unknown_card'

  React.useEffect(() => {
    if (!storedKey) { setSrc(''); return }

    let objectUrl = null

    // by default CardAPI stores blobs under "cardId/resourceKey"
    // Resource API wraps resource in this prefix.
    // but we need to access it with token manager
    // outside of card scope, so it has to be stored explicitly.
    const preparedStoredKey = storedKey.split('/').pop()
    Api.Resources.Read(preparedStoredKey).then((data) => {
      if (!data) { setSrc(''); return }
      if (data instanceof Blob) {
        objectUrl = URL.createObjectURL(data)
        setSrc(objectUrl)
      } else if (data instanceof ArrayBuffer) {
        const blob = new Blob([data])
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      } else {
        setSrc(String(data))
      }
    })

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [storedKey])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const buffer = await file.arrayBuffer()
      await Api.Resources.Upsert(resourceKey, buffer, file.name, file.type)
      setStoredKey(`${cardId}/${resourceKey}`)
    } catch (err) {
      console.error('ImageUploadPanel: upload failed', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const imgClass = `dnd5e_bio_image${isToken ? ' dnd5e_bio_image_token' : ''}`
  const phClass = `dnd5e_bio_image_placeholder${isToken ? ' dnd5e_bio_image_token' : ''}`

  return (
    <div className="dnd5e_bio_portrait dnd-panel">
      <div className="dnd-panel-title">{label}</div>
      <div className="dnd5e_bio_image_wrapper" onClick={() => fileInputRef.current?.click()}>
        {src ? (
          <img src={src} alt={label} className={imgClass} />
        ) : (
          <div className={phClass}>{uploading ? 'Uploading…' : 'No image'}</div>
        )}
        <div className="dnd5e_bio_image_overlay">
          <span>{uploading ? 'Uploading…' : '📷 Upload'}</span>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}

// ── Meta row field ───────────────────────────────────────────────────────────

const MetaField = ({ label, children }) => (
  <div className="item_meta_field">
    <span className="item_meta_label">{label}</span>
    {children}
  </div>
)

// ── Header: name + meta ──────────────────────────────────────────────────────

const ItemHeader = ({ Api }) => {
  const [name, setName] = useProperty([Api, 'item_name', ''])
  const [nameDraft, setNameDraft] = React.useState('')
  const [type, setType] = useProperty([Api, 'item_type', ''])
  const [typeDraft, setTypeDraft] = React.useState('')
  const [rarity, setRarity] = useProperty([Api, 'item_rarity', 'none'])
  const [weight, setWeight] = useProperty([Api, 'item_weight', ''])
  const [weightDraft, setWeightDraft] = React.useState('')
  const [value, setValue] = useProperty([Api, 'item_value', ''])
  const [valueDraft, setValueDraft] = React.useState('')
  const [attunement, setAttunement] = useProperty([Api, 'item_attunement', ''])
  const [attuneDraft, setAttuneDraft] = React.useState('')

  React.useEffect(() => { setNameDraft(name ?? '') }, [name])
  React.useEffect(() => { setTypeDraft(type ?? '') }, [type])
  React.useEffect(() => { setWeightDraft(weight ?? '') }, [weight])
  React.useEffect(() => { setValueDraft(value ?? '') }, [value])
  React.useEffect(() => { setAttuneDraft(attunement ?? '') }, [attunement])

  return (
    <div className="item_header">
      <input
        className="item_name_input dnd5e_text_value"
        type="text"
        placeholder="Item Name"
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        onBlur={() => { if (nameDraft !== (name ?? '')) setName(nameDraft) }}
      />
      <div className="item_meta_grid">
        <MetaField label="Type">
          <input
            className="item_meta_input dnd5e_text_value"
            type="text"
            placeholder="e.g. Martial weapon"
            value={typeDraft}
            onChange={(e) => setTypeDraft(e.target.value)}
            onBlur={() => { if (typeDraft !== (type ?? '')) setType(typeDraft) }}
          />
        </MetaField>
        <MetaField label="Rarity">
          <select
            className="item_meta_select"
            value={rarity ?? 'none'}
            onChange={(e) => setRarity(e.target.value)}
          >
            {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </MetaField>
        <MetaField label="Weight">
          <input
            className="item_meta_input dnd5e_text_value"
            type="text"
            placeholder="lbs"
            value={weightDraft}
            onChange={(e) => setWeightDraft(e.target.value)}
            onBlur={() => { if (weightDraft !== (weight ?? '')) setWeight(weightDraft) }}
          />
        </MetaField>
        <MetaField label="Value">
          <input
            className="item_meta_input dnd5e_text_value"
            type="text"
            placeholder="e.g. 15 gp"
            value={valueDraft}
            onChange={(e) => setValueDraft(e.target.value)}
            onBlur={() => { if (valueDraft !== (value ?? '')) setValue(valueDraft) }}
          />
        </MetaField>
        <MetaField label="Attunement">
          <input
            className="item_meta_input dnd5e_text_value"
            type="text"
            placeholder="requires attunement (optional)"
            value={attuneDraft}
            onChange={(e) => setAttuneDraft(e.target.value)}
            onBlur={() => { if (attuneDraft !== (attunement ?? '')) setAttunement(attuneDraft) }}
          />
        </MetaField>
      </div>
    </div>
  )
}

// ── Description ──────────────────────────────────────────────────────────────

const ItemDescription = ({ Api }) => {
  const [desc, setDesc] = useProperty([Api, 'item_description', ''])
  const [draft, setDraft] = React.useState('')

  React.useEffect(() => { setDraft(desc ?? '') }, [desc])

  return (
    <div className="dnd-panel">
      <div className="dnd-panel-title">Description</div>
      <textarea
        className="item_description_input"
        placeholder="Item description…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== (desc ?? '')) setDesc(draft) }}
      />
    </div>
  )
}

// ── Additional info (key/value list) ─────────────────────────────────────────

let _seq = 0
const mkId = () => `prop-${Date.now()}-${_seq++}`

const ExtraPropsPanel = ({ Api }) => {
  const [props, , addProp, removeProp, updateProp] = usePropertyList([Api, 'extra_props', true])
  const [editMode, setEditMode] = React.useState(false)

  return (
    <div className="dnd-panel">
      <div className="dnd-panel-title item_panel_title_row">
        <span>Additional Info</span>
        <div className="item_panel_toolbar">
          <button
            className="dnd5e_inventory_add_btn"
            onClick={() => { addProp({ id: mkId(), key: '', value: '' }); setEditMode(true) }}
          >+</button>
          <button
            className={`dnd5e_inventory_edit_btn${editMode ? ' active' : ''}`}
            onClick={() => setEditMode((v) => !v)}
          >{editMode ? '✓ Done' : 'Edit'}</button>
        </div>
      </div>
      {props.length === 0 && (
        <div className="dnd5e_inventory_empty">No additional info.</div>
      )}
      {props.map((prop, i) => (
        <ExtraPropRow
          key={prop.id ?? i}
          item={prop}
          index={i}
          editMode={editMode}
          update={updateProp}
          remove={removeProp}
        />
      ))}
    </div>
  )
}

const ExtraPropRow = ({ item, index, editMode, update, remove }) => {
  const [k, setK] = React.useState(item.key ?? '')
  const [v, setV] = React.useState(item.value ?? '')

  React.useEffect(() => { setK(item.key ?? '') }, [item.key])
  React.useEffect(() => { setV(item.value ?? '') }, [item.value])

  const save = (overrides = {}) => update(index, { ...item, key: k, value: v, ...overrides })

  if (editMode) {
    return (
      <div className="item_extra_row">
        <input
          className="item_extra_key dnd5e_text_value"
          placeholder="Property"
          value={k}
          onChange={(e) => setK(e.target.value)}
          onBlur={() => save()}
        />
        <input
          className="item_extra_val dnd5e_text_value"
          placeholder="Value"
          value={v}
          onChange={(e) => setV(e.target.value)}
          onBlur={() => save()}
        />
        <button className="dnd5e_remove_btn" onClick={() => remove(index)}>✕</button>
      </div>
    )
  }

  return (
    <div className="item_extra_row item_extra_view">
      <span className="item_extra_key_view">{item.key}</span>
      <span className="item_extra_val_view">{item.value}</span>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

function App({ Api }) {
  return (
    <div className="dnd5e_card item_card">
      <div className="item_top_row">
        <ItemImage Api={Api} />
        <ItemHeader Api={Api} />
      </div>
      <ImageUploadPanel Api={Api} label="Token" propertyKey="tokenImage" resourceKey="tokenImage" isToken />
      <ItemDescription Api={Api} />
      <ExtraPropsPanel Api={Api} />
    </div>
  )
}

export default App
