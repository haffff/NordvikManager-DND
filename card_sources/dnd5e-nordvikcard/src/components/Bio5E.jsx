import React from "react";
import { useProperty } from "../../hooks/useProperty";

const BioTextSection = ({ Api, propertyKey, label, rows = 4 }) => {
  const [value, setValue] = useProperty([Api, propertyKey, ""]);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    setText(value ?? "");
  }, [value]);

  return (
    <div className="dnd5e_bio_section">
      <div className="dnd-panel-title">{label}</div>
      <textarea
        className="dnd5e_bio_textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => setValue(text)}
        rows={rows}
      />
    </div>
  );
};

// Shows the image referenced by `propertyKey` ("{cardId}/{resourceKey}") and
// uploads a replacement into the card's `resourceKey` resource on click.
const ImageUploadPanel = ({ Api, label, propertyKey, resourceKey, isToken = false }) => {
  const [imageRef, setImageRef] = useProperty([Api, propertyKey, ""]);
  const [imageUrl, setImageUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const cardId = Api.cardId || "unknown_card";

  React.useEffect(() => {
    if (!imageRef) {
      setImageUrl("");
      return;
    }
    let objectUrl = null;
    const key = imageRef.split("/").pop();
    Api.Resources.Read(key).then((data) => {
      if (!data) {
        setImageUrl("");
        return;
      }
      if (data instanceof Blob) {
        objectUrl = URL.createObjectURL(data);
        setImageUrl(objectUrl);
      } else if (data instanceof ArrayBuffer) {
        const blob = new Blob([data]);
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } else {
        setImageUrl(String(data));
      }
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageRef]);

  return (
    <div className="dnd5e_bio_portrait dnd-panel">
      <div className="dnd-panel-title">{label}</div>
      <div className="dnd5e_bio_image_wrapper" onClick={() => fileInputRef.current?.click()}>
        {imageUrl ? (
          <img src={imageUrl} alt={label} className={`dnd5e_bio_image${isToken ? " dnd5e_bio_image_token" : ""}`} />
        ) : (
          <div className={`dnd5e_bio_image_placeholder${isToken ? " dnd5e_bio_image_token" : ""}`}>
            {uploading ? "Uploading…" : "No image"}
          </div>
        )}
        <div className="dnd5e_bio_image_overlay">
          <span>{uploading ? "Uploading…" : "📷 Upload"}</span>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            const buffer = await file.arrayBuffer();
            await Api.Resources.Upsert(resourceKey, buffer, file.name, file.type);
            setImageRef(`${cardId}/${resourceKey}`);
          } catch (err) {
            console.error("ImageUploadPanel: upload failed", err);
          } finally {
            setUploading(false);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};

export const Bio5E = ({ Api }) => (
  <div className="dnd5e_bio_container">
    <div className="dnd5e_bio_images">
      <ImageUploadPanel Api={Api} label="Character" propertyKey="character_image_key" resourceKey="character_image" />
      <ImageUploadPanel Api={Api} label="Token" propertyKey="tokenImage" resourceKey="tokenImage" isToken />
    </div>
    <BioTextSection Api={Api} propertyKey="bio_appearance" label="Character Appearance" rows={4} />
    <BioTextSection Api={Api} propertyKey="bio_allies" label="Allies & Organizations" rows={4} />
    <BioTextSection Api={Api} propertyKey="bio_features" label="Additional Features & Traits" rows={5} />
    <BioTextSection Api={Api} propertyKey="bio_backstory" label="Character Backstory" rows={6} />
    <BioTextSection Api={Api} propertyKey="bio_treasure" label="Treasure" rows={3} />
  </div>
);
