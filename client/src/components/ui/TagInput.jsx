import { useState } from "react";
import Badge from "./Badge";

// Type + Enter/comma to add a tag. Click x on a chip to remove it.
// Used for technical skills, soft skills, interests, favorite subjects.
const TagInput = ({ value = [], onChange, placeholder, suggestions = [] }) => {
  const [draft, setDraft] = useState("");

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag) => onChange(value.filter((v) => v !== tag));

  const unusedSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "10px 12px",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          minHeight: 46,
          alignItems: "center",
        }}
      >
        {value.map((tag) => (
          <Badge key={tag} tone="primary" onRemove={() => removeTag(tag)}>
            {tag}
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            minWidth: 120,
            fontSize: 14,
            padding: "4px 0",
          }}
        />
      </div>
      {unusedSuggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {unusedSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px dashed var(--color-border)",
                background: "transparent",
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
