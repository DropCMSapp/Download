// DropCMS Core Platform - Shared Components
// This file is synced across all DropCMS instances.
// Site-specific code (UI_STRINGS, HomePage, etc.) lives in index.html.

const DROPCMS_VERSION = "2.3.6";

// ─── Error capture (buffered, sent with heartbeat) ──────────────────
window.__dropcmsErrors = [];
window.onerror = function(msg, source, line, col, error) {
  if (window.__dropcmsErrors.length < 50) {
    window.__dropcmsErrors.push({
      type: 'js', message: String(msg).slice(0, 500), source: source,
      line: line, col: col, stack: error?.stack?.slice(0, 500),
      version: DROPCMS_VERSION, timestamp: new Date().toISOString(),
    });
  }
};
window.addEventListener('unhandledrejection', function(e) {
  if (window.__dropcmsErrors.length < 50) {
    window.__dropcmsErrors.push({
      type: 'js-promise', message: String(e.reason).slice(0, 500),
      version: DROPCMS_VERSION, timestamp: new Date().toISOString(),
    });
  }
});

const { useState, useEffect, useRef, useCallback, useMemo } = React;
const API_URL = (window.__DROPCMS_API_URL || 'admin-api.php');

const PAGES = {
  HOME: "home",
  ABOUT: "about",
  CONTACT: "contact",
  PROJECTS: "projects",
};

// ─── Theme System ──────────────────────────────────────────────────
const THEME_PRESETS = {
  dark: {
    id: "dark", label: "Dark", mode: "dark",
    bg: "#0a0f1a", bgCard: "#111827", bgCardHover: "#1a2234",
    accent: "#22d3ee", accentDim: "rgba(34,211,238,0.12)", accentGlow: "rgba(34,211,238,0.25)",
    text: "#e2e8f0", textMuted: "#94a3b8", textLight: "#cbd5e1",
    border: "rgba(148,163,184,0.12)", white: "#f8fafc",
    gradientStart: "#0a0f1a", gradientEnd: "#0f172a",
  },
  light: {
    id: "light", label: "Light", mode: "light",
    bg: "#f5f7fa", bgCard: "#ffffff", bgCardHover: "#f0f2f5",
    accent: "#0891b2", accentDim: "rgba(8,145,178,0.1)", accentGlow: "rgba(8,145,178,0.2)",
    text: "#1e293b", textMuted: "#64748b", textLight: "#475569",
    border: "rgba(100,116,139,0.15)", white: "#0f172a",
    gradientStart: "#f5f7fa", gradientEnd: "#e8ecf1",
  },
  "dark-emerald": {
    id: "dark-emerald", label: "Dark Emerald", mode: "dark",
    bg: "#0a1a14", bgCard: "#11271d", bgCardHover: "#1a3428",
    accent: "#34d399", accentDim: "rgba(52,211,153,0.12)", accentGlow: "rgba(52,211,153,0.25)",
    text: "#e2f0e8", textMuted: "#94b8a3", textLight: "#c5dece",
    border: "rgba(148,184,163,0.12)", white: "#f0fdf4",
    gradientStart: "#0a1a14", gradientEnd: "#0f2a1f",
  },
  "dark-violet": {
    id: "dark-violet", label: "Dark Violet", mode: "dark",
    bg: "#0f0a1a", bgCard: "#1a1127", bgCardHover: "#251a34",
    accent: "#a78bfa", accentDim: "rgba(167,139,250,0.12)", accentGlow: "rgba(167,139,250,0.25)",
    text: "#e8e2f0", textMuted: "#a394b8", textLight: "#cec5de",
    border: "rgba(163,148,184,0.12)", white: "#faf5ff",
    gradientStart: "#0f0a1a", gradientEnd: "#1a0f2a",
  },
  "dark-amber": {
    id: "dark-amber", label: "Dark Amber", mode: "dark",
    bg: "#1a140a", bgCard: "#271f11", bgCardHover: "#342a1a",
    accent: "#fbbf24", accentDim: "rgba(251,191,36,0.12)", accentGlow: "rgba(251,191,36,0.25)",
    text: "#f0ece2", textMuted: "#b8a894", textLight: "#ded2c5",
    border: "rgba(184,168,148,0.12)", white: "#fffbeb",
    gradientStart: "#1a140a", gradientEnd: "#2a1f0f",
  },
  "dark-rose": {
    id: "dark-rose", label: "Dark Rose", mode: "dark",
    bg: "#1a0a10", bgCard: "#271118", bgCardHover: "#341a24",
    accent: "#fb7185", accentDim: "rgba(251,113,133,0.12)", accentGlow: "rgba(251,113,133,0.25)",
    text: "#f0e2e6", textMuted: "#b8949c", textLight: "#dec5cc",
    border: "rgba(184,148,156,0.12)", white: "#fff1f2",
    gradientStart: "#1a0a10", gradientEnd: "#2a0f18",
  },
  "light-ocean": {
    id: "light-ocean", label: "Light Ocean", mode: "light",
    bg: "#f0f9ff", bgCard: "#ffffff", bgCardHover: "#e8f4fd",
    accent: "#0284c7", accentDim: "rgba(2,132,199,0.1)", accentGlow: "rgba(2,132,199,0.2)",
    text: "#0c4a6e", textMuted: "#4a7a96", textLight: "#3a6a86",
    border: "rgba(2,132,199,0.12)", white: "#082f49",
    gradientStart: "#f0f9ff", gradientEnd: "#e0f2fe",
  },
};

/* Active theme — will be overridden reactively inside App */
let theme = THEME_PRESETS.dark;
window.theme = theme;

// ─── Editable Components ─────────────────────────────────────────────

// Error boundary to catch and display render errors
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("React Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", { style: { padding: 40, color: "#ef4444", background: "#0a0f1a", minHeight: "100vh", fontFamily: "monospace" } },
        React.createElement("h2", null, "Something went wrong"),
        React.createElement("pre", { style: { whiteSpace: "pre-wrap", fontSize: 14 } }, String(this.state.error))
      );
    }
    return this.props.children;
  }
}

// Enhanced with floating toolbar for bold, italic, and links
const EditableText = ({ value, onChange, editMode, tag = "span", style = {}, className = "" }) => {
  const ref = useRef(null);
  const Tag = tag;
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Safety: ensure value is always a string
  const safeValue = (typeof value === "string") ? value : String(value ?? "");

  if (!editMode) {
    // Render with HTML support (for links, bold, italic)
    return <Tag style={style} className={className} dangerouslySetInnerHTML={{ __html: safeValue }} />;
  }

  const handleSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPos({ top: rect.top - 44, left: rect.left + rect.width / 2 - 80 });
      setShowToolbar(true);
    }
  };

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    ref.current?.focus();
  };

  const addLink = () => {
    if (linkUrl) {
      execCmd("createLink", linkUrl);
      // Style the link
      const links = ref.current?.querySelectorAll("a");
      links?.forEach(a => { a.style.color = theme.accent; a.target = "_blank"; });
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  return (
    <>
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={className}
        style={{
          ...style,
          outline: "none",
          borderBottom: `2px dashed ${theme.accent}`,
          cursor: "text",
          minWidth: 20,
          transition: "border-color 0.2s",
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onBlur={(e) => {
          setTimeout(() => setShowToolbar(false), 200);
          onChange(e.currentTarget.innerHTML);
        }}
        dangerouslySetInnerHTML={{ __html: safeValue }}
      />
      {showToolbar && (
        <div style={{
          position: "fixed",
          top: toolbarPos.top,
          left: toolbarPos.left,
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: "4px 6px",
          display: "flex",
          gap: 2,
          zIndex: 300,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          {[
            { label: "B", cmd: "bold", style: { fontWeight: 700 } },
            { label: "I", cmd: "italic", style: { fontStyle: "italic" } },
          ].map(btn => (
            <button key={btn.cmd} onClick={(e) => { e.preventDefault(); execCmd(btn.cmd); }}
              style={{ background: "transparent", border: "none", color: theme.white, cursor: "pointer", padding: "4px 10px", borderRadius: 4, fontSize: 14, ...btn.style }}
              onMouseEnter={e => e.target.style.background = theme.accentDim}
              onMouseLeave={e => e.target.style.background = "transparent"}
            >{btn.label}</button>
          ))}
          {!showLinkInput ? (
            <button onClick={(e) => { e.preventDefault(); setShowLinkInput(true); }}
              style={{ background: "transparent", border: "none", color: theme.accent, cursor: "pointer", padding: "4px 10px", borderRadius: 4, fontSize: 13 }}
              onMouseEnter={e => e.target.style.background = theme.accentDim}
              onMouseLeave={e => e.target.style.background = "transparent"}
            >Link</button>
          ) : (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..."
                style={{ background: "rgba(148,163,184,0.1)", border: `1px solid ${theme.border}`, borderRadius: 4, padding: "3px 8px", fontSize: 12, color: theme.white, outline: "none", width: 160 }}
                onKeyDown={e => { if (e.key === "Enter") addLink(); }}
                autoFocus
              />
              <button onClick={(e) => { e.preventDefault(); addLink(); }}
                style={{ background: theme.accent, border: "none", color: theme.bg, cursor: "pointer", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>OK</button>
            </div>
          )}
          <button onClick={(e) => { e.preventDefault(); execCmd("unlink"); }}
            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}
            onMouseEnter={e => e.target.style.background = "rgba(239,68,68,0.1)"}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >Unlink</button>
        </div>
      )}
    </>
  );
};

// EditableImage - shows an image with an upload overlay when editMode is on
const EditableImage = ({ src, onChange, editMode, style = {} }) => {
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(`${API_URL}?action=upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (data.url) onChange(data.url);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div style={{ position: "relative", ...style }}>
      {src && <img src={src} style={{ width: "100%", borderRadius: 12 }} />}
      {editMode && (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              position: src ? "absolute" : "relative",
              top: 0, left: 0, right: 0, bottom: 0,
              background: src ? "rgba(0,0,0,0.5)" : theme.bgCard,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", borderRadius: 12, minHeight: src ? "auto" : 120,
              border: `2px dashed ${theme.accent}`,
              opacity: src ? 0 : 1,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => { if(src) e.currentTarget.style.opacity = 1; }}
            onMouseLeave={e => { if(src) e.currentTarget.style.opacity = 0; }}
          >
            <span style={{ color: theme.accent, fontSize: 14, fontWeight: 500 }}>
              {src ? "Click to change image" : "Click to add image"}
            </span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
        </>
      )}
    </div>
  );
};

// EditableList - for editing bullet point lists
const EditableList = ({ items, onChange, editMode }) => {
  if (!editMode) return items;

  return items; // In edit mode, each item will be individually editable via EditableText
};

// ─── EditableButton component ──────────────────────────────────────────
const inputStyle = {
  width: "100%", background: "rgba(148,163,184,0.06)", border: `1px solid ${theme.border}`,
  borderRadius: 8, padding: "8px 12px", fontSize: 13, color: theme.white,
  fontFamily: "'DM Sans', sans-serif", outline: "none",
};

const EditableButton = ({
  children,
  editMode,
  linkType = "page",
  linkTarget = "",
  onChangeLinkType,
  onChangeLinkTarget,
  onChangeLabel,
  onClick,
  accent = true,
  style: s = {}
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const BtnComponent = accent ? AccentBtn : OutlineBtn;

  if (!editMode) {
    // Normal button behavior
    if (linkType === "url") {
      return <a href={linkTarget} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
        <BtnComponent style={s}>{children}</BtnComponent>
      </a>;
    }
    return <BtnComponent onClick={onClick} style={s}>{children}</BtnComponent>;
  }

  // Edit mode: clicking opens a small popup editor
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <BtnComponent onClick={(e) => { e.preventDefault(); setShowEditor(!showEditor); }} style={{ ...s, border: `2px dashed ${theme.accent}` }}>
        {children}
      </BtnComponent>
      {showEditor && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 8,
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 12, padding: 16, zIndex: 200, minWidth: 280,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 8, fontWeight: 600 }}>EDIT BUTTON</div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 4 }}>Label</label>
            <input value={children} onChange={e => onChangeLabel(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 4 }}>Link Type</label>
            <select value={linkType} onChange={e => onChangeLinkType(e.target.value)} style={inputStyle}>
              <option value="page">Internal Page</option>
              <option value="url">External URL</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 4 }}>
              {linkType === "page" ? "Page" : linkType === "email" ? "Email Address" : "URL"}
            </label>
            {linkType === "page" ? (
              <select value={linkTarget} onChange={e => onChangeLinkTarget(e.target.value)} style={inputStyle}>
                <option value="home">Home</option>
                <option value="about">About</option>
                <option value="contact">Contact</option>
                <option value="projects">Projects</option>
              </select>
            ) : (
              <input value={linkTarget} onChange={e => onChangeLinkTarget(e.target.value)} placeholder={linkType === "email" ? "you@example.com" : "https://..."} style={inputStyle} />
            )}
          </div>
          <button onClick={() => setShowEditor(false)} style={{ marginTop: 10, background: theme.accent, color: theme.bg, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Done</button>
        </div>
      )}
    </div>
  );
};

// ─── AddBlockInserter component ─────────────────────────────────────────
const AddBlockInserter = ({ position, editMode, content, setContent }) => {
  const [showMenu, setShowMenu] = useState(false);
  if (!editMode) return null;

  const addBlock = (type) => {
    const block = {
      id: "block_" + Date.now(),
      type,
      position,
      data: { text: "Enter text here...", image: "", title: "Title", description: "Description" }
    };
    setContent(prev => ({
      ...prev,
      customBlocks: [...(prev?.customBlocks || []), block]
    }));
    setShowMenu(false);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "24px 0",
      position: "relative",
    }}>
      <div style={{
        flex: 1,
        height: 1,
        borderTop: `1px dashed rgba(34,211,238,0.3)`,
      }} />

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: theme.accent,
            color: theme.bg,
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            boxShadow: `0 4px 12px rgba(34,211,238,0.2)`,
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.1)"; e.target.style.boxShadow = `0 6px 16px rgba(34,211,238,0.3)`; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = `0 4px 12px rgba(34,211,238,0.2)`; }}
        >
          +
        </button>

        {showMenu && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 8,
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 200,
            minWidth: 180,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            {[
              { label: "Text Block", type: "text" },
              { label: "Image", type: "image" },
              { label: "Text + Image", type: "textimage" },
              { label: "Card", type: "card" },
              { label: "Product List", type: "productlist" },
              { label: "FAQ / Accordion", type: "faq" },
              { label: "Counter / Stats", type: "counters" },
              { label: "Testimonials", type: "testimonials" },
              { label: "Tabs", type: "tabs" },
              { label: "Divider", type: "divider" },
              { label: "Gallery Grid", type: "gallery" },
              { label: "Projects Showcase", type: "projects_teaser" },
            ].map((option, idx) => (
              <button
                key={option.type}
                onClick={() => addBlock(option.type)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: idx % 2 === 0 ? "transparent" : theme.bgCardHover,
                  border: "none",
                  color: theme.white,
                  fontSize: 14,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  borderBottom: idx < 3 ? `1px solid ${theme.border}` : "none",
                }}
                onMouseEnter={e => e.target.style.background = theme.accentDim}
                onMouseLeave={e => e.target.style.background = idx % 2 === 0 ? "transparent" : theme.bgCardHover}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{
        flex: 1,
        height: 1,
        borderTop: `1px dashed rgba(34,211,238,0.3)`,
      }} />
    </div>
  );
};

// ─── CustomBlock component ──────────────────────────────────────────────
const CustomBlock = ({ block, editMode, content, setContent }) => {
  const updateBlockData = (newData) => {
    setContent(prev => ({
      ...prev,
      customBlocks: (prev?.customBlocks || []).map(b =>
        b.id === block.id ? { ...b, data: { ...b.data, ...newData } } : b
      )
    }));
  };

  const deleteBlock = () => {
    setContent(prev => ({
      ...prev,
      customBlocks: (prev?.customBlocks || []).filter(b => b.id !== block.id)
    }));
  };

  const moveBlock = (direction) => {
    setContent(prev => {
      const blocks = [...(prev?.customBlocks || [])];
      // Get only blocks in same position group for ordering
      const samePos = blocks.filter(b => b.position === block.position);
      const idx = samePos.findIndex(b => b.id === block.id);
      if (idx < 0) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === samePos.length - 1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      // Find global indices and swap
      const globalIdx = blocks.findIndex(b => b.id === samePos[idx].id);
      const globalSwapIdx = blocks.findIndex(b => b.id === samePos[swapIdx].id);
      [blocks[globalIdx], blocks[globalSwapIdx]] = [blocks[globalSwapIdx], blocks[globalIdx]];
      return { ...prev, customBlocks: blocks };
    });
  };

  const commonWrapperStyle = {
    position: "relative",
    padding: editMode ? 16 : 0,
    borderRadius: editMode ? 12 : 0,
    background: editMode ? theme.bgCard : "transparent",
    border: editMode ? `1px solid ${theme.border}` : "none",
  };

  const _ctrlBtnStyle = {
    background: "rgba(148,163,184,0.15)",
    color: theme.white,
    border: "none",
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  };

  // Block controls (move + delete, only in edit mode)
  const BlockControls = editMode ? (
    <div style={{
      position: "absolute", top: 8, right: 8,
      display: "flex", gap: 4, zIndex: 10,
    }}>
      <button onClick={() => moveBlock("up")} style={_ctrlBtnStyle}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(148,163,184,0.3)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(148,163,184,0.15)"}
        title="Move up">↑</button>
      <button onClick={() => moveBlock("down")} style={_ctrlBtnStyle}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(148,163,184,0.3)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(148,163,184,0.15)"}
        title="Move down">↓</button>
      <button onClick={deleteBlock} style={{ ..._ctrlBtnStyle, background: "#ef4444" }}
        onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
        onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
        title="Delete block">✕</button>
    </div>
  ) : null;

  if (block.type === "text") {
    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <EditableText
          value={block.data.text}
          onChange={v => updateBlockData({ text: v })}
          editMode={editMode}
          tag="p"
          style={{ fontSize: 16, lineHeight: 1.8, color: theme.textMuted }}
        />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <EditableImage
          src={block.data.image}
          onChange={v => updateBlockData({ image: v })}
          editMode={editMode}
        />
      </div>
    );
  }

  if (block.type === "textimage") {
    return (
      <div style={{ ...commonWrapperStyle, padding: editMode ? 20 : 0 }}>
        {BlockControls}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
          <EditableText
            value={block.data.text}
            onChange={v => updateBlockData({ text: v })}
            editMode={editMode}
            tag="p"
            style={{ fontSize: 16, lineHeight: 1.8, color: theme.textMuted }}
          />
          <EditableImage
            src={block.data.image}
            onChange={v => updateBlockData({ image: v })}
            editMode={editMode}
          />
        </div>
      </div>
    );
  }

  if (block.type === "card") {
    return (
      <div style={{
        ...commonWrapperStyle,
        background: editMode ? theme.bgCard : `linear-gradient(160deg, rgba(34,211,238,0.04), ${theme.bgCard})`,
        border: editMode ? `1px solid ${theme.border}` : `1px solid ${theme.border}`,
        padding: editMode ? 20 : 24,
      }}>
        {BlockControls}
        <EditableText
          value={block.data.title}
          onChange={v => updateBlockData({ title: v })}
          editMode={editMode}
          tag="h3"
          style={{ fontSize: 20, fontWeight: 600, color: theme.white, marginBottom: 12 }}
        />
        <EditableText
          value={block.data.description}
          onChange={v => updateBlockData({ description: v })}
          editMode={editMode}
          tag="p"
          style={{ fontSize: 15, lineHeight: 1.6, color: theme.textMuted }}
        />
      </div>
    );
  }

  if (block.type === "productlist") {
    const products = block.data.products || [{ image: "", name: "Product name", description: "Short description", price: "0 kr" }];
    const updateProducts = (newProducts) => updateBlockData({ products: newProducts });

    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map((product, i) => (
            <div key={i} style={{
              display: "flex", gap: 16, alignItems: "center",
              background: theme.bgCard, border: `1px solid ${theme.border}`,
              borderRadius: 12, padding: "12px 16px",
            }}>
              {/* Thumbnail — hidden when no image and not in edit mode */}
              {(product.image || editMode) && (
              <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "rgba(148,163,184,0.08)", position: "relative" }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted, fontSize: 10 }}>+ Img</div>
                )}
                {editMode && (
                  <label style={{
                    position: "absolute", inset: 0, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 600,
                    opacity: 0, transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    Upload
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("image", file);
                      try {
                        const res = await fetch(`${API_URL}?action=upload`, { method: "POST", body: fd, credentials: "include" });
                        const data = await res.json();
                        if (data.ok && data.url) { const p = [...products]; p[i] = { ...p[i], image: data.url }; updateProducts(p); }
                      } catch (err) { console.error("Upload failed", err); }
                    }} />
                  </label>
                )}
              </div>
              )}
              {/* Name + Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editMode ? (
                  <>
                    <input value={product.name} onChange={e => { const p = [...products]; p[i] = { ...p[i], name: e.target.value }; updateProducts(p); }}
                      placeholder="Product name" style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}40`, borderRadius: 6, padding: "4px 8px", fontSize: 15, fontWeight: 600, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }} />
                    <input value={product.description} onChange={e => { const p = [...products]; p[i] = { ...p[i], description: e.target.value }; updateProducts(p); }}
                      placeholder="Description" style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}20`, borderRadius: 6, padding: "4px 8px", fontSize: 13, color: theme.textMuted, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.white }}>{product.name}</div>
                    <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.4 }}>{product.description}</div>
                  </>
                )}
              </div>
              {/* Price */}
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                {editMode ? (
                  <input value={product.price} onChange={e => { const p = [...products]; p[i] = { ...p[i], price: e.target.value }; updateProducts(p); }}
                    placeholder="Price" style={{ width: 90, background: "transparent", border: `1px dashed ${theme.accent}40`, borderRadius: 6, padding: "4px 8px", fontSize: 15, fontWeight: 700, color: theme.accent, outline: "none", fontFamily: "'DM Sans', sans-serif", textAlign: "right" }} />
                ) : (
                  <span style={{ fontSize: 15, fontWeight: 700, color: theme.accent }}>{product.price}</span>
                )}
              </div>
              {/* Delete product row */}
              {editMode && (
                <button onClick={() => { const p = [...products]; p.splice(i, 1); updateProducts(p); }} style={{
                  background: "#ef4444", border: "none", borderRadius: 6, width: 24, height: 24,
                  cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>✕</button>
              )}
            </div>
          ))}
          {editMode && (
            <button onClick={() => { updateProducts([...products, { image: "", name: "New product", description: "Description", price: "0 kr" }]); }} style={{
              background: "transparent", border: `2px dashed ${theme.accent}30`, borderRadius: 12,
              padding: "14px", color: theme.accent, fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", width: "100%",
            }}>+ Add Product</button>
          )}
        </div>
      </div>
    );
  }

  // ─── FAQ / Accordion block ──────────────────────────────────────────
  if (block.type === "faq") {
    const items = block.data.items || [
      { question: "What is this?", answer: "This is a frequently asked question.", open: false },
      { question: "How does it work?", answer: "Click a question to reveal the answer.", open: false },
    ];
    const updateItems = (newItems) => updateBlockData({ items: newItems });
    const toggleItem = (i) => {
      const updated = [...items];
      updated[i] = { ...updated[i], open: !updated[i].open };
      updateItems(updated);
    };

    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.border}` }}>
              {editMode ? (
                <div style={{ background: theme.bgCard, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input value={item.question} onChange={e => { const u = [...items]; u[i] = { ...u[i], question: e.target.value }; updateItems(u); }}
                      placeholder="Question" style={{ flex: 1, background: "transparent", border: `1px dashed ${theme.accent}40`, borderRadius: 6, padding: "6px 10px", fontSize: 14, fontWeight: 600, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                    <button onClick={() => { const u = [...items]; u.splice(i, 1); updateItems(u); }} style={{
                      background: "#ef4444", border: "none", borderRadius: 6, width: 24, height: 24,
                      cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>✕</button>
                  </div>
                  <textarea value={item.answer} onChange={e => { const u = [...items]; u[i] = { ...u[i], answer: e.target.value }; updateItems(u); }}
                    placeholder="Answer" rows={2} style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}20`, borderRadius: 6, padding: "6px 10px", fontSize: 13, color: theme.textMuted, outline: "none", fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
                </div>
              ) : (
                <>
                  <div onClick={() => toggleItem(i)} style={{
                    background: theme.bgCard, padding: "14px 16px", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: theme.white }}>{item.question}</span>
                    <span style={{ color: theme.textMuted, fontSize: 12 }}>{item.open ? "▲" : "▼"}</span>
                  </div>
                  {item.open && (
                    <div style={{ padding: "12px 16px", fontSize: 14, lineHeight: 1.7, color: theme.textMuted, borderTop: `1px solid ${theme.border}` }}>
                      {item.answer}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {editMode && (
            <button onClick={() => updateItems([...items, { question: "New question", answer: "Answer here", open: false }])} style={{
              background: "transparent", border: `2px dashed ${theme.accent}30`, borderRadius: 12,
              padding: "14px", color: theme.accent, fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", width: "100%",
            }}>+ Add Question</button>
          )}
        </div>
      </div>
    );
  }

  // ─── Counter / Stats block ─────────────────────────────────────────
  if (block.type === "counters") {
    const stats = block.data.stats || [
      { number: "500+", label: "Projects" },
      { number: "10+", label: "Years" },
      { number: "99%", label: "Satisfaction" },
    ];
    const updateStats = (newStats) => updateBlockData({ stats: newStats });

    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ flex: "1 1 140px", textAlign: "center", minWidth: 120 }}>
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                  <input value={stat.number} onChange={e => { const s = [...stats]; s[i] = { ...s[i], number: e.target.value }; updateStats(s); }}
                    placeholder="Number" style={{ width: 120, background: "transparent", border: `1px dashed ${theme.accent}40`, borderRadius: 6, padding: "6px 10px", fontSize: 28, fontWeight: 700, color: theme.accent, outline: "none", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }} />
                  <input value={stat.label} onChange={e => { const s = [...stats]; s[i] = { ...s[i], label: e.target.value }; updateStats(s); }}
                    placeholder="Label" style={{ width: 120, background: "transparent", border: `1px dashed ${theme.accent}20`, borderRadius: 6, padding: "4px 8px", fontSize: 12, color: theme.textMuted, outline: "none", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }} />
                  <button onClick={() => { const s = [...stats]; s.splice(i, 1); updateStats(s); }} style={{
                    background: "#ef4444", border: "none", borderRadius: 6, width: 24, height: 24,
                    cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, color: theme.accent, lineHeight: 1.2 }}>{stat.number}</div>
                  <div style={{ fontSize: 13, color: theme.textMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{stat.label}</div>
                </>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <button onClick={() => updateStats([...stats, { number: "0", label: "Label" }])} style={{
            background: "transparent", border: `2px dashed ${theme.accent}30`, borderRadius: 12,
            padding: "14px", color: theme.accent, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", width: "100%", marginTop: 12,
          }}>+ Add Stat</button>
        )}
      </div>
    );
  }

  // ─── Testimonials block ────────────────────────────────────────────
  if (block.type === "testimonials") {
    const testimonials = block.data.testimonials || [
      { text: "This product changed everything for us. Highly recommended!", author: "Jane Doe", role: "CEO, Acme Corp", rating: 5, image: "" },
    ];
    const updateTestimonials = (newT) => updateBlockData({ testimonials: newT });
    const renderStars = (rating) => {
      let stars = "";
      for (let s = 1; s <= 5; s++) stars += s <= rating ? "★" : "☆";
      return stars;
    };

    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: theme.bgCard, border: `1px solid ${theme.border}`,
              borderRadius: 16, padding: 24, position: "relative",
            }}>
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <textarea value={t.text} onChange={e => { const u = [...testimonials]; u[i] = { ...u[i], text: e.target.value }; updateTestimonials(u); }}
                    placeholder="Testimonial text" rows={3} style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}40`, borderRadius: 6, padding: "8px 10px", fontSize: 14, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
                  <input value={t.author} onChange={e => { const u = [...testimonials]; u[i] = { ...u[i], author: e.target.value }; updateTestimonials(u); }}
                    placeholder="Author name" style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}30`, borderRadius: 6, padding: "4px 10px", fontSize: 13, fontWeight: 600, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                  <input value={t.role} onChange={e => { const u = [...testimonials]; u[i] = { ...u[i], role: e.target.value }; updateTestimonials(u); }}
                    placeholder="Role / Company" style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}20`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: theme.textMuted, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <label style={{ fontSize: 12, color: theme.textMuted }}>Rating:</label>
                    <input type="number" min={1} max={5} value={t.rating || 5} onChange={e => { const u = [...testimonials]; u[i] = { ...u[i], rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) }; updateTestimonials(u); }}
                      style={{ width: 50, background: "transparent", border: `1px dashed ${theme.accent}40`, borderRadius: 6, padding: "4px 8px", fontSize: 13, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }} />
                    <span style={{ color: "#fbbf24", fontSize: 16 }}>{renderStars(t.rating || 5)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {t.image && <img src={t.image} alt="" style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover" }} />}
                    <label style={{ cursor: "pointer", fontSize: 12, color: theme.accent, textDecoration: "underline" }}>
                      {t.image ? "Change photo" : "+ Add photo"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const fd = new FormData(); fd.append("image", file);
                        try {
                          const res = await fetch(`${API_URL}?action=upload`, { method: "POST", body: fd, credentials: "include" });
                          const data = await res.json();
                          if (data.ok && data.url) { const u = [...testimonials]; u[i] = { ...u[i], image: data.url }; updateTestimonials(u); }
                        } catch (err) { console.error("Upload failed", err); }
                      }} />
                    </label>
                  </div>
                  <button onClick={() => { const u = [...testimonials]; u.splice(i, 1); updateTestimonials(u); }} style={{
                    background: "#ef4444", border: "none", borderRadius: 6, padding: "4px 10px",
                    cursor: "pointer", color: "#fff", fontSize: 11, alignSelf: "flex-end",
                  }}>✕ Remove</button>
                </div>
              ) : (
                <>
                  <div style={{ color: "#fbbf24", fontSize: 16, marginBottom: 12 }}>{renderStars(t.rating || 5)}</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: theme.textLight, fontStyle: "italic", margin: "0 0 16px 0" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {t.image && <img src={t.image} alt="" style={{ width: 40, height: 40, borderRadius: 20, objectFit: "cover" }} />}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: theme.white }}>{t.author}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted }}>{t.role}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <button onClick={() => updateTestimonials([...testimonials, { text: "Great experience!", author: "New Author", role: "Role", rating: 5, image: "" }])} style={{
            background: "transparent", border: `2px dashed ${theme.accent}30`, borderRadius: 12,
            padding: "14px", color: theme.accent, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", width: "100%", marginTop: 12,
          }}>+ Add Testimonial</button>
        )}
      </div>
    );
  }

  // ─── Tabs block ────────────────────────────────────────────────────
  if (block.type === "tabs") {
    const tabs = block.data.tabs || [
      { label: "Tab 1", content: "Content for tab 1" },
      { label: "Tab 2", content: "Content for tab 2" },
    ];
    const activeTab = Math.min(block.data.activeTab || 0, tabs.length - 1);
    const updateTabs = (newTabs) => updateBlockData({ tabs: newTabs });

    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
          {tabs.map((tab, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {editMode ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input value={tab.label} onChange={e => { const u = [...tabs]; u[i] = { ...u[i], label: e.target.value }; updateTabs(u); }}
                    style={{
                      background: i === activeTab ? theme.accent : "transparent",
                      color: i === activeTab ? theme.bg : theme.white,
                      border: i === activeTab ? "none" : `1px solid ${theme.border}`,
                      borderRadius: "8px 8px 0 0", padding: "10px 16px", fontSize: 13, fontWeight: 600,
                      outline: "none", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", minWidth: 80,
                    }}
                    onClick={() => updateBlockData({ activeTab: i })} />
                  <button onClick={() => { const u = [...tabs]; u.splice(i, 1); updateTabs(u); if (activeTab >= u.length) updateBlockData({ activeTab: Math.max(0, u.length - 1) }); }} style={{
                    background: "#ef4444", border: "none", borderRadius: 4, width: 18, height: 18,
                    cursor: "pointer", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 2,
                  }}>✕</button>
                </div>
              ) : (
                <button onClick={() => updateBlockData({ activeTab: i })} style={{
                  background: i === activeTab ? theme.accent : "transparent",
                  color: i === activeTab ? theme.bg : theme.white,
                  border: i === activeTab ? "none" : `1px solid ${theme.border}`,
                  borderRadius: "8px 8px 0 0", padding: "10px 20px", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                }}>
                  {tab.label}
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: "0 12px 12px 12px", padding: 20, minHeight: 60,
        }}>
          {editMode ? (
            <textarea value={tabs[activeTab]?.content || ""} onChange={e => { const u = [...tabs]; u[activeTab] = { ...u[activeTab], content: e.target.value }; updateTabs(u); }}
              rows={4} style={{ width: "100%", background: "transparent", border: `1px dashed ${theme.accent}30`, borderRadius: 8, padding: "10px 12px", fontSize: 14, lineHeight: 1.7, color: theme.textLight, outline: "none", fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
          ) : (
            <div style={{ fontSize: 15, lineHeight: 1.7, color: theme.textLight, whiteSpace: "pre-wrap" }}>{tabs[activeTab]?.content}</div>
          )}
        </div>
        {editMode && (
          <button onClick={() => { updateTabs([...tabs, { label: `Tab ${tabs.length + 1}`, content: "New tab content" }]); }} style={{
            background: "transparent", border: `2px dashed ${theme.accent}30`, borderRadius: 12,
            padding: "14px", color: theme.accent, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", width: "100%", marginTop: 12,
          }}>+ Add Tab</button>
        )}
      </div>
    );
  }

  // ─── Divider block ─────────────────────────────────────────────────
  if (block.type === "divider") {
    const divStyle = block.data.style || "gradient";
    const spacing = block.data.spacing || "medium";
    const spacingPx = { small: 24, medium: 48, large: 80 }[spacing] || 48;

    const dividerContent = {
      line: React.createElement("div", { style: { borderTop: `1px solid ${theme.border}`, width: "100%" } }),
      dots: React.createElement("div", { style: { textAlign: "center", color: theme.textMuted, fontSize: 18, letterSpacing: 12 } }, "● ● ●"),
      gradient: React.createElement("div", { style: { height: 2, width: "100%", background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`, borderRadius: 1 } }),
      wave: React.createElement("svg", { viewBox: "0 0 1200 40", preserveAspectRatio: "none", style: { width: "100%", height: 20, display: "block" } },
        React.createElement("path", { d: "M0,20 C200,0 400,40 600,20 C800,0 1000,40 1200,20", fill: "none", stroke: theme.accent, strokeWidth: 2, strokeOpacity: 0.5 })
      ),
    };

    return (
      <div style={{ ...commonWrapperStyle, paddingTop: editMode ? 16 : spacingPx / 2, paddingBottom: editMode ? 16 : spacingPx / 2 }}>
        {BlockControls}
        {editMode && (
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 12, color: theme.textMuted }}>Style:</label>
              <select value={divStyle} onChange={e => updateBlockData({ style: e.target.value })} style={{
                background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6,
                padding: "4px 8px", fontSize: 12, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif",
              }}>
                <option value="line">Line</option>
                <option value="dots">Dots</option>
                <option value="gradient">Gradient</option>
                <option value="wave">Wave</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 12, color: theme.textMuted }}>Spacing:</label>
              <select value={spacing} onChange={e => updateBlockData({ spacing: e.target.value })} style={{
                background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6,
                padding: "4px 8px", fontSize: 12, color: theme.white, outline: "none", fontFamily: "'DM Sans', sans-serif",
              }}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {dividerContent[divStyle] || dividerContent.gradient}
        </div>
      </div>
    );
  }

  // ─── Gallery Grid block ────────────────────────────────────────────
  if (block.type === "gallery") {
    const images = block.data.images || [];
    const updateImages = (newImages) => updateBlockData({ images: newImages });

    return (
      <div style={commonWrapperStyle}>
        {BlockControls}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={img.url} alt={img.caption || ""} style={{
                width: "100%", aspectRatio: "1", objectFit: "cover",
                borderRadius: 12, display: "block", cursor: "pointer",
              }} />
              {editMode && (
                <button onClick={() => { const u = [...images]; u.splice(i, 1); updateImages(u); }} style={{
                  position: "absolute", top: 6, right: 6,
                  background: "#ef4444", border: "none", borderRadius: 6, width: 24, height: 24,
                  cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              )}
              {editMode ? (
                <input value={img.caption || ""} onChange={e => { const u = [...images]; u[i] = { ...u[i], caption: e.target.value }; updateImages(u); }}
                  placeholder="Caption" style={{ width: "100%", marginTop: 4, background: "transparent", border: `1px dashed ${theme.accent}20`, borderRadius: 6, padding: "4px 8px", fontSize: 12, color: theme.textMuted, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              ) : (
                img.caption && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, textAlign: "center" }}>{img.caption}</div>
              )}
            </div>
          ))}
        </div>
        {editMode && (
          <label style={{
            display: "block", marginTop: 12, background: "transparent", border: `2px dashed ${theme.accent}30`, borderRadius: 12,
            padding: "14px", color: theme.accent, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", width: "100%", textAlign: "center",
          }}>
            + Add Image
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              const fd = new FormData(); fd.append("image", file);
              try {
                const res = await fetch(`${API_URL}?action=upload`, { method: "POST", body: fd, credentials: "include" });
                const data = await res.json();
                if (data.ok && data.url) { updateImages([...images, { url: data.url, caption: "" }]); }
              } catch (err) { console.error("Upload failed", err); }
            }} />
          </label>
        )}
      </div>
    );
  }

  // ─── Projects Showcase block (teaser grid linking to full posts) ───
  if (block.type === "projects_teaser") {
    const data = block.data || {};
    const title = data.title ?? "Selected Projects";
    const subtitle = data.subtitle ?? "";
    const limit = parseInt(data.limit ?? 3, 10) || 3;
    const categoryFilter = data.category ?? "";
    const sortOrder = data.sort ?? "newest";
    const showExcerpt = data.showExcerpt !== false;
    const showCategory = data.showCategory !== false;
    const showAllLink = data.showAllLink !== false;
    const allLinkLabel = data.allLinkLabel ?? "View all projects →";
    const allLinkHref = data.allLinkHref ?? "";
    const columns = parseInt(data.columns ?? 3, 10) || 3;

    const [posts, setPosts] = useState(() => window.__dropcmsPostsCache || []);
    const [loading, setLoading] = useState(!window.__dropcmsPostsCache);

    useEffect(() => {
      if (window.__dropcmsPostsCache) { setPosts(window.__dropcmsPostsCache); setLoading(false); return; }
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch(`${API_URL}?action=posts`, { credentials: "include" });
          const json = await res.json();
          const list = Array.isArray(json) ? json : [];
          window.__dropcmsPostsCache = list;
          if (!cancelled) { setPosts(list); setLoading(false); }
        } catch (e) {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

    // Available categories from content.projects.categories (if defined) or derived from posts
    const availableCategories = (content?.projects?.categories || []).map(c => ({ id: c.id, title: c.title }));
    const derivedCategories = [...new Set(posts.map(p => p.category).filter(Boolean))]
      .filter(id => !availableCategories.find(c => c.id === id))
      .map(id => ({ id, title: id }));
    const allCategories = [...availableCategories, ...derivedCategories];

    // Filter, sort, limit
    let filtered = posts.filter(p => p.published !== false);
    if (categoryFilter) filtered = filtered.filter(p => p.category === categoryFilter);
    filtered = [...filtered].sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return sortOrder === "oldest" ? da - db : db - da;
    });
    const displayPosts = filtered.slice(0, limit);

    const navigateToProject = (slug) => {
      if (editMode) return;
      window.__projectSlug = slug;
      window.history.pushState({}, "", `${_basePath}/projects/${slug}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo(0, 0);
    };
    const navigateToProjects = () => {
      if (editMode) return;
      window.__projectSlug = null;
      window.history.pushState({}, "", `${_basePath}/projects`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo(0, 0);
    };

    const inputStyle = {
      background: "rgba(148,163,184,0.08)", color: theme.white,
      border: `1px solid ${theme.border}`, borderRadius: 6,
      padding: "6px 10px", fontSize: 12, outline: "none",
      fontFamily: "'DM Sans', sans-serif",
    };

    return (
      <div style={{ ...commonWrapperStyle, padding: editMode ? 20 : 0 }}>
        {BlockControls}

        {editMode && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 8, marginBottom: 16, padding: 12,
            background: "rgba(34,211,238,0.04)", border: `1px solid ${theme.accent}22`, borderRadius: 8,
          }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Limit</span>
              <select value={limit} onChange={e => updateBlockData({ limit: parseInt(e.target.value, 10) })} style={inputStyle}>
                <option value={3}>3</option><option value={4}>4</option><option value={6}>6</option><option value={9}>9</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Columns</span>
              <select value={columns} onChange={e => updateBlockData({ columns: parseInt(e.target.value, 10) })} style={inputStyle}>
                <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</span>
              <select value={categoryFilter} onChange={e => updateBlockData({ category: e.target.value })} style={inputStyle}>
                <option value="">All</option>
                {allCategories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Sort</span>
              <select value={sortOrder} onChange={e => updateBlockData({ sort: e.target.value })} style={inputStyle}>
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.textMuted, cursor: "pointer" }}>
              <input type="checkbox" checked={showExcerpt} onChange={e => updateBlockData({ showExcerpt: e.target.checked })} />
              Show excerpt
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.textMuted, cursor: "pointer" }}>
              <input type="checkbox" checked={showCategory} onChange={e => updateBlockData({ showCategory: e.target.checked })} />
              Show category tag
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: theme.textMuted, cursor: "pointer" }}>
              <input type="checkbox" checked={showAllLink} onChange={e => updateBlockData({ showAllLink: e.target.checked })} />
              Show "View all" link
            </label>
            {showAllLink && (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Link label</span>
                  <input type="text" value={allLinkLabel} onChange={e => updateBlockData({ allLinkLabel: e.target.value })} placeholder='View all projects →' style={inputStyle} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Link URL (empty = /projects)</span>
                  <input type="text" value={allLinkHref} onChange={e => updateBlockData({ allLinkHref: e.target.value })} placeholder="/projects or https://example.com" style={inputStyle} />
                </label>
              </>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <EditableText
            value={title}
            onChange={v => updateBlockData({ title: v })}
            editMode={editMode}
            tag="h2"
            className="serif"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", fontStyle: "italic", color: theme.white, lineHeight: 1.2, marginBottom: subtitle || editMode ? 12 : 0 }}
          />
          {(subtitle || editMode) && (
            <EditableText
              value={subtitle}
              onChange={v => updateBlockData({ subtitle: v })}
              editMode={editMode}
              tag="p"
              style={{ fontSize: 16, color: theme.textMuted, maxWidth: 560, margin: "0 auto" }}
            />
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: theme.textMuted, fontSize: 14 }}>Loading projects…</div>
        ) : displayPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: theme.textMuted, fontSize: 14 }}>
            No projects to show{categoryFilter ? ` in "${categoryFilter}"` : ""}.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(${columns >= 4 ? 220 : 280}px, 1fr))`,
            gap: 20,
          }}>
            {displayPosts.map(post => {
              const img = post.imageUrl || post.image || (post.images && post.images[0]) || "";
              const categoryDef = allCategories.find(c => c.id === post.category);
              const categoryLabel = categoryDef ? categoryDef.title : post.category;
              return (
                <div
                  key={post.id || post.slug}
                  onClick={() => navigateToProject(post.slug)}
                  style={{
                    background: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: editMode ? "default" : "pointer",
                    transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={e => { if (!editMode) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${theme.accent}55`; e.currentTarget.style.boxShadow = `0 12px 28px rgba(0,0,0,0.25)`; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {img && (
                    <div style={{ width: "100%", aspectRatio: "16/10", background: theme.bg, overflow: "hidden" }}>
                      <img src={img} alt={post.title || ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {showCategory && categoryLabel && (
                      <span style={{
                        alignSelf: "flex-start",
                        fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
                        color: theme.accent,
                        background: `${theme.accent}15`,
                        padding: "4px 8px", borderRadius: 4,
                      }}>{categoryLabel}</span>
                    )}
                    <h3 style={{
                      fontSize: 17, fontWeight: 600, color: theme.white,
                      margin: 0, lineHeight: 1.3,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>{post.title || "Untitled"}</h3>
                    {showExcerpt && post.excerpt && (
                      <p style={{
                        fontSize: 13, lineHeight: 1.55, color: theme.textMuted, margin: 0,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>{post.excerpt}</p>
                    )}
                    <span style={{
                      marginTop: "auto", paddingTop: 8, fontSize: 12, fontWeight: 600,
                      color: theme.accent,
                    }}>Read more →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAllLink && !loading && displayPosts.length > 0 && (() => {
          const href = (allLinkHref || "").trim();
          const isExternal = /^(https?:|mailto:|tel:)/i.test(href);
          const resolvedHref = href || `${_basePath}/projects`;
          const handleClick = (e) => {
            if (editMode) { e.preventDefault(); return; }
            if (isExternal) return; // let the browser handle it
            e.preventDefault();
            if (!href || href === `${_basePath}/projects` || href === "/projects") {
              navigateToProjects();
            } else if (href.startsWith("/")) {
              // Internal SPA navigation — push and let the app re-read the URL
              window.history.pushState({}, "", href);
              window.dispatchEvent(new PopStateEvent("popstate"));
              window.scrollTo(0, 0);
            } else {
              window.location.href = href;
            }
          };
          return (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a
                href={resolvedHref}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                onClick={handleClick}
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: "transparent",
                  border: `1px solid ${theme.accent}`,
                  borderRadius: 999,
                  color: theme.accent,
                  fontSize: 14, fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}15`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >{allLinkLabel || "View all projects →"}</a>
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
};

// ─── Image Gallery Lightbox (carousel) ─────────────────────────────
const ImageGallery = ({ images = [], alt = "", t = (k) => k }) => {
  const [open, setOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef(null);
  if (!images || images.length === 0) return null;
  const primarySrc = images[0];

  /* Lock body scroll when lightbox is open */
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIdx((currentIdx - 1 + images.length) % images.length);
      } else {
        setCurrentIdx((currentIdx + 1) % images.length);
      }
    }
    touchStartX.current = null;
  };

  const lightboxContent = open ? (
    <div
      onClick={() => setOpen(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        width: "100%", height: "100%",
        background: "rgba(0,0,0,0.96)",
        zIndex: 999999,
        cursor: "zoom-out",
        overflow: "hidden",
        touchAction: "pan-x",
      }}
    >
      {/* Centered image wrapper — uses absolute centering for max mobile compat */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "92vw", maxHeight: "82vh",
        display: "flex", flexDirection: "column",
        alignItems: "center",
      }}>
        <img
          src={images[currentIdx]}
          alt={alt}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: "92vw",
            maxHeight: "75vh",
            width: "auto", height: "auto",
            borderRadius: 6,
            objectFit: "contain",
            boxShadow: "0 8px 60px rgba(0,0,0,0.6)",
            cursor: "default",
            WebkitUserSelect: "none", userSelect: "none",
            display: "block",
          }}
        />

        {/* Counter below image */}
        {images.length > 1 && (
          <div style={{
            marginTop: 10,
            background: "rgba(255,255,255,0.12)", color: "#fff",
            fontSize: 12, padding: "5px 14px", borderRadius: 20,
            fontWeight: 500, whiteSpace: "nowrap",
          }}>
            {currentIdx + 1} / {images.length} — {t("gallery_swipe")}
          </div>
        )}
      </div>

      {/* Left arrow */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrentIdx((currentIdx - 1 + images.length) % images.length); }}
          style={{
            position: "absolute", top: "50%", left: 6, transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", fontSize: 20, width: 36, height: 36,
            borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)", WebkitTapHighlightColor: "transparent",
          }}
        >‹</button>
      )}

      {/* Right arrow */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrentIdx((currentIdx + 1) % images.length); }}
          style={{
            position: "absolute", top: "50%", right: 6, transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "none",
            color: "#fff", fontSize: 20, width: 36, height: 36,
            borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)", WebkitTapHighlightColor: "transparent",
          }}
        >›</button>
      )}

      {/* Close button */}
      <button
        onClick={() => setOpen(false)}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(255,255,255,0.18)", border: "none",
          color: "#fff", fontSize: 22, fontWeight: "bold",
          width: 40, height: 40,
          borderRadius: "50%", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
          WebkitTapHighlightColor: "transparent",
        }}
      >✕</button>
    </div>
  ) : null;

  return (
    <>
      <div
        onClick={() => { setCurrentIdx(0); setOpen(true); }}
        style={{
          width: "clamp(100px, 25vw, 140px)", height: "clamp(72px, 18vw, 100px)",
          borderRadius: 12,
          background: `url(${primarySrc}) center/cover no-repeat`,
          cursor: "pointer", flexShrink: 0,
          border: `1px solid ${theme.border}`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          position: "relative",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 4px 20px rgba(34,211,238,0.15)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
        title="Click to enlarge"
      >
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 6, right: 6,
            background: "rgba(0,0,0,0.6)", color: "#fff",
            fontSize: 10, padding: "2px 7px", borderRadius: 10,
            fontWeight: 600,
          }}>
            {images.length} {t("gallery_imgs")}
          </div>
        )}
      </div>
      {lightboxContent && ReactDOM.createPortal(lightboxContent, document.body)}
    </>
  );
};

// ─── CSS-in-JS helper ────────────────────────────────────────────────
const injectStyles = () => {
  const id = "gc-styles";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=Instrument+Serif:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${theme.bg};
      color: ${theme.text};
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .serif { font-family: 'Instrument Serif', serif; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${theme.bg}; }
    ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .animate-up { animation: fadeUp 0.7s ease-out both; }
    .animate-fade { animation: fadeIn 0.6s ease-out both; }
    .animate-left { animation: slideInLeft 0.7s ease-out both; }

    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }
    .delay-6 { animation-delay: 0.6s; }
    .delay-7 { animation-delay: 0.7s; }
    .delay-8 { animation-delay: 0.8s; }

    /* Glow effect on accent links */
    .glow-link {
      color: ${theme.accent};
      text-decoration: none;
      position: relative;
      transition: all 0.3s ease;
    }
    .glow-link:hover {
      text-shadow: 0 0 12px ${theme.accentGlow};
    }

    /* Card hover lift */
    .card-lift {
      transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
    }
    .card-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(34,211,238,0.08);
      border-color: ${theme.accent} !important;
    }

    /* Noise texture overlay */
    .noise::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }

    /* Editable blocks in edit mode */
    .editable-block {
      transition: all 0.2s ease;
    }
    .editable-block.edit-mode {
      border: 2px solid ${theme.accent} !important;
      outline: 2px solid rgba(34,211,238,0.3);
      outline-offset: 0px;
      padding: 8px !important;
    }
    .editable-block.edit-mode:focus {
      box-shadow: 0 0 16px rgba(34,211,238,0.2);
    }
  `;
  document.head.appendChild(style);
};

// ─── Decorative grid background ──────────────────────────────────────
const GridBg = () => (
  <div style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "64px 64px",
    pointerEvents: "none",
    zIndex: 0,
  }} />
);

// ─── Navigation ──────────────────────────────────────────────────────
const Nav = ({ page, setPage, onToggleTheme, currentThemeMode, lang, setLang, t, content, editMode, setContent }) => {
  const showLangToggle = content?.settings?.showLanguageToggle !== false;
  const brandName = content?.branding?.site_name || t("site_name") || "DropCMS";
  const brandLogo = content?.branding?.logo_url || "";
  const updateBranding = (key, value) => {
    if (!setContent) return;
    setContent(prev => ({ ...prev, branding: { ...(prev?.branding || {}), [key]: value } }));
  };
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const [navEditorOpen, setNavEditorOpen] = useState(false);

  const defaultNavLabels = {
    [PAGES.HOME]: { key: "nav_home" },
    [PAGES.ABOUT]: { key: "nav_about" },
    [PAGES.CONTACT]: { key: "nav_contact" },
    [PAGES.PROJECTS]: { key: "nav_projects" },
  };

  const defaultNavItems = [
    { key: PAGES.HOME, label: t("nav_home"), visible: true },
    { key: PAGES.ABOUT, label: t("nav_about"), visible: true },
    { key: PAGES.CONTACT, label: t("nav_contact"), visible: true },
    { key: PAGES.PROJECTS, label: t("nav_projects"), visible: true },
  ];

  // Get the display label for a nav item, respecting current language
  const getNavLabel = (item) => {
    if (item.labels && item.labels[lang]) return item.labels[lang];
    if (defaultNavLabels[item.key]) return t(defaultNavLabels[item.key].key);
    return item.label || item.key;
  };

  const storedNav = content?.navigation?.items;
  // Merge stored with defaults — keep stored order/visibility, add any missing defaults
  const allNavItems = storedNav ? storedNav.map(item => {
    return { ...item, label: getNavLabel(item) };
  }) : defaultNavItems;

  const navItems = allNavItems.filter(item => item.visible !== false);

  const updateNavItems = (newItems) => {
    setContent(prev => ({
      ...prev,
      navigation: { ...(prev?.navigation || {}), items: newItems }
    }));
  };

  const moveNavItem = (idx, direction) => {
    const items = [...allNavItems];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    [items[idx], items[swapIdx]] = [items[swapIdx], items[idx]];
    updateNavItems(items);
  };

  const toggleNavVisibility = (idx) => {
    const items = [...allNavItems];
    items[idx] = { ...items[idx], visible: !items[idx].visible };
    updateNavItems(items);
  };

  const updateNavLabel = (idx, label) => {
    const items = [...allNavItems];
    const item = { ...items[idx] };
    if (!item.labels) item.labels = {};
    item.labels[lang] = label;
    item.label = label;
    items[idx] = item;
    updateNavItems(items);
  };

  const addCustomNavLink = () => {
    const label = prompt("Link label:");
    if (!label) return;
    const url = prompt("URL (https://...):");
    if (!url) return;
    const items = [...allNavItems, { key: "custom_" + Date.now(), label, labels: { [lang]: label }, url, visible: true }];
    updateNavItems(items);
  };

  const removeNavItem = (idx) => {
    const items = [...allNavItems];
    items.splice(idx, 1);
    updateNavItems(items);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? (theme.mode === "dark" ? "rgba(10,15,26,0.92)" : "rgba(245,247,250,0.92)") : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${theme.border}` : "1px solid transparent",
      transition: "all 0.4s ease",
      padding: "0 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 72,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", position: "relative" }}
          onClick={() => { if (!editMode) { setPage(PAGES.HOME); window.scrollTo(0, 0); } }}
        >
          {brandLogo ? (
            <img src={brandLogo} alt={brandName} style={{ height: 32, width: "auto", borderRadius: 6 }} />
          ) : (
            <CompassLogo size={32} />
          )}
          {editMode ? (
            <input
              value={brandName}
              onChange={e => updateBranding("site_name", e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{
                fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em",
                color: theme.white, background: "transparent",
                border: `1px dashed ${theme.accent}40`,
                borderRadius: 6, padding: "2px 8px", outline: "none",
                fontFamily: "'DM Sans', sans-serif", width: 180,
              }}
            />
          ) : (
            <span style={{
              fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em",
              color: theme.white,
            }}>
              {brandName}
            </span>
          )}
          {editMode && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const input = document.createElement("input");
                input.type = "file"; input.accept = "image/*";
                input.onchange = async (ev) => {
                  const file = ev.target.files[0]; if (!file) return;
                  const fd = new FormData(); fd.append("image", file);
                  try {
                    const res = await fetch(API_URL + "?action=upload", { method: "POST", credentials: "include", body: fd });
                    const data = await res.json();
                    if (data.url) updateBranding("logo_url", data.url);
                  } catch (err) { alert("Upload failed"); }
                };
                input.click();
              }}
              style={{
                background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 600,
                color: theme.textMuted, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >{brandLogo ? "Change" : "Logo"}</button>
          )}
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}
             className="desktop-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.url) { window.open(item.url, "_blank"); }
                else { setPage(item.key); window.scrollTo(0, 0); setMobileOpen(false); }
              }}
              style={{
                background: !item.url && page === item.key ? theme.accentDim : "transparent",
                border: "none",
                color: !item.url && page === item.key ? theme.accent : theme.textMuted,
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.25s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => {
                if (item.url || page !== item.key) {
                  e.target.style.color = theme.white;
                  e.target.style.background = "rgba(148,163,184,0.08)";
                }
              }}
              onMouseLeave={e => {
                if (item.url || page !== item.key) {
                  e.target.style.color = (!item.url && page === item.key) ? theme.accent : theme.textMuted;
                  e.target.style.background = (!item.url && page === item.key) ? theme.accentDim : "transparent";
                }
              }}
            >
              {item.label}{item.url ? " ↗" : ""}
            </button>
          ))}
          {/* Nav editor toggle (edit mode only) */}
          {editMode && (
            <button
              onClick={() => setNavEditorOpen(!navEditorOpen)}
              title="Edit navigation"
              style={{
                background: navEditorOpen ? theme.accentDim : "rgba(148,163,184,0.08)",
                border: `1px solid ${navEditorOpen ? theme.accent + "44" : theme.border}`,
                borderRadius: 8, padding: "5px 8px",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: 2, transition: "all 0.2s",
                color: navEditorOpen ? theme.accent : theme.textMuted, fontSize: 13,
              }}
            >
              ✎
            </button>
          )}
          {/* Light/Dark toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={currentThemeMode === "dark" ? t("theme_light") : t("theme_dark")}
              style={{
                background: "rgba(148,163,184,0.08)",
                border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: "6px 8px",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: 4, transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.accentDim; e.currentTarget.style.borderColor = theme.accent + "44"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; }}
            >
              {currentThemeMode === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}
          {/* Language toggle */}
          {setLang && showLangToggle && (
            <button
              onClick={() => setLang(lang === 'en' ? 'sv' : 'en')}
              title={lang === 'en' ? 'Byt till svenska' : 'Switch to English'}
              style={{
                background: "rgba(148,163,184,0.08)",
                border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: "5px 10px",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: 4, transition: "all 0.2s",
                fontSize: 12, fontWeight: 600, color: theme.textMuted,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.02em",
                minWidth: 36,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.accentDim; e.currentTarget.style.borderColor = theme.accent + "44"; e.currentTarget.style.color = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
            >
              {lang === 'en' ? 'SV' : 'EN'}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none", background: "none", border: "none",
            color: theme.white, fontSize: 28, cursor: "pointer",
            padding: 4,
          }}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          background: theme.mode === "dark" ? "rgba(10,15,26,0.97)" : "rgba(245,247,250,0.97)", backdropFilter: "blur(16px)",
          padding: "12px 24px 24px", borderTop: `1px solid ${theme.border}`,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.url) { window.open(item.url, "_blank"); }
                else { setPage(item.key); window.scrollTo(0, 0); }
                setMobileOpen(false);
              }}
              style={{
                background: !item.url && page === item.key ? theme.accentDim : "transparent",
                border: "none",
                color: !item.url && page === item.key ? theme.accent : theme.textMuted,
                padding: "12px 16px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {item.label}{item.url ? " ↗" : ""}
            </button>
          ))}
          {/* Mobile theme toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              style={{
                background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: "10px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, marginTop: 4,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: theme.textMuted,
              }}
            >
              {currentThemeMode === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
              {currentThemeMode === "dark" ? t("theme_light") : t("theme_dark")}
            </button>
          )}
          {/* Mobile language toggle */}
          {setLang && showLangToggle && (
            <button
              onClick={() => { setLang(lang === 'en' ? 'sv' : 'en'); setMobileOpen(false); }}
              style={{
                background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                borderRadius: 8, padding: "10px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, marginTop: 4,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: theme.textMuted,
              }}
            >
              <span style={{ fontSize: 16 }}>{lang === 'en' ? '🇸🇪' : '🇬🇧'}</span>
              {lang === 'en' ? 'Svenska' : 'English'}
            </button>
          )}
        </div>
      )}

      {/* Nav editor panel (edit mode) */}
      {editMode && navEditorOpen && (
        <div style={{
          background: theme.mode === "dark" ? "rgba(10,15,26,0.97)" : "rgba(245,247,250,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${theme.border}`,
          padding: "16px 24px",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              Edit Navigation
              <span style={{ fontSize: 10, background: theme.accentDim, color: theme.accent, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{lang.toUpperCase()}</span>
            </div>
            {allNavItems.map((item, idx) => (
              <div key={item.key} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 0",
                borderBottom: idx < allNavItems.length - 1 ? `1px solid ${theme.border}` : "none",
                opacity: item.visible === false ? 0.4 : 1,
              }}>
                {/* Move arrows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveNavItem(idx, "up")} disabled={idx === 0}
                    style={{ background: "none", border: "none", color: theme.textMuted, cursor: idx === 0 ? "default" : "pointer", fontSize: 11, padding: "1px 4px", opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                  <button onClick={() => moveNavItem(idx, "down")} disabled={idx === allNavItems.length - 1}
                    style={{ background: "none", border: "none", color: theme.textMuted, cursor: idx === allNavItems.length - 1 ? "default" : "pointer", fontSize: 11, padding: "1px 4px", opacity: idx === allNavItems.length - 1 ? 0.3 : 1 }}>▼</button>
                </div>
                {/* Visibility toggle */}
                <button onClick={() => toggleNavVisibility(idx)} style={{
                  background: item.visible !== false ? theme.accent : "rgba(148,163,184,0.15)",
                  border: "none", borderRadius: 4, width: 20, height: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: item.visible !== false ? theme.bg : theme.textMuted, fontSize: 12,
                }}>{item.visible !== false ? "✓" : ""}</button>
                {/* Label input */}
                <input
                  value={item.label}
                  onChange={e => updateNavLabel(idx, e.target.value)}
                  style={{
                    flex: 1, background: "rgba(148,163,184,0.06)",
                    border: `1px solid ${theme.border}`, borderRadius: 6,
                    padding: "6px 10px", fontSize: 13, color: theme.white,
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
                {/* Page key / URL indicator */}
                <span style={{ fontSize: 11, color: theme.textMuted, minWidth: 60 }}>
                  {item.url ? "URL" : item.key}
                </span>
                {/* Delete (only custom items) */}
                {item.key?.startsWith("custom_") && (
                  <button onClick={() => removeNavItem(idx)} style={{
                    background: "#ef4444", border: "none", borderRadius: 4,
                    width: 20, height: 20, cursor: "pointer", color: "#fff", fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={addCustomNavLink} style={{
              marginTop: 12, background: "transparent",
              border: `1px dashed ${theme.accent}40`, borderRadius: 8,
              padding: "8px 16px", color: theme.accent, fontSize: 13,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              width: "100%",
            }}>+ Add Custom Link</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

// ─── Section wrapper ─────────────────────────────────────────────────
const Section = ({ children, style: s = {}, className = "", dataContentKey = "", bgImage = "", editMode: secEdit = false, onBgChange = null }) => (
  <section
    className={className}
    data-content-key={dataContentKey}
    style={{
      maxWidth: 1200,
      margin: "0 auto",
      padding: "0 24px",
      position: bgImage ? "relative" : undefined,
      ...s,
    }}
  >
    {bgImage && (
      <>
        <div style={{
          position: "absolute", top: 0, left: -9999, right: -9999, bottom: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover", backgroundPosition: "center",
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute", top: 0, left: -9999, right: -9999, bottom: 0,
          background: theme.mode === "dark" ? "rgba(10,15,26,0.82)" : "rgba(245,247,250,0.82)",
          zIndex: 0,
        }} />
      </>
    )}
    {secEdit && onBgChange && (
      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 4, marginBottom: 8 }}>
        <button
          onClick={async () => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = "image/*";
            input.onchange = async (e) => {
              const file = e.target.files[0]; if (!file) return;
              const fd = new FormData(); fd.append("image", file);
              try {
                const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: fd });
                const data = await res.json();
                if (data.url) onBgChange(data.url);
              } catch (err) { alert("Upload failed"); }
            };
            input.click();
          }}
          style={{
            background: bgImage ? "rgba(34,211,238,0.2)" : "rgba(148,163,184,0.12)",
            border: `1px solid ${bgImage ? theme.accent + "40" : theme.border}`,
            borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600,
            color: bgImage ? theme.accent : theme.textMuted, cursor: "pointer",
          }}
        >{bgImage ? "Change Section BG" : "Add Section BG"}</button>
        {bgImage && (
          <button
            onClick={() => onBgChange("")}
            style={{
              background: "rgba(239,68,68,0.15)", color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}
          >✕ Remove</button>
        )}
      </div>
    )}
    <div style={{ position: bgImage ? "relative" : undefined, zIndex: bgImage ? 1 : undefined }}>
      {children}
    </div>
  </section>
);

// Reusable content box with optional admin-configurable background image
const SectionBox = ({ children, style: s = {}, bgKey, content: boxContent, editMode: boxEdit, updateContent: boxUpdate, className = "" }) => {
  const bgImage = (bgKey && boxContent?.[bgKey]?.bg_image) || "";
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", ...s }}>
      {bgImage && (
        <>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat",
            zIndex: 0,
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: theme.mode === "dark"
              ? "rgba(10,15,26,0.82)"
              : "rgba(245,247,250,0.82)",
            zIndex: 0,
          }} />
        </>
      )}
      {boxEdit && bgKey && (
        <div style={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          display: "flex", gap: 4,
        }}>
          <button
            onClick={async () => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "image/*";
              input.onchange = async (e) => {
                const file = e.target.files[0]; if (!file) return;
                const fd = new FormData(); fd.append("image", file);
                try {
                  const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: fd });
                  const data = await res.json();
                  if (data.url) boxUpdate(bgKey, "bg_image", data.url);
                } catch (err) { alert("Upload failed"); }
              };
              input.click();
            }}
            style={{
              background: bgImage ? "rgba(34,211,238,0.2)" : "rgba(148,163,184,0.12)",
              border: `1px solid ${bgImage ? theme.accent + "40" : theme.border}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600,
              color: bgImage ? theme.accent : theme.textMuted, cursor: "pointer",
            }}
            title="Set section background image"
          >{bgImage ? "Change BG" : "Add BG"}</button>
          {bgImage && (
            <button
              onClick={() => boxUpdate(bgKey, "bg_image", "")}
              style={{
                background: "rgba(239,68,68,0.15)", color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer",
              }}
              title="Remove background image"
            >✕</button>
          )}
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// ─── Page header with optional background image/video ────────────────
const PageHero = ({ children, bgKey, content: phContent, editMode: phEdit, updateContent: phUpdate }) => {
  const bgImage = phContent?.[bgKey]?.bg_image || "";
  const bgVideo = phContent?.[bgKey]?.bg_video || "";
  const hasMedia = bgImage || bgVideo;
  const overlay = hasMedia ? (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      background: theme.mode === "dark"
        ? "linear-gradient(180deg, rgba(10,15,26,0.7) 0%, rgba(10,15,26,0.85) 60%, rgba(10,15,26,0.95) 100%)"
        : "linear-gradient(180deg, rgba(245,247,250,0.65) 0%, rgba(245,247,250,0.8) 60%, rgba(245,247,250,0.95) 100%)",
      zIndex: 0,
    }} />
  ) : null;
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {bgVideo && (
        <video autoPlay muted loop playsInline style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
        }} src={bgVideo} />
      )}
      {bgImage && !bgVideo && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${bgImage})`, backgroundSize: "cover",
          backgroundPosition: "center", zIndex: 0,
        }} />
      )}
      {overlay}
      {phEdit && (
        <div style={{
          position: "absolute", top: 80, right: 24, zIndex: 10,
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: "10px 14px",
          display: "flex", flexDirection: "column", gap: 6, minWidth: 180,
        }}>
          <label style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>Page Header BG</label>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={async () => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "image/*";
              input.onchange = async (e) => {
                const file = e.target.files[0]; if (!file) return;
                const fd = new FormData(); fd.append("image", file);
                try {
                  const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: fd });
                  const data = await res.json();
                  if (data.url) { phUpdate(bgKey, "bg_image", data.url); phUpdate(bgKey, "bg_video", ""); }
                } catch (err) { alert("Upload failed"); }
              };
              input.click();
            }} style={{
              background: bgImage ? "rgba(34,211,238,0.15)" : "rgba(148,163,184,0.08)",
              color: bgImage ? theme.accent : theme.text,
              border: `1px solid ${bgImage ? theme.accent + "40" : theme.border}`,
              borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}>Image {bgImage ? "✓" : ""}</button>
            <button onClick={async () => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "video/mp4,video/webm";
              input.onchange = async (e) => {
                const file = e.target.files[0]; if (!file) return;
                const fd = new FormData(); fd.append("image", file);
                try {
                  const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: fd });
                  const data = await res.json();
                  if (data.url) { phUpdate(bgKey, "bg_video", data.url); phUpdate(bgKey, "bg_image", ""); }
                } catch (err) { alert("Upload failed"); }
              };
              input.click();
            }} style={{
              background: bgVideo ? "rgba(34,211,238,0.15)" : "rgba(148,163,184,0.08)",
              color: bgVideo ? theme.accent : theme.text,
              border: `1px solid ${bgVideo ? theme.accent + "40" : theme.border}`,
              borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}>Video {bgVideo ? "✓" : ""}</button>
          </div>
          {hasMedia && (
            <button onClick={() => { phUpdate(bgKey, "bg_image", ""); phUpdate(bgKey, "bg_video", ""); }} style={{
              background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start",
            }}>Remove</button>
          )}
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// ─── Accent button ───────────────────────────────────────────────────
const AccentBtn = ({ children, onClick, style: s = {} }) => (
  <button
    onClick={onClick}
    style={{
      background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
      color: theme.bg,
      border: "none",
      padding: "14px 32px",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.3s ease",
      boxShadow: `0 4px 20px ${theme.accentGlow}`,
      letterSpacing: "0.02em",
      ...s,
    }}
    onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 30px ${theme.accentGlow}`; }}
    onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 20px ${theme.accentGlow}`; }}
  >
    {children}
  </button>
);

// ─── Outline button ──────────────────────────────────────────────────
const OutlineBtn = ({ children, onClick, style: s = {} }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      color: theme.accent,
      border: `1.5px solid ${theme.accent}44`,
      padding: "13px 30px",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.3s ease",
      ...s,
    }}
    onMouseEnter={e => { e.target.style.borderColor = theme.accent; e.target.style.background = theme.accentDim; }}
    onMouseLeave={e => { e.target.style.borderColor = theme.accent + "44"; e.target.style.background = "transparent"; }}
  >
    {children}
  </button>
);

// Decode HTML entities (e.g. &amp; → &)
const decodeHTML = (html) => {
  if (!html || typeof html !== "string") return html;
  const el = document.createElement("textarea");
  el.innerHTML = html;
  return el.value;
};

// ─── Service Card ────────────────────────────────────────────────────
const ServiceCard = ({ title, subtitle, price, items, highlight, editMode, onUpdate, onDelete }) => (
  <div
    className="card-lift"
    style={{
      background: highlight
        ? `linear-gradient(160deg, rgba(34,211,238,0.06), ${theme.bgCard})`
        : theme.bgCard,
      border: `1px solid ${highlight ? "rgba(34,211,238,0.2)" : theme.border}`,
      borderRadius: 16,
      padding: "36px 28px",
      flex: 1,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {highlight && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${theme.accent}, #06b6d4, ${theme.accent})`,
        backgroundSize: "200% 100%",
        animation: "gradientShift 3s ease infinite",
      }} />
    )}
    {editMode && onDelete && (
      <button onClick={onDelete} style={{
        position: "absolute", top: 8, right: 8, background: "rgba(255,107,107,0.08)",
        border: "1px solid rgba(255,107,107,0.25)", borderRadius: 6, padding: "4px 10px",
        fontSize: 11, cursor: "pointer", color: "#ff6b6b", fontFamily: "'DM Sans', sans-serif",
      }}>✕ Remove card</button>
    )}
    {editMode && onUpdate ? (
      <EditableText value={title} onChange={v => onUpdate("title", v)} editMode={editMode} tag="h3"
        style={{ fontSize: 20, fontWeight: 600, color: theme.white, marginBottom: 6, lineHeight: 1.3 }} />
    ) : (
      <h3 style={{ fontSize: 20, fontWeight: 600, color: theme.white, marginBottom: 6, lineHeight: 1.3 }}>{decodeHTML(title)}</h3>
    )}
    {editMode && onUpdate ? (
      <EditableText value={subtitle} onChange={v => onUpdate("subtitle", v)} editMode={editMode} tag="p"
        style={{ fontSize: 13, color: theme.accent, fontWeight: 500, marginBottom: 20, opacity: 0.8 }} />
    ) : (
      <p style={{ fontSize: 13, color: theme.accent, fontWeight: 500, marginBottom: 20, opacity: 0.8 }}>{decodeHTML(subtitle)}</p>
    )}
    {editMode && onUpdate ? (
      <EditableText value={price} onChange={v => onUpdate("price", v)} editMode={editMode} tag="p"
        style={{ fontSize: 13, color: theme.textMuted, marginBottom: 20, lineHeight: 1.5 }} />
    ) : (
      <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 20, lineHeight: 1.5 }}>{decodeHTML(price)}</p>
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(items || []).map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: theme.accent, fontSize: 14, marginTop: 2, flexShrink: 0 }}>◆</span>
          {editMode && onUpdate ? (
            <EditableText value={item} onChange={v => {
              const newItems = [...(items || [])];
              newItems[i] = v;
              onUpdate("items", newItems);
            }} editMode={editMode} tag="span"
              style={{ fontSize: 14, color: theme.textLight, lineHeight: 1.5, flex: 1 }} />
          ) : (
            <span style={{ fontSize: 14, color: theme.textLight, lineHeight: 1.5 }}>{decodeHTML(item)}</span>
          )}
          {editMode && onUpdate && (
            <button onClick={() => {
              const newItems = [...(items || [])];
              newItems.splice(i, 1);
              onUpdate("items", newItems);
            }} style={{
              background: "none", border: "none", color: "#ff6b6b", cursor: "pointer",
              fontSize: 14, padding: "0 4px", flexShrink: 0,
            }}>✕</button>
          )}
        </div>
      ))}
    </div>
    {editMode && onUpdate && (
      <div style={{ marginTop: 12 }}>
        <div onClick={() => {
          const newItems = [...(items || []), "New item"];
          onUpdate("items", newItems);
        }} style={{
          color: theme.accent, cursor: "pointer", fontSize: 13, marginTop: 8,
          padding: "8px 16px", border: `1px dashed ${theme.accent}`, borderRadius: 8, display: "inline-block",
        }}>+ Add item</div>
      </div>
    )}
    {editMode && onUpdate && (
      <label style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 16,
        fontSize: 12, color: theme.textMuted, cursor: "pointer",
      }}>
        <input type="checkbox" checked={!!highlight} onChange={e => onUpdate("highlight", e.target.checked)} />
        Highlight card
      </label>
    )}
  </div>
);

// ─── Question Pill ───────────────────────────────────────────────────
const QuestionPill = ({ text, delay }) => (
  <div
    className={`animate-up delay-${delay}`}
    style={{
      background: "rgba(148,163,184,0.06)",
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: "16px 22px",
      fontSize: 14.5,
      color: theme.textLight,
      lineHeight: 1.6,
      fontStyle: "italic",
      transition: "all 0.3s ease",
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "rgba(34,211,238,0.25)";
      e.currentTarget.style.background = "rgba(34,211,238,0.04)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = theme.border;
      e.currentTarget.style.background = "rgba(148,163,184,0.06)";
    }}
  >
    {text}
  </div>
);

// ─── Competency Tag ──────────────────────────────────────────────────
const Tag = ({ text }) => (
  <span style={{
    display: "inline-block",
    background: theme.accentDim,
    color: theme.accent,
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    border: `1px solid rgba(34,211,238,0.15)`,
  }}>
    {text}
  </span>
);

// ─── Admin Login ──────────────────────────────────────────────────────
const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  // view: "login" | "forgot" | "reset"
  const [view, setView] = useState(() => {
    const hash = window.location.hash;
    const resetMatch = hash.match(/reset=([a-f0-9]{64})/);
    return resetMatch ? "reset" : "login";
  });
  const [resetToken] = useState(() => {
    const match = window.location.hash.match(/reset=([a-f0-9]{64})/);
    return match ? match[1] : "";
  });
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputStyle = {
    width: "100%",
    background: "rgba(148,163,184,0.06)",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    color: theme.white,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.ok) { onLoginSuccess(); }
      else { setError(data.error || data.message || "Login failed"); }
    } catch (err) {
      setError("Connection failed. Using demo mode.");
      if (username && password) onLoginSuccess();
    } finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.ok) { setSuccess(data.message); }
      else { setError(data.error || "Something went wrong"); }
    } catch (err) { setError("Connection failed"); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}?action=reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      const data = await response.json();
      if (data.ok) {
        setSuccess(data.message);
        window.location.hash = "#admin";
        setTimeout(() => setView("login"), 2000);
      } else { setError(data.error || "Reset failed"); }
    } catch (err) { setError("Connection failed"); }
    finally { setLoading(false); }
  };

  const containerStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(10,15,26,0.95)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 999,
  };
  const cardStyle = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    padding: "48px 40px",
    maxWidth: 400,
    width: "90%",
  };
  const btnStyle = {
    background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
    color: theme.bg, border: "none", padding: "12px 24px", borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.6 : 1, width: "100%",
  };
  const linkStyle = { fontSize: 13, color: theme.accent, cursor: "pointer", background: "none", border: "none", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <CompassLogo size={32} />
          <span style={{ fontSize: 20, fontWeight: 600, color: theme.white }}>
            {view === "login" ? "Admin Login" : view === "forgot" ? "Reset Password" : "New Password"}
          </span>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: "#ff6b6b", background: "rgba(255,107,107,0.1)", padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ fontSize: 13, color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>
            {success}
          </div>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <button type="button" onClick={() => { setView("forgot"); setError(""); setSuccess(""); }} style={linkStyle}>
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
              Enter your admin email address. If it matches, we'll send you a password reset link.
            </div>
            <div>
              <label style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <button type="button" onClick={() => { setView("login"); setError(""); setSuccess(""); }} style={linkStyle}>
                Back to login
              </button>
            </div>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
              Enter your new password (minimum 8 characters).
            </div>
            <div>
              <label style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>New password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} required minLength={8} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>Confirm password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} required minLength={8} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Resetting..." : "Set new password"}
            </button>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <button type="button" onClick={() => { setView("login"); setError(""); setSuccess(""); window.location.hash = "#admin"; }} style={linkStyle}>
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Post Editor Modal ────────────────────────────────────────────────
const PostEditor = ({ isOpen, onClose, onSave, editingPost = null, adminLoggedIn, categories = [] }) => {
  const emptyForm = {
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    features: "",
    role: "",
    technologies: "",
    category: categories.length > 0 ? categories[0].id : "projects",
    published: false,
    images: [],
    imageUrl: "",
    links: [],
  };

  const normalizePost = (post) => {
    if (!post) return emptyForm;
    // Build images array: prefer images[], fall back to single imageUrl
    let images = [];
    if (Array.isArray(post.images) && post.images.length > 0) {
      images = post.images;
    } else if (post.imageUrl) {
      images = [post.imageUrl];
    }
    return {
      ...emptyForm,
      ...post,
      images,
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags || ""),
      features: Array.isArray(post.features) ? post.features.join("\n") : (post.features || ""),
      technologies: Array.isArray(post.technologies) ? post.technologies.join(", ") : (post.technologies || ""),
      links: Array.isArray(post.links) ? post.links : [],
      category: post.category || (categories.length > 0 ? categories[0].id : "projects"),
    };
  };

  const [formData, setFormData] = useState(() => normalizePost(editingPost));
  const [seoPreview, setSeoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(normalizePost(editingPost));
    setSeoPreview(null);
  }, [editingPost]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch(`${API_URL}?action=upload`, {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), data.url],
          imageUrl: prev.images.length === 0 ? data.url : prev.imageUrl,
        }));
      }
    } catch (err) {
      alert("Failed to upload image");
    }
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== idx);
      return { ...prev, images: newImages, imageUrl: newImages[0] || "" };
    });
  };

  const moveImage = (idx, direction) => {
    setFormData(prev => {
      const imgs = [...prev.images];
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= imgs.length) return prev;
      [imgs[idx], imgs[newIdx]] = [imgs[newIdx], imgs[idx]];
      return { ...prev, images: imgs, imageUrl: imgs[0] || "" };
    });
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { url: "", label: "" }],
    }));
  };

  const removeLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link),
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert("Title and Content are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        features: formData.features.split("\n").map(f => f.trim()).filter(Boolean),
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
        images: formData.images || [],
        imageUrl: (formData.images && formData.images[0]) || formData.imageUrl || "",
      };

      const url = editingPost && editingPost.id
        ? `${API_URL}?action=post&id=${editingPost.id}`
        : `${API_URL}?action=posts`;
      const method = editingPost && editingPost.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.ok) {
        const postSeo = data.post && data.post.seo ? data.post.seo : null;
        setSeoPreview({
          title: postSeo ? postSeo.title : formData.title,
          description: postSeo ? postSeo.description : formData.excerpt.substring(0, 160),
        });
        setTimeout(() => {
          onSave();
          onClose();
        }, 1500);
      } else {
        alert("Failed to save post");
      }
    } catch (err) {
      alert("Error saving post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingPost || !editingPost.id) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=post&id=${editingPost.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.ok) {
        onSave();
        onClose();
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      alert("Error deleting post");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(10,15,26,0.95)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
      overflow: "auto",
      padding: "20px",
    }}>
      <div style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: "40px",
        maxWidth: 700,
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: theme.white }}>
            {editingPost ? "Edit Post" : "New Post"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: theme.textMuted,
              fontSize: 28,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {seoPreview ? (
          <div style={{
            background: "rgba(34,211,238,0.08)",
            border: `1px solid ${theme.accent}`,
            borderRadius: 12,
            padding: "20px",
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: theme.accent, fontWeight: 600, marginBottom: 8 }}>SEO Preview</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: theme.white, marginBottom: 6 }}>
              {seoPreview.title}
            </p>
            <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>
              {seoPreview.description}
            </p>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Title *
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              The project name. This appears as the heading on the project card.
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Category *
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              Choose which section this project appears under on the Projects page.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(categories.length > 0 ? categories : [
                { id: "projects", title: "Projects" },
                { id: "other", title: "Other" },
              ]).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  style={{
                    flex: "1 1 auto",
                    minWidth: 120,
                    padding: "12px 16px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s ease",
                    background: formData.category === cat.id
                      ? `linear-gradient(135deg, ${theme.accent}, #06b6d4)`
                      : "rgba(148,163,184,0.06)",
                    color: formData.category === cat.id ? theme.bg : theme.textMuted,
                    border: formData.category === cat.id
                      ? "1px solid transparent"
                      : `1px solid ${theme.border}`,
                  }}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Content (HTML) *
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              The full project description. You can use HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;br&gt;, &lt;a href="..."&gt; for formatting.
            </div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', monospace",
                outline: "none",
                minHeight: 120,
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Excerpt
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              A short summary shown on the project card. If left empty, it will be auto-generated from the content.
            </div>
            <input
              type="text"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Images {formData.images.length > 0 && <span style={{ color: theme.accent }}>— first image is the thumbnail</span>}
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              Upload one or more images. The first image becomes the thumbnail on the card. Use the arrows to reorder. Click an image on the live site to open a carousel.
            </div>

            {/* Image list with sort controls */}
            {formData.images.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: idx === 0 ? "rgba(34,211,238,0.08)" : "rgba(148,163,184,0.04)",
                    border: `1px solid ${idx === 0 ? "rgba(34,211,238,0.3)" : theme.border}`,
                    borderRadius: 10, padding: "8px 12px",
                  }}>
                    <div style={{
                      width: 56, height: 40, borderRadius: 6, flexShrink: 0,
                      background: `url(${imgUrl}) center/cover no-repeat`,
                      border: `1px solid ${theme.border}`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: idx === 0 ? theme.accent : theme.textMuted, fontWeight: idx === 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {idx === 0 ? "★ Primary" : `Image ${idx + 1}`}
                      </div>
                      <div style={{ fontSize: 11, color: theme.textMuted, opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {imgUrl}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                        style={{
                          background: "rgba(148,163,184,0.1)", border: "none", color: idx === 0 ? theme.border : theme.textLight,
                          width: 26, height: 26, borderRadius: 6, cursor: idx === 0 ? "default" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                        }}>↑</button>
                      <button onClick={() => moveImage(idx, 1)} disabled={idx === formData.images.length - 1}
                        style={{
                          background: "rgba(148,163,184,0.1)", border: "none",
                          color: idx === formData.images.length - 1 ? theme.border : theme.textLight,
                          width: 26, height: 26, borderRadius: 6,
                          cursor: idx === formData.images.length - 1 ? "default" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                        }}>↓</button>
                      <button onClick={() => removeImage(idx)}
                        style={{
                          background: "rgba(255,107,107,0.15)", border: "none", color: "#ff6b6b",
                          width: 26, height: 26, borderRadius: 6, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                        }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: theme.textMuted,
                cursor: "pointer",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Tags
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              Comma-separated labels shown as badges on the card, e.g. "Investment app, Finance tool"
            </div>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="React, Local + server data sync, Financial decision workflow design"
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Features
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              One feature per line. Each line becomes a bullet point under "Features" on the card.
            </div>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                minHeight: 80,
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Role
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              Describe your role in this project, e.g. "Product design, architecture and full-stack development."
            </div>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Technologies
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 6, lineHeight: 1.4 }}>
              Comma-separated list of tools and tech used, e.g. "React, Node.js, AWS". Shown as badges.
            </div>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleInputChange}
              style={{
                width: "100%",
                background: "rgba(148,163,184,0.06)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: theme.white,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Links
            </label>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginBottom: 10, lineHeight: 1.4 }}>
              Add external links related to this project (live demo, GitHub repo, etc.). Each link needs a URL and a display label.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formData.links.map((link, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(148,163,184,0.06)",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 14,
                      color: theme.white,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) => updateLink(i, "label", e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(148,163,184,0.06)",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      fontSize: 14,
                      color: theme.white,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => removeLink(i)}
                    style={{
                      background: "rgba(255,107,107,0.2)",
                      border: `1px solid rgba(255,107,107,0.4)`,
                      color: "#ff6b6b",
                      padding: "10px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addLink}
              style={{
                marginTop: 10,
                background: "transparent",
                border: `1px dashed ${theme.accent}`,
                color: theme.accent,
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              + Add Link
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              style={{ cursor: "pointer", width: 18, height: 18 }}
            />
            <label htmlFor="published" style={{ fontSize: 14, color: theme.textLight, cursor: "pointer" }}>
              Published
            </label>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginLeft: 8 }}>
              — When unchecked, only you (admin) can see this post
            </span>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
                color: theme.bg,
                border: "none",
                padding: "12px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : "Save Post"}
            </button>

            {editingPost && editingPost.id && (
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: "rgba(255,107,107,0.2)",
                  border: `1px solid rgba(255,107,107,0.4)`,
                  color: "#ff6b6b",
                  padding: "12px 24px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Delete
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                color: theme.textMuted,
                padding: "12px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Cookie Consent Banner ─────────────────────────────────────────
const CONSENT_KEY = "dropcms_cookie_consent";
const getStoredConsent = () => {
  try {
    const val = localStorage.getItem(CONSENT_KEY);
    if (val === "accepted" || val === "declined") return val;
  } catch (e) {}
  return null;
};

const CookieConsentBanner = ({ onAccept, onDecline }) => {
  const [visible, setVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: "rgba(10,15,26,0.97)", backdropFilter: "blur(12px)",
      borderTop: `1px solid ${theme.border}`,
      padding: "0",
      boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "24px 28px",
      }}>
        <div style={{
          display: "flex", gap: 20, alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: "1 1 400px", minWidth: 280 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="8" cy="9" r="1.5" fill={theme.accent}/>
                <circle cx="15" cy="7" r="1" fill={theme.accent}/>
                <circle cx="10" cy="15" r="1" fill={theme.accent}/>
                <circle cx="16" cy="13" r="1.5" fill={theme.accent}/>
                <circle cx="12" cy="11" r="0.5" fill={theme.accent}/>
              </svg>
              <span style={{ fontSize: 15, fontWeight: 600, color: theme.white }}>Cookie Settings</span>
            </div>
            <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6, margin: 0 }}>
              We use cookies to analyse site traffic and optimise your experience.
              You can accept all cookies or decline non-essential ones.
            </p>
            {showDetails && (
              <div style={{
                marginTop: 16, padding: "16px 20px",
                background: "rgba(148,163,184,0.05)",
                border: `1px solid ${theme.border}`,
                borderRadius: 12, fontSize: 13, color: theme.textMuted, lineHeight: 1.7,
              }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: theme.textLight }}>Essential cookies</span>
                    <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 500 }}>Always active</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12 }}>Required for the website to function properly. These cannot be disabled.</p>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: theme.textLight }}>Analytics cookies</span>
                    <span style={{ fontSize: 11, color: theme.accent, fontWeight: 500 }}>Google Analytics</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12 }}>Help us understand how visitors use the site so we can improve it. No personal data is shared with third parties.</p>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: theme.textLight }}>Location-based features</span>
                    <span style={{ fontSize: 11, color: theme.accent, fontWeight: 500 }}>Weather video</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12 }}>We use your approximate location (city-level, via IP address) to show a weather-matched background video. No precise location or personal data is stored.</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: "none", border: "none", color: theme.accent,
                fontSize: 12, cursor: "pointer", padding: "8px 0 0", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {showDetails ? "Hide details" : "Show details"}
            </button>
          </div>
          <div style={{
            display: "flex", gap: 10, alignItems: "center",
            flexShrink: 0, paddingTop: 4,
          }}>
            <button
              onClick={() => { setVisible(false); onDecline(); }}
              style={{
                background: "transparent",
                color: theme.textMuted,
                border: `1px solid ${theme.border}`,
                padding: "10px 22px", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.textMuted; e.currentTarget.style.color = theme.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
            >
              Decline
            </button>
            <button
              onClick={() => { setVisible(false); onAccept(); }}
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
                color: theme.bg,
                border: "none",
                padding: "10px 22px", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 4px 16px ${theme.accentGlow}`,
              }}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Settings Panel ──────────────────────────────────────────
const AdminSettingsPanel = ({ open, onClose, content, setContent }) => {
  if (!open) return null;
  const c = (key, fallback) => content?.settings?.[key] ?? fallback;
  const update = (key, value) => {
    setContent(prev => ({
      ...prev,
      settings: { ...(prev?.settings || {}), [key]: value }
    }));
  };
  const fieldStyle = {
    width: "100%", background: "rgba(148,163,184,0.06)",
    border: `1px solid ${theme.border}`, borderRadius: 8,
    padding: "10px 14px", fontSize: 13, color: theme.white,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    marginTop: 6,
  };
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: theme.bgCard, border: `1px solid ${theme.border}`,
        borderRadius: 20, padding: 36, maxWidth: 520, width: "90%",
        maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.white, margin: 0 }}>Site Settings</h2>
          <span onClick={onClose} style={{ cursor: "pointer", color: theme.textMuted, fontSize: 22 }}>✕</span>
        </div>

        {/* Theme Picker */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Site Theme</div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            Choose a dark and a light theme. Visitors can toggle between them with the sun/moon icon.
          </p>

          {/* Dark themes */}
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Dark Theme</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
            {Object.values(THEME_PRESETS).filter(p => p.mode === "dark").map(preset => {
              const isActive = (c("theme_dark", c("theme_id", "dark"))) === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => { update("theme_dark", preset.id); update("theme_id", preset.id); }}
                  style={{
                    cursor: "pointer",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: isActive ? `2px solid ${preset.accent}` : `1px solid ${theme.border}`,
                    transition: "all 0.2s",
                    opacity: isActive ? 1 : 0.7,
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.opacity = 0.7; }}
                >
                  <div style={{ background: preset.bg, padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.accent }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.textMuted, opacity: 0.4 }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.textMuted, opacity: 0.4 }} />
                    </div>
                    <div style={{ height: 6, width: "70%", borderRadius: 3, background: preset.white, opacity: 0.9, marginBottom: 4 }} />
                    <div style={{ height: 4, width: "90%", borderRadius: 2, background: preset.textMuted, opacity: 0.3, marginBottom: 3 }} />
                    <div style={{ height: 4, width: "60%", borderRadius: 2, background: preset.textMuted, opacity: 0.3 }} />
                    <div style={{
                      marginTop: 8, height: 14, width: "50%", borderRadius: 4,
                      background: preset.accent, opacity: 0.9,
                    }} />
                  </div>
                  <div style={{
                    padding: "6px 12px", background: preset.bgCard,
                    fontSize: 11, fontWeight: 600,
                    color: preset.text,
                    textAlign: "center",
                    borderTop: `1px solid ${preset.border}`,
                  }}>
                    {preset.label}
                    {isActive && <span style={{ marginLeft: 4, color: preset.accent }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Light themes */}
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Light Theme</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {Object.values(THEME_PRESETS).filter(p => p.mode === "light").map(preset => {
              const isActive = c("theme_light", "light") === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => update("theme_light", preset.id)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: isActive ? `2px solid ${preset.accent}` : `1px solid ${theme.border}`,
                    transition: "all 0.2s",
                    opacity: isActive ? 1 : 0.7,
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.opacity = 0.7; }}
                >
                  <div style={{ background: preset.bg, padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.accent }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.textMuted, opacity: 0.4 }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: preset.textMuted, opacity: 0.4 }} />
                    </div>
                    <div style={{ height: 6, width: "70%", borderRadius: 3, background: preset.white, opacity: 0.9, marginBottom: 4 }} />
                    <div style={{ height: 4, width: "90%", borderRadius: 2, background: preset.textMuted, opacity: 0.3, marginBottom: 3 }} />
                    <div style={{ height: 4, width: "60%", borderRadius: 2, background: preset.textMuted, opacity: 0.3 }} />
                    <div style={{
                      marginTop: 8, height: 14, width: "50%", borderRadius: 4,
                      background: preset.accent, opacity: 0.9,
                    }} />
                  </div>
                  <div style={{
                    padding: "6px 12px", background: preset.bgCard,
                    fontSize: 11, fontWeight: 600,
                    color: preset.text,
                    textAlign: "center",
                    borderTop: `1px solid ${preset.border}`,
                  }}>
                    {preset.label}
                    {isActive && <span style={{ marginLeft: 4, color: preset.accent }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability Status */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Availability Status</div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            Controls the color of the availability badge on the hero section.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "green", label: "Available", color: "#22c55e" },
              { id: "accent", label: "Limited", color: theme.accent },
              { id: "red", label: "Not Available", color: "#ef4444" },
            ].map(opt => {
              const isActive = c("availability_status", "green") === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => update("availability_status", opt.id)}
                  style={{
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 10,
                    border: isActive ? `2px solid ${opt.color}` : `1px solid ${theme.border}`,
                    background: isActive ? (theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)") : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", background: opt.color,
                    boxShadow: isActive ? `0 0 8px ${opt.color}` : "none",
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? opt.color : theme.textMuted }}>{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Analytics */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Analytics & Tracking</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: theme.textLight }}>Google Analytics Measurement ID</label>
            <input
              value={c("ga_id", "")}
              onChange={e => update("ga_id", e.target.value.trim())}
              placeholder="G-XXXXXXXXXX"
              style={fieldStyle}
            />
            <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              Paste your GA4 Measurement ID here. Get it from{" "}
              <a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: theme.accent }}>analytics.google.com</a>
              {" "}→ Admin → Data Streams → your site → Measurement ID.
              {c("ga_id", "") && /^G-[A-Z0-9]+$/.test(c("ga_id", "")) && (
                <span style={{ display: "block", marginTop: 6, color: "#4ade80", fontWeight: 600 }}>
                  ✓ Active — tracking is enabled
                </span>
              )}
              {c("ga_id", "") && !/^G-[A-Z0-9]+$/.test(c("ga_id", "")) && (
                <span style={{ display: "block", marginTop: 6, color: "#ff6b6b", fontWeight: 600 }}>
                  ✗ Invalid format — should look like G-XXXXXXXXXX
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Contact email */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Contact Form</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: theme.textLight }}>Notification email</label>
            <input
              value={c("contact_email", "")}
              onChange={e => update("contact_email", e.target.value.trim())}
              placeholder="you@example.com"
              style={fieldStyle}
            />
            <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              Contact form submissions will be sent to this address.
            </p>
          </div>
        </div>

        {/* Social links */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Social Links</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: theme.textLight }}>LinkedIn URL</label>
            <input
              value={c("linkedin_url", "")}
              onChange={e => update("linkedin_url", e.target.value.trim())}
              placeholder="https://linkedin.com/in/..."
              style={fieldStyle}
            />
          </div>
        </div>

        {/* Language Toggle Visibility */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Language</div>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div
              onClick={() => update("showLanguageToggle", !(c("showLanguageToggle", true) !== false))}
              style={{
                width: 40, height: 22, borderRadius: 11, position: "relative",
                background: c("showLanguageToggle", true) !== false ? theme.accent : "rgba(148,163,184,0.3)",
                transition: "background 0.2s", cursor: "pointer",
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3,
                left: c("showLanguageToggle", true) !== false ? 21 : 3,
                transition: "left 0.2s",
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: theme.textLight }}>Show language toggle</span>
          </label>
          <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 6, lineHeight: 1.5 }}>
            Controls whether the EN/SV language toggle is visible in the navigation bar. Swedish content is always accessible via the ?lang=sv URL parameter regardless of this setting.
          </p>
        </div>

        {/* Weather-Based Hero Video */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Weather-Based Hero Video</div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            When enabled, the hero video changes automatically based on the visitor's local weather.
            When disabled, only the default video (or the manually set hero background) is used.
          </p>

          {/* Enable/disable toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 16 }}>
            <div
              onClick={() => update("weather_video_enabled", !c("weather_video_enabled", false))}
              style={{
                width: 40, height: 22, borderRadius: 11, position: "relative",
                background: c("weather_video_enabled", false) ? theme.accent : "rgba(148,163,184,0.3)",
                transition: "background 0.2s", cursor: "pointer",
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3,
                left: c("weather_video_enabled", false) ? 21 : 3,
                transition: "left 0.2s",
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: theme.textLight }}>Enable weather-based video</span>
          </label>

          {/* OpenWeatherMap API Key */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: theme.textLight }}>OpenWeatherMap API Key</label>
            <input
              value={c("weather_api_key", "")}
              onChange={e => update("weather_api_key", e.target.value.trim())}
              placeholder="Paste your API key here"
              style={{...fieldStyle, fontFamily: "monospace", fontSize: 12}}
            />
            <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              Get a free API key from{" "}
              <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" style={{ color: theme.accent }}>openweathermap.org</a>.
              Free tier allows 1,000 calls/day.
            </p>
          </div>

          {/* Weather video slots */}
          {c("weather_video_enabled", false) && (() => {
            const weatherTypes = [
              { key: "default",      label: "Default (fallback)", icon: "🎬", desc: "Used when weather mode is off, or if no match is found" },
              { key: "night",        label: "Night",             icon: "🌙", desc: "After sunset — overrides other conditions when dark" },
              { key: "clear",        label: "Clear / Sunny",     icon: "☀️", desc: "Clear sky" },
              { key: "clouds",       label: "Cloudy",            icon: "☁️", desc: "Overcast, few/scattered/broken clouds" },
              { key: "rain",         label: "Rain",              icon: "🌧️", desc: "Light rain, moderate rain, heavy rain" },
              { key: "drizzle",      label: "Drizzle",           icon: "🌦️", desc: "Light drizzle" },
              { key: "thunderstorm", label: "Thunderstorm",      icon: "⛈️", desc: "Thunder and lightning" },
              { key: "snow",         label: "Snow",              icon: "❄️", desc: "Snowfall" },
              { key: "mist",         label: "Fog / Mist",        icon: "🌫️", desc: "Mist, fog, haze" },
            ];
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {weatherTypes.map(wt => {
                  const videoUrl = c(`weather_video_${wt.key}`, "");
                  return (
                    <div key={wt.key} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 10,
                      background: videoUrl ? "rgba(34,211,238,0.06)" : "rgba(148,163,184,0.04)",
                      border: `1px solid ${videoUrl ? theme.accent + "30" : theme.border}`,
                    }}>
                      <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{wt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: theme.textLight }}>{wt.label}</div>
                        <div style={{ fontSize: 10, color: theme.textMuted }}>{wt.desc}</div>
                        {videoUrl && (
                          <div style={{ fontSize: 10, color: theme.accent, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{videoUrl}</div>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          const input = document.createElement("input");
                          input.type = "file"; input.accept = "video/mp4,video/webm";
                          input.onchange = async (e) => {
                            const file = e.target.files[0]; if (!file) return;
                            const maxMB = 15;
                            if (file.size > maxMB * 1024 * 1024) { alert(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${maxMB} MB. Compress the video first.`); return; }
                            const formData = new FormData(); formData.append("image", file);
                            try {
                              const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: formData });
                              const text = await res.text();
                              let data; try { data = JSON.parse(text); } catch (e2) { alert("Server error — upload may have exceeded size limit. Response: " + (text || "(empty)")); return; }
                              if (data.url) update(`weather_video_${wt.key}`, data.url);
                              else alert("Upload error: " + JSON.stringify(data));
                            } catch (err) { alert("Upload failed: " + err.message); }
                          };
                          input.click();
                        }}
                        style={{
                          background: videoUrl ? "rgba(34,211,238,0.15)" : "rgba(148,163,184,0.08)",
                          color: videoUrl ? theme.accent : theme.textMuted,
                          border: `1px solid ${videoUrl ? theme.accent + "40" : theme.border}`,
                          borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >{videoUrl ? "Replace" : "Upload"}</button>
                      {videoUrl && (
                        <button
                          onClick={() => update(`weather_video_${wt.key}`, "")}
                          style={{
                            background: "rgba(239,68,68,0.15)", color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                          }}
                        >✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Typography */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Typography</div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            Customize heading font, sizes, and colors. Changes apply to all pages.
          </p>

          {/* Heading font */}
          <label style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>Heading Font</label>
          <select value={c("heading_font", "Instrument Serif")} onChange={e => update("heading_font", e.target.value)} style={{
            ...fieldStyle, marginBottom: 16, cursor: "pointer",
          }}>
            {["Instrument Serif", "Playfair Display", "DM Sans", "Georgia", "Lora", "Merriweather", "Poppins", "Raleway", "Montserrat", "Inter", "Roboto Slab", "Oswald", "Crimson Text"].map(f => (
              <option key={f} value={f} style={{ background: theme.bg, color: theme.white }}>{f}</option>
            ))}
          </select>

          {/* H1, H2, H3 rows */}
          {[
            { tag: "H1", sizes: ["28px", "32px", "36px", "40px", "44px", "48px", "52px", "56px", "64px", "72px"] },
            { tag: "H2", sizes: ["18px", "20px", "24px", "28px", "32px", "36px", "40px", "44px", "48px"] },
            { tag: "H3", sizes: ["14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"] },
          ].map(({ tag, sizes }) => {
            const key = tag.toLowerCase();
            return (
              <div key={tag} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: theme.textLight, marginBottom: 6 }}>{tag}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, color: theme.textMuted }}>Size</label>
                    <select value={c(`${key}_size`, "")} onChange={e => update(`${key}_size`, e.target.value)} style={{ ...fieldStyle, cursor: "pointer", fontSize: 12, padding: "8px 10px" }}>
                      <option value="" style={{ background: theme.bg }}>Default</option>
                      {sizes.map(s => (<option key={s} value={s} style={{ background: theme.bg }}>{s}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: theme.textMuted }}>Style</label>
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                      <button onClick={() => update(`${key}_style`, c(`${key}_style`, "normal") === "italic" ? "normal" : "italic")}
                        style={{ flex: 1, padding: "6px", borderRadius: 6, border: `1px solid ${c(`${key}_style`, "") === "italic" ? theme.accent : theme.border}`, background: c(`${key}_style`, "") === "italic" ? `${theme.accent}20` : "transparent", color: c(`${key}_style`, "") === "italic" ? theme.accent : theme.textMuted, cursor: "pointer", fontSize: 13, fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>I</button>
                      <button onClick={() => update(`${key}_weight`, c(`${key}_weight`, "") === "700" ? "" : "700")}
                        style={{ flex: 1, padding: "6px", borderRadius: 6, border: `1px solid ${c(`${key}_weight`, "") === "700" ? theme.accent : theme.border}`, background: c(`${key}_weight`, "") === "700" ? `${theme.accent}20` : "transparent", color: c(`${key}_weight`, "") === "700" ? theme.accent : theme.textMuted, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>B</button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: theme.textMuted }}>Color</label>
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                      <input type="color" value={c(`${key}_color`, theme.white)} onChange={e => update(`${key}_color`, e.target.value)} style={{ width: 32, height: 32, border: `1px solid ${theme.border}`, borderRadius: 6, cursor: "pointer", background: "transparent", padding: 2 }} />
                      <button onClick={() => update(`${key}_color`, "")} style={{ fontSize: 9, padding: "4px 6px", borderRadius: 6, border: `1px solid ${theme.border}`, background: "transparent", color: theme.textMuted, cursor: "pointer" }}>Reset</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Theme — visual only (images, colors, overlay) */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: theme.accent,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
          }}>Industry Theme</div>
          <p style={{ fontSize: 11, color: theme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
            Apply a visual theme from an industry preset. Only changes hero image, colors, and overlay — your texts and content stay untouched.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {[
              { id: "restaurant", label: "Restaurant", icon: "🍽️", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=60", dark: "dark-amber", light: "light-warm", overlay_dark: "0.65", overlay_light: "0.60" },
              { id: "tech", label: "Tech / SaaS", icon: "💻", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=60", dark: "dark", light: "light-ocean", overlay_dark: "0.72", overlay_light: "0.68" },
              { id: "consulting", label: "Consulting", icon: "📊", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=60", dark: "dark", light: "light", overlay_dark: "0.70", overlay_light: "0.65" },
              { id: "portfolio", label: "Portfolio", icon: "🎨", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=60", dark: "dark-rose", light: "light-warm", overlay_dark: "0.68", overlay_light: "0.62" },
              { id: "shop", label: "Shop / Retail", icon: "🛍️", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=60", dark: "dark-amber", light: "light", overlay_dark: "0.65", overlay_light: "0.60" },
              { id: "snickare", label: "Snickare", icon: "🪚", img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=60", dark: "dark-amber", light: "light-warm", overlay_dark: "0.65", overlay_light: "0.60" },
              { id: "vvs", label: "VVS", icon: "🔧", img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=60", dark: "dark", light: "light-ocean", overlay_dark: "0.70", overlay_light: "0.65" },
              { id: "transport", label: "Transport", icon: "🚛", img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=400&q=60", dark: "dark", light: "light", overlay_dark: "0.68", overlay_light: "0.62" },
              { id: "frisor", label: "Frisör", icon: "💇", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=60", dark: "dark-rose", light: "light-warm", overlay_dark: "0.65", overlay_light: "0.58" },
              { id: "musiker", label: "Musiker", icon: "🎸", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=60", dark: "dark", light: "light", overlay_dark: "0.70", overlay_light: "0.62" },
              { id: "none", label: "No Image", icon: "🚫", img: "", dark: "dark", light: "light", overlay_dark: "0.75", overlay_light: "0.70" },
            ].map(preset => {
              const isActive = c("industry_theme", "") === preset.id;
              return (
                <div key={preset.id} onClick={() => {
                  update("industry_theme", preset.id);
                  update("theme_dark", preset.dark);
                  update("theme_light", preset.light);
                  // Apply hero background
                  setContent(prev => ({
                    ...prev,
                    hero: {
                      ...(prev?.hero || {}),
                      bg_image: preset.img,
                      bg_video: "",
                      overlay_dark: preset.overlay_dark,
                      overlay_light: preset.overlay_light,
                    },
                  }));
                }} style={{
                  background: isActive ? `${theme.accent}15` : theme.bgCard,
                  border: `2px solid ${isActive ? theme.accent : theme.border}`,
                  borderRadius: 12, padding: 12, cursor: "pointer",
                  textAlign: "center", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{preset.icon}</div>
                  {preset.img && <div style={{
                    width: "100%", height: 60, borderRadius: 8, marginBottom: 8,
                    backgroundImage: `url(${preset.img})`, backgroundSize: "cover", backgroundPosition: "center",
                  }} />}
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? theme.accent : theme.white }}>{preset.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            background: theme.accent, color: theme.bg, border: "none",
            padding: "10px 24px", borderRadius: 10, fontSize: 13,
            fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Done</button>
        </div>
        <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 16, textAlign: "center" }}>
          Remember to click "Save Changes" after closing to persist your settings.
        </p>
      </div>
    </div>
  );
};

const AdminToolbar = ({ editMode, setEditMode, onLogout, onNewPost, onNewPage, onSaveChanges, onOpenSettings }) => {
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onSaveChanges();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };
  return (
  <div style={{
    position: "fixed", bottom: 24, right: 24, zIndex: 200,
    display: "flex", gap: 12, flexDirection: "column",
    alignItems: "flex-end",
  }}>
    {editMode && (
      <button
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        style={{
        background: saveStatus === 'saved' ? 'linear-gradient(135deg, #22c55e, #16a34a)'
          : saveStatus === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
        color: saveStatus === 'saved' || saveStatus === 'error' ? '#fff' : theme.bg,
        border: "none",
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 20px ${theme.accentGlow}`,
        transition: 'background 0.3s ease',
      }}>
        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Save Failed' : 'Save Changes'}
      </button>
    )}

    <button
      onClick={() => setEditMode(!editMode)}
      style={{
        background: editMode ? theme.accent : theme.bgCard,
        color: editMode ? theme.bg : theme.accent,
        border: `1px solid ${editMode ? "transparent" : theme.border}`,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      {editMode ? "Exit Edit" : "Edit Mode"}
    </button>

    <button
      onClick={onNewPost}
      style={{
        background: theme.bgCard,
        color: theme.accent,
        border: `1px solid ${theme.border}`,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      New Post
    </button>

    {onNewPage && (
    <button
      onClick={onNewPage}
      style={{
        background: theme.bgCard,
        color: theme.accent,
        border: `1px solid ${theme.border}`,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      New Page
    </button>
    )}

    <button
      onClick={onOpenSettings}
      style={{
        background: theme.bgCard,
        color: theme.accent,
        border: `1px solid ${theme.border}`,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      Settings
    </button>

    <button
      onClick={onLogout}
      style={{
        background: theme.bgCard,
        color: theme.textMuted,
        border: `1px solid ${theme.border}`,
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      Logout
    </button>
  </div>
);};

// ─── URL Routing helpers ──────────────────────────────────────────
// Detect base path for sub-sites (e.g. /sites/test7/) so routing works
// when hosted in a subdirectory. Falls back to "/" for root-level sites.
const _basePath = (() => {
  // Use <base href> if set, otherwise derive from pathname
  const baseEl = document.querySelector("base[href]");
  if (baseEl) {
    const href = baseEl.getAttribute("href");
    if (href && href !== "/") return href.replace(/\/?$/, "/");
  }
  // Fallback: strip known page segments from current path
  return window.location.pathname.replace(/\/(about|contact|projects)\/?.*$/, "/").replace(/\/?$/, "/");
})();

const pageFromPath = () => {
  // Remove the base path prefix to get the page-relative path
  let rel = window.location.pathname;
  if (_basePath !== "/" && rel.startsWith(_basePath)) {
    rel = rel.substring(_basePath.length);
  }
  rel = rel.replace(/^\/+/, "").replace(/\/+$/, "");
  if (rel === "about") return PAGES.ABOUT;
  if (rel === "contact") return PAGES.CONTACT;
  if (rel === "projects") return PAGES.PROJECTS;
  if (rel.startsWith("projects/")) {
    const slug = rel.substring("projects/".length);
    window.__projectSlug = slug;
    return PAGES.PROJECTS;
  }
  // Custom page support — any non-empty slug that doesn't match built-in pages
  if (rel && !rel.includes("/")) {
    return "custom:" + rel;
  }
  return PAGES.HOME;
};

const pathForPage = (pg) => {
  if (pg === PAGES.HOME) return _basePath;
  // Custom pages: "custom:my-page" → "/my-page"
  if (pg.startsWith("custom:")) return _basePath + pg.substring(7);
  return _basePath + pg;
};

// ─── Certifications Section (shared About page component) ──────────
const CertificationsSection = ({ content, editMode, updateContent, defaultCerts = [] }) => {
  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  const defaults = defaultCerts.length ? defaultCerts : [
    { title: "New Certification", subtitle: "Issuing Organization", link: "", image: "", badge: "✓" },
  ];
  const certs = c("about", "certifications", defaults);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {certs.map((cert, certIdx) => {
        const updateCert = (field, value) => {
          const updated = [...certs];
          updated[certIdx] = { ...updated[certIdx], [field]: value };
          updateContent("about", "certifications", updated);
        };
        const certContent = (
          <div style={{
            display: "flex", alignItems: "center", gap: 20,
            background: theme.accentDim,
            border: `1px solid rgba(34,211,238,0.2)`,
            borderRadius: 16, padding: "24px 32px",
            position: "relative",
          }}>
            {editMode && (
              <button onClick={() => {
                const updated = [...certs];
                updated.splice(certIdx, 1);
                updateContent("about", "certifications", updated);
              }} style={{
                position: "absolute", top: 8, right: 8, width: 22, height: 22,
                borderRadius: "50%", background: "#ff6b6b", color: "#fff",
                border: "none", fontSize: 13, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", zIndex: 2,
              }}>×</button>
            )}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {cert.image ? (
                <img
                  src={cert.image}
                  alt="Certification badge"
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: theme.bg, fontSize: 24, fontWeight: 700,
                }}>{cert.badge || "✓"}</div>
              )}
              {editMode && (
                <label style={{
                  position: "absolute", inset: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.5)", borderRadius: 12,
                  color: "#fff", fontSize: 11, fontWeight: 600, textAlign: "center",
                  opacity: 0, transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  Upload
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("image", file);
                    try {
                      const res = await fetch(`${API_URL}?action=upload`, { method: "POST", body: fd, credentials: "include" });
                      const data = await res.json();
                      if (data.ok && data.url) updateCert("image", data.url);
                    } catch (err) { console.error("Upload failed", err); }
                  }} />
                </label>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <EditableText value={cert.title} onChange={v => updateCert("title", v)} editMode={editMode} tag="div"
                style={{ fontSize: 16, fontWeight: 600, color: theme.white }} />
              <EditableText value={cert.subtitle} onChange={v => updateCert("subtitle", v)} editMode={editMode} tag="div"
                style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }} />
              {editMode && (
                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Link:</span>
                  <input value={cert.link || ""} onChange={e => updateCert("link", e.target.value)} placeholder="https://..."
                    style={{ background: "transparent", border: "1px dashed rgba(34,211,238,0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: theme.textMuted, flex: 1, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                  <span style={{ fontSize: 12, color: theme.textMuted }}>Badge:</span>
                  <input value={cert.badge || ""} onChange={e => updateCert("badge", e.target.value)} placeholder="SF"
                    style={{ background: "transparent", border: "1px dashed rgba(34,211,238,0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: theme.textMuted, width: 50, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              )}
            </div>
          </div>
        );
        return (
          <div key={certIdx}>
            {!editMode && cert.link ? (
              <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                {certContent}
              </a>
            ) : certContent}
          </div>
        );
      })}
      {editMode && (
        <div onClick={() => {
          const newCerts = [...certs, { title: "New Certification", subtitle: "Issuing Organization", link: "", image: "", badge: "✓" }];
          updateContent("about", "certifications", newCerts);
        }} style={{
          background: "transparent", border: `2px dashed rgba(34,211,238,0.2)`,
          borderRadius: 16, padding: "20px 32px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: theme.accent, fontSize: 14,
        }} className="card-lift">
          + Add Certification
        </div>
      )}
    </div>
  );
};

// ─── CONTACT PAGE ─────────────────────────────────────────────────────
// Site-specific props: Logo (component), fallbackEmail (string)
const ContactPage = ({ editMode = false, content = {}, setContent = () => {}, t = (k) => k, Logo = null, fallbackEmail = "" }) => {
  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  const updateContent = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [key]: value }
    }));
  };
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", subject: "", message: "", website_url: "", captcha: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoadedAt] = useState(() => Math.floor(Date.now() / 1000));

  // Simple math captcha
  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const captchaExpected = captchaA + captchaB;

  const fieldStyle = {
    width: "100%",
    background: "rgba(148,163,184,0.06)",
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: "13px 16px",
    fontSize: 14,
    color: theme.white,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.25s ease",
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setFormError(t("contact_required_error"));
      return;
    }
    if (!form.captcha || parseInt(form.captcha) !== captchaExpected) {
      setFormError(t("contact_captcha_error"));
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API_URL}?action=contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          _t: formLoadedAt,
          _ca: captchaExpected,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setSubmitted(true);
      } else {
        setFormError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setFormError(fallbackEmail
        ? `Connection error. Please try again or email ${fallbackEmail} directly.`
        : "Connection error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHero bgKey="contact_header" content={content} editMode={editMode} updateContent={updateContent}>
      <Section style={{ paddingTop: 120, paddingBottom: 100 }}>
        <div className="animate-up">
          <p style={{
            fontSize: 13, color: theme.accent, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16,
          }}>
            {t("contact_label")}
          </p>
          <EditableText
            value={c("contact", "title", t("contact_title"))}
            onChange={v => updateContent("contact", "title", v)}
            editMode={editMode}
            tag="h1"
            className="serif"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontStyle: "italic",
              color: theme.white,
              lineHeight: 1.2,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          />
          <EditableText
            value={c("contact", "address", t("contact_address"))}
            onChange={v => updateContent("contact", "address", v)}
            editMode={editMode}
            tag="p"
            style={{
              fontSize: 16, color: theme.textMuted, marginBottom: 48, lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
        }}
        className="contact-grid"
        >
          {/* Form */}
          <div className="animate-up delay-2" style={{
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: "36px 32px",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <p style={{ fontSize: 18, color: theme.white, fontWeight: 500 }}>
                  {t("contact_thankyou")}
                </p>
                <p style={{ fontSize: 14, color: theme.textMuted, marginTop: 8 }}>
                  {t("contact_thankyou_sub")}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>{t("contact_company")}</label>
                  <input style={fieldStyle} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>{t("contact_name")} *</label>
                  <input style={fieldStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>{t("contact_email")} *</label>
                  <input style={fieldStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>{t("contact_phone")}</label>
                  <input style={fieldStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>{t("contact_subject")} *</label>
                  <input style={fieldStyle} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>{t("contact_message")} *</label>
                  <textarea style={{ ...fieldStyle, minHeight: 120, resize: "vertical" }} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
                {/* Honeypot — hidden from humans, bots fill it in */}
                <div style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }} aria-hidden="true">
                  <label>Website URL</label>
                  <input type="text" name="website_url" value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))} tabIndex={-1} autoComplete="off" />
                </div>

                {/* Math captcha */}
                <div>
                  <label style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, display: "block", marginBottom: 6 }}>
                    {t("contact_verify")} {captchaA} + {captchaB}? *
                  </label>
                  <input
                    style={{ ...fieldStyle, maxWidth: 120 }}
                    type="text"
                    inputMode="numeric"
                    value={form.captcha}
                    onChange={e => setForm(p => ({ ...p, captcha: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                    placeholder="?"
                  />
                </div>

                {formError && (
                  <div style={{
                    fontSize: 13, color: "#ff6b6b",
                    background: "rgba(255,107,107,0.1)",
                    padding: "10px 14px", borderRadius: 8,
                  }}>
                    {formError}
                  </div>
                )}

                <AccentBtn onClick={handleSubmit} style={{ marginTop: 8, opacity: sending ? 0.6 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
                  {sending ? t("contact_sending") : t("contact_send")}
                </AccentBtn>
              </div>
            )}
          </div>

          {/* Info side */}
          <div className="animate-up delay-3" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: "28px 24px",
            }}>
              {Logo && <Logo size={40} />}
              <EditableText
                value={c("contact", "company_name", t("site_name") || "Company")}
                onChange={v => updateContent("contact", "company_name", v)}
                editMode={editMode}
                tag="h3"
                style={{ fontSize: 18, fontWeight: 600, color: theme.white, marginTop: Logo ? 16 : 0, marginBottom: 16 }}
              />
              <EditableText
                value={c("contact", "company_info", t("contact_company_info") || "")}
                onChange={v => updateContent("contact", "company_info", v)}
                editMode={editMode}
                tag="div"
                style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.8 }}
              />
            </div>

            <div style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: "28px 24px",
            }}>
              <EditableText
                value={c("contact", "comp_title", t("contact_competencies_title"))}
                onChange={v => updateContent("contact", "comp_title", v)}
                editMode={editMode}
                tag="h3"
                style={{ fontSize: 16, fontWeight: 600, color: theme.white, marginBottom: 16 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(c("contact", "competencies", [])).map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: theme.accent, marginTop: 3, flexShrink: 0, fontSize: 10 }}>●</span>
                    {editMode ? (
                      <div style={{ display: "flex", gap: 4, flex: 1, alignItems: "center" }}>
                        <input value={t} onChange={e => {
                          const list = [...(c("contact", "competencies", []))];
                          list[i] = e.target.value;
                          updateContent("contact", "competencies", list);
                        }} style={{
                          background: "transparent", border: "1px dashed rgba(34,211,238,0.3)",
                          borderRadius: 6, padding: "4px 8px", fontSize: 13.5,
                          color: theme.textMuted, flex: 1, outline: "none",
                          fontFamily: "'DM Sans', sans-serif",
                        }} />
                        <button onClick={() => {
                          const list = [...(c("contact", "competencies", []))];
                          list.splice(i, 1);
                          updateContent("contact", "competencies", list);
                        }} style={{
                          background: "none", border: "none", color: "#ff6b6b",
                          cursor: "pointer", fontSize: 14, padding: "2px 4px",
                        }}>×</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.5 }}>{t}</span>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button onClick={() => {
                    const item = prompt("New competency:");
                    if (item) {
                      const list = [...(c("contact", "competencies", []))];
                      list.push(item);
                      updateContent("contact", "competencies", list);
                    }
                  }} style={{
                    background: "none", border: "1px dashed rgba(34,211,238,0.2)",
                    color: theme.accent, padding: "6px", borderRadius: 6,
                    fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>+ Add</button>
                )}
              </div>
            </div>

            <div style={{
              padding: "28px 24px",
              background: `linear-gradient(160deg, rgba(34,211,238,0.06), transparent)`,
              border: `1px solid rgba(34,211,238,0.15)`,
              borderRadius: 16, textAlign: "center",
            }}>
              <EditableText
                value={c("contact", "quote", t("contact_quote") || "")}
                onChange={v => updateContent("contact", "quote", v)}
                editMode={editMode}
                tag="p"
                className="serif"
                style={{ fontSize: 20, fontStyle: "italic", color: theme.white, lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 780px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </Section>
      </PageHero>

      {/* Custom blocks after contact form */}
      {((content?.customBlocks || []).filter(b => b.position === "contact_after").length > 0 || editMode) && (
        <>
          {(content?.customBlocks || []).filter(b => b.position === "contact_after").map(block => (
            <Section key={block.id} style={{ paddingBottom: 40 }}>
              <CustomBlock block={block} editMode={editMode} content={content} setContent={setContent} />
            </Section>
          ))}
          <AddBlockInserter position="contact_after" editMode={editMode} content={content} setContent={setContent} />
        </>
      )}
    </div>
  );
};

// ─── PROJECTS PAGE ────────────────────────────────────────────────────
// Site-specific props: siteUrl (string), siteName (string), defaultCategories (array)
const ProjectsPage = ({ adminLoggedIn, onEditPost, onDeletePost, editMode = false, content = {}, setContent = () => {}, t = (k) => k, setPage = () => {}, projectSlug = null, setProjectSlug = () => {}, siteUrl = "", siteName = "" }) => {
  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  const updateContent = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [key]: value }
    }));
  };
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const movePost = async (postId, direction) => {
    try {
      const response = await fetch(`${API_URL}?action=reorder-posts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: postId, direction }),
      });
      const data = await response.json();
      if (data.ok) {
        const idx = posts.findIndex(p => p.id === postId);
        const targetIdx = idx + direction;
        if (idx >= 0 && targetIdx >= 0 && targetIdx < posts.length) {
          const newPosts = [...posts];
          [newPosts[idx], newPosts[targetIdx]] = [newPosts[targetIdx], newPosts[idx]];
          setPosts(newPosts);
        }
      }
    } catch (err) {
      console.log("Failed to reorder post");
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch(`${API_URL}?action=posts`, { credentials: "include" });
        const data = await response.json();
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.log("API failed, trying direct JSON fallback");
        try {
          const fallback = await fetch("data/posts.json");
          const fbData = await fallback.json();
          if (Array.isArray(fbData)) setPosts(fbData);
        } catch (e2) {
          console.log("Failed to load posts from both API and fallback");
        }
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Update SEO meta when a project slug is in the URL and posts have loaded
  useEffect(() => {
    const slug = projectSlug;
    if (slug && posts.length > 0) {
      const matchedPost = posts.find(p => p.slug === slug);
      if (matchedPost) {
        const title = (matchedPost.seo && matchedPost.seo.title) || matchedPost.title + (siteName ? ` — ${siteName}` : "");
        const desc = (matchedPost.seo && matchedPost.seo.description) || matchedPost.excerpt || "";
        const fullUrl = siteUrl + "/projects/" + matchedPost.slug;
        document.title = title;
        const setMeta = (attr, key, val) => {
          let el = document.querySelector(`meta[${attr}="${key}"]`);
          if (el) el.setAttribute("content", val);
        };
        setMeta("name", "description", desc);
        setMeta("property", "og:title", title);
        setMeta("property", "og:description", desc);
        setMeta("property", "og:url", fullUrl);
        setMeta("name", "twitter:title", title);
        setMeta("name", "twitter:description", desc);
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute("href", fullUrl);
      }
    }
  }, [posts, projectSlug]);

  const ProjectCard = ({ project, isDraft = false, onEdit, forceExpanded = false }) => {
    const [expanded, setExpanded] = useState(forceExpanded);
    const cardRef = useRef(null);
    const hasFullContent = project.content && project.content.trim() && project.content !== project.excerpt;

    useEffect(() => {
      if (forceExpanded && cardRef.current) {
        setTimeout(() => {
          cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }, [forceExpanded]);
    return (
    <div ref={cardRef} className="animate-up delay-2" style={{
      background: theme.bgCard,
      border: `1px solid ${theme.border}`,
      borderRadius: 20,
      overflow: "hidden",
      position: "relative",
    }}>
      {isDraft && (
        <div style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(255,107,107,0.2)",
          border: `1px solid rgba(255,107,107,0.4)`,
          color: "#ff6b6b",
          padding: "4px 12px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          zIndex: 10,
        }}>
          Draft
        </div>
      )}

{/* Admin buttons moved to bottom-right */}

      <div style={{ padding: "clamp(20px, 4vw, 36px) clamp(20px, 4vw, 36px) 0" }}>
        <div className="project-header" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <div style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
              color: theme.bg,
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: "clamp(15px, 3.5vw, 18px)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              marginBottom: 16,
              maxWidth: "100%",
              wordBreak: "break-word",
            }}>
              {project.title}
            </div>
            <p style={{
              fontSize: "clamp(14px, 3vw, 16px)", color: theme.textLight, lineHeight: 1.7,
              maxWidth: 640, marginBottom: expanded ? 12 : 24,
            }}>
              {project.excerpt || project.content}
            </p>
            {hasFullContent && expanded && (
              <div
                style={{
                  fontSize: "clamp(14px, 3vw, 15px)", color: theme.textMuted, lineHeight: 1.8,
                  maxWidth: 640, marginBottom: 24,
                }}
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            )}
            {hasFullContent && (
              <span
                onClick={() => setExpanded(!expanded)}
                style={{
                  fontSize: 13, fontWeight: 600, color: theme.accent,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                  marginBottom: 16,
                }}
              >
                {expanded ? t("projects_show_less") : t("projects_read_more")}
              </span>
            )}
          </div>
          {(() => {
            const imgs = Array.isArray(project.images) && project.images.length > 0
              ? project.images
              : project.imageUrl ? [project.imageUrl] : [];
            return imgs.length > 0 ? <ImageGallery images={imgs} alt={project.title} t={t} /> : null;
          })()}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        borderTop: `1px solid ${theme.border}`,
      }}
      className="project-grid"
      >
        <div style={{
          padding: "clamp(18px, 4vw, 28px) clamp(18px, 4vw, 36px)",
          borderRight: `1px solid ${theme.border}`,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.accent, marginBottom: 16 }}>
            {project.features && project.features.length > 0 ? t("projects_features") : t("projects_key_features")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(project.features || []).map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: theme.accent, marginTop: 3, flexShrink: 0 }}>◆</span>
                <span style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          {project.links && project.links.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.accent, marginBottom: 12 }}>
                {t("projects_links")}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 13,
                      color: theme.accent,
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => e.target.style.textShadow = `0 0 12px ${theme.accentGlow}`}
                    onMouseLeave={e => e.target.style.textShadow = "none"}
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "clamp(18px, 4vw, 28px) clamp(18px, 4vw, 36px)" }}>
          {project.role && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.accent, marginBottom: 16 }}>
                {t("projects_role")}
              </h3>
              <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
                {project.role}
              </p>
            </>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.accent, marginBottom: 12 }}>
                {t("projects_technologies")}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.technologies.map((t, i) => (
                  <Tag key={i} text={typeof t === 'string' ? t : t} />
                ))}
              </div>
            </>
          )}

          {project.tags && project.tags.length > 0 && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.accent, marginBottom: 12, marginTop: 20 }}>
                {t("projects_tags")}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.tags.map((t, i) => (
                  <Tag key={i} text={typeof t === 'string' ? t : t} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share buttons */}
      {(() => {
        const shareUrl = encodeURIComponent(`${siteUrl}/projects/${project.slug || ""}`);
        const shareTitle = encodeURIComponent(project.title || (siteName ? `${siteName} Project` : "Project"));
        const shareDesc = encodeURIComponent(project.excerpt || "");
        const iconStyle = {
          width: 32, height: 32, borderRadius: 8,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "rgba(148,163,184,0.08)",
          border: `1px solid ${theme.border}`,
          cursor: "pointer", transition: "all 0.2s ease",
          textDecoration: "none",
        };
        return (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px clamp(18px, 4vw, 36px)",
            borderTop: `1px solid ${theme.border}`,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 500, marginRight: 4 }}>{t("projects_share")}</span>
            {/* LinkedIn */}
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noreferrer" title="Share on LinkedIn" style={iconStyle}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.12)"; e.currentTarget.style.borderColor = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={theme.textMuted}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* X / Twitter */}
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noreferrer" title="Share on X" style={iconStyle}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.12)"; e.currentTarget.style.borderColor = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={theme.textMuted}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* Facebook */}
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" title="Share on Facebook" style={iconStyle}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.12)"; e.currentTarget.style.borderColor = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={theme.textMuted}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Email */}
            <a href={`mailto:?subject=${shareTitle}&body=Check out this project: ${shareUrl}`} title="Share via email" style={iconStyle}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.12)"; e.currentTarget.style.borderColor = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
            </a>
            {/* Copy link */}
            <div title="Copy link" style={iconStyle}
              onClick={() => {
                navigator.clipboard.writeText(`${siteUrl}/projects/${project.slug || ""}`);
                const el = event.currentTarget;
                el.style.background = "rgba(34,211,238,0.2)";
                el.style.borderColor = theme.accent;
                setTimeout(() => { el.style.background = "rgba(148,163,184,0.08)"; el.style.borderColor = theme.border; }, 1000);
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.12)"; e.currentTarget.style.borderColor = theme.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(148,163,184,0.08)"; e.currentTarget.style.borderColor = theme.border; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            </div>
          </div>
        );
      })()}

      {adminLoggedIn && project.id && (
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 8,
          padding: "12px 24px 16px",
          borderTop: `1px solid ${theme.border}`,
        }}>
          <button
            onClick={() => onEdit(project)}
            style={{
              background: theme.accent, color: theme.bg,
              border: "none", padding: "8px 18px", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>Edit</button>
          <button
            onClick={() => {
              if (window.confirm("Delete this post? This cannot be undone.")) {
                onDeletePost && onDeletePost(project.id);
              }
            }}
            style={{
              background: "rgba(255,107,107,0.15)", color: "#ff6b6b",
              border: `1px solid rgba(255,107,107,0.3)`,
              padding: "8px 18px", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>Delete</button>
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .project-grid {
            grid-template-columns: 1fr !important;
          }
          .project-grid > div {
            border-right: none !important;
            border-bottom: 1px solid ${theme.border};
          }
        }
      `}</style>
    </div>
  );
  };

  /* ── Dynamic categories ────────────────────────────────── */
  const _defaultCategories = content?.projects?.defaultCategories || [
    { id: "projects", title: "Projects" },
  ];
  const categories = content?.projects?.categories || _defaultCategories;

  const updateCategories = (newCats) => {
    setContent(prev => ({
      ...prev,
      projects: { ...(prev?.projects || {}), categories: newCats }
    }));
  };

  const addCategory = () => {
    const name = prompt("Enter a name for the new category section:");
    if (!name || !name.trim()) return;
    const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (categories.find(cat => cat.id === id)) {
      alert("A category with that ID already exists.");
      return;
    }
    updateCategories([...categories, { id, title: name.trim() }]);
  };

  const removeCategory = (catId) => {
    const catPosts = posts.filter(p => p.category === catId);
    if (catPosts.length > 0) {
      alert(`Cannot remove — ${catPosts.length} post(s) still use this category. Reassign them first.`);
      return;
    }
    if (!window.confirm(`Remove the "${categories.find(c => c.id === catId)?.title}" section?`)) return;
    updateCategories(categories.filter(c => c.id !== catId));
  };

  const moveCategory = (idx, direction) => {
    const newCats = [...categories];
    const target = idx + direction;
    if (target < 0 || target >= newCats.length) return;
    [newCats[idx], newCats[target]] = [newCats[target], newCats[idx]];
    updateCategories(newCats);
  };

  const renameCategoryTitle = (catId, newTitle) => {
    updateCategories(categories.map(c => c.id === catId ? { ...c, title: newTitle } : c));
  };

  const toggleCategoryTitleVisible = (catId) => {
    updateCategories(categories.map(c => c.id === catId ? { ...c, hideTitle: !c.hideTitle } : c));
  };

  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  /* Compact card for grid view */
  const ProjectCardCompact = ({ project, isDraft }) => {
    const imgs = Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : project.imageUrl ? [project.imageUrl] : [];
    return (
      <div style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {isDraft && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.4)",
            color: "#ff6b6b", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, zIndex: 10,
          }}>Draft</div>
        )}
        {/* Image banner */}
        {imgs.length > 0 && (
          <div style={{
            width: "100%", height: 120,
            background: `url(${imgs[0]}) center/cover no-repeat`,
            borderBottom: `1px solid ${theme.border}`,
          }} />
        )}
        <div style={{ padding: "16px 18px" }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: theme.white,
            marginBottom: 8, lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {project.title}
          </div>
          <p style={{
            fontSize: 13, color: theme.textMuted, lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            margin: 0,
          }}>
            {project.excerpt || project.content}
          </p>
          {/* Tech tags (compact) */}
          {project.technologies && project.technologies.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
              {project.technologies.slice(0, 4).map((t, i) => (
                <span key={i} style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 6,
                  background: `${theme.accent}15`, color: theme.accent,
                  border: `1px solid ${theme.accent}30`, fontWeight: 500,
                }}>{typeof t === "string" ? t : t}</span>
              ))}
              {project.technologies.length > 4 && (
                <span style={{ fontSize: 10, color: theme.textMuted, alignSelf: "center" }}>+{project.technologies.length - 4}</span>
              )}
            </div>
          )}
        </div>
        {/* Admin edit button in grid mode */}
        {adminLoggedIn && project.id && (
          <div style={{
            padding: "8px 18px 12px", borderTop: `1px solid ${theme.border}`,
            display: "flex", justifyContent: "flex-end", gap: 6,
          }}>
            <button onClick={() => onEditPost(project)} style={{
              background: theme.accent, color: theme.bg, border: "none",
              padding: "5px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>Edit</button>
          </div>
        )}
      </div>
    );
  };

  /* View mode toggle buttons */
  const ViewToggle = () => (
    <div style={{ display: "flex", gap: 4, background: "rgba(148,163,184,0.08)", borderRadius: 8, padding: 3, border: `1px solid ${theme.border}` }}>
      <button
        onClick={() => setViewMode("list")}
        title="List view"
        style={{
          background: viewMode === "list" ? `${theme.accent}22` : "transparent",
          border: viewMode === "list" ? `1px solid ${theme.accent}44` : "1px solid transparent",
          borderRadius: 6, padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={viewMode === "list" ? theme.accent : theme.textMuted} strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="6" rx="1.5" /><rect x="3" y="13" width="18" height="6" rx="1.5" />
        </svg>
      </button>
      <button
        onClick={() => setViewMode("grid")}
        title="Grid view"
        style={{
          background: viewMode === "grid" ? `${theme.accent}22` : "transparent",
          border: viewMode === "grid" ? `1px solid ${theme.accent}44` : "1px solid transparent",
          borderRadius: 6, padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={viewMode === "grid" ? theme.accent : theme.textMuted} strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </button>
    </div>
  );

  const renderPostList = (filteredPosts) => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textMuted }}>
          {t("projects_loading")}
        </div>
      );
    }
    if (filteredPosts.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textMuted }}>
          {t("projects_empty")}
        </div>
      );
    }
    if (viewMode === "grid") {
      return (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {filteredPosts.map((post, i) => (
            <ProjectCardCompact
              key={post.id || i}
              project={post}
              isDraft={!post.published}
            />
          ))}
        </div>
      );
    }
    return filteredPosts.map((post, i) => (
      <div key={post.id || i}>
        {editMode && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => movePost(post.id, -1)}
              disabled={i === 0}
              style={{
                background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                borderRadius: 6, padding: "4px 10px", fontSize: 12,
                cursor: i === 0 ? "default" : "pointer",
                color: i === 0 ? theme.textMuted : theme.text,
                opacity: i === 0 ? 0.4 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >▲ Move up</button>
            <button
              onClick={() => movePost(post.id, 1)}
              disabled={i === filteredPosts.length - 1}
              style={{
                background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                borderRadius: 6, padding: "4px 10px", fontSize: 12,
                cursor: i === filteredPosts.length - 1 ? "default" : "pointer",
                color: i === filteredPosts.length - 1 ? theme.textMuted : theme.text,
                opacity: i === filteredPosts.length - 1 ? 0.4 : 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >▼ Move down</button>
          </div>
        )}
        <ProjectCard
          project={post}
          isDraft={!post.published}
          onEdit={onEditPost}
        />
      </div>
    ));
  };

  // Single-post view: when a project slug is in the URL, show only that post
  const singlePost = projectSlug ? posts.find(p => p.slug === projectSlug) : null;

  // Single-post mode: slug is set but posts still loading — wait, don't fall through to categories
  if (projectSlug && !singlePost && loading && !editMode) {
    return (
      <div>
        <Section style={{ paddingTop: 120, paddingBottom: 100 }}>
          <p style={{ textAlign: "center", color: theme.textMuted }}>{t("projects_loading")}</p>
        </Section>
      </div>
    );
  }

  if (singlePost && !editMode) {
    return (
      <div>
        <Section style={{ paddingTop: 120, paddingBottom: 100 }}>
          <a
            href="/projects"
            onClick={(e) => { e.preventDefault(); setProjectSlug(null); window.history.pushState({}, "", pathForPage(PAGES.PROJECTS)); setPage(PAGES.PROJECTS); window.scrollTo(0, 0); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 600, color: theme.accent,
              textDecoration: "none", marginBottom: 32, cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {t("projects_back")}
          </a>
          <ProjectCard project={singlePost} forceExpanded={true} />
        </Section>
      </div>
    );
  }

  return (
    <div>
      <PageHero bgKey="projects_header" content={content} editMode={editMode} updateContent={updateContent}>
      {categories.map((cat, catIdx) => {
        const catPosts = posts.filter(p => p.category === cat.id);
        const isFirst = catIdx === 0;
        const isLast = catIdx === categories.length - 1;
        return (
          <Section key={cat.id} style={{ paddingTop: isFirst ? 120 : 40, paddingBottom: isLast ? 100 : 60 }}>
            <div className="animate-up">
              {isFirst && (
                <p style={{
                  fontSize: 13, color: theme.accent, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16,
                }}>
                  {t("projects_label")}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: editMode ? 16 : (cat.hideTitle && !editMode ? 0 : 48) }}>
                {(!cat.hideTitle || editMode) && (
                  <EditableText
                    value={cat.title}
                    onChange={v => renameCategoryTitle(cat.id, v)}
                    editMode={editMode}
                    tag="h1"
                    className="serif"
                    style={{
                      fontSize: "clamp(36px, 5vw, 52px)",
                      fontStyle: "italic", color: theme.white,
                      lineHeight: 1.2, letterSpacing: "-0.02em",
                      margin: 0,
                      opacity: cat.hideTitle ? 0.35 : 1,
                      textDecoration: cat.hideTitle ? "line-through" : "none",
                    }}
                  />
                )}
                <ViewToggle />
              </div>

              {/* Admin: reorder & remove category */}
              {editMode && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
                  <button
                    onClick={() => moveCategory(catIdx, -1)}
                    disabled={catIdx === 0}
                    style={{
                      background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                      borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: catIdx === 0 ? "default" : "pointer",
                      color: catIdx === 0 ? theme.border : theme.textLight, fontFamily: "'DM Sans', sans-serif",
                      opacity: catIdx === 0 ? 0.4 : 1,
                    }}
                  >▲ Move up</button>
                  <button
                    onClick={() => toggleCategoryTitleVisible(cat.id)}
                    style={{
                      background: cat.hideTitle ? "rgba(34,211,238,0.12)" : "rgba(148,163,184,0.08)",
                      border: `1px solid ${cat.hideTitle ? theme.accent + "44" : theme.border}`,
                      borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
                      color: cat.hideTitle ? theme.accent : theme.textLight, fontFamily: "'DM Sans', sans-serif",
                    }}
                  >{cat.hideTitle ? "◉ Title hidden" : "○ Hide title"}</button>
                  <button
                    onClick={() => moveCategory(catIdx, 1)}
                    disabled={isLast}
                    style={{
                      background: "rgba(148,163,184,0.08)", border: `1px solid ${theme.border}`,
                      borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: isLast ? "default" : "pointer",
                      color: isLast ? theme.border : theme.textLight, fontFamily: "'DM Sans', sans-serif",
                      opacity: isLast ? 0.4 : 1,
                    }}
                  >▼ Move down</button>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    style={{
                      background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)",
                      borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer",
                      color: "#ff6b6b", fontFamily: "'DM Sans', sans-serif",
                    }}
                  >Remove section</button>
                  <span style={{ fontSize: 11, color: theme.textMuted, marginLeft: 4 }}>
                    {catPosts.length} post{catPosts.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            <div style={viewMode === "list" ? { display: "flex", flexDirection: "column", gap: 40 } : {}}>
              {renderPostList(catPosts)}
            </div>
          </Section>
        );
      })}

      {/* Admin: add new category section */}
      {editMode && (
        <Section style={{ paddingTop: 0, paddingBottom: 60 }}>
          <button
            onClick={addCategory}
            style={{
              width: "100%", padding: "18px 24px",
              background: "transparent",
              border: `2px dashed ${theme.accent}40`,
              borderRadius: 16, cursor: "pointer",
              color: theme.accent, fontSize: 15, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}08`; e.currentTarget.style.borderColor = `${theme.accent}70`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${theme.accent}40`; }}
          >
            + Add New Category Section
          </button>
        </Section>
      )}
      </PageHero>

      {/* Custom blocks after projects */}
      {((content?.customBlocks || []).filter(b => b.position === "projects_after").length > 0 || editMode) && (
        <>
          {(content?.customBlocks || []).filter(b => b.position === "projects_after").map(block => (
            <Section key={block.id} style={{ paddingBottom: 40 }}>
              <CustomBlock block={block} editMode={editMode} content={content} setContent={setContent} />
            </Section>
          ))}
          <AddBlockInserter position="projects_after" editMode={editMode} content={content} setContent={setContent} />
        </>
      )}
    </div>
  );
};

// ─── Dynamic Section Renderer (reusable for any page) ────────────────
// Usage: renderDynamicSections({ pageKey, sectionOrder, hiddenSections, sectionRenderers, sectionLabels, editMode, content, setContent, updateContent })
const renderDynamicSections = ({ pageKey, sectionOrder, hiddenSections, sectionRenderers, sectionLabels, editMode, content, setContent, updateContent }) => {
  const moveSectionOrder = (idx, direction) => {
    const order = [...sectionOrder];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= order.length) return;
    [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
    updateContent(pageKey, "section_order", order);
  };

  const toggleSectionHidden = (sectionId) => {
    const hidden = [...hiddenSections];
    const idx = hidden.indexOf(sectionId);
    if (idx >= 0) hidden.splice(idx, 1);
    else hidden.push(sectionId);
    updateContent(pageKey, "hidden_sections", hidden);
  };

  const renderBlocks = (position) => {
    const blocks = (content?.customBlocks || []).filter(b => b.position === position);
    return (
      <>
        {blocks.map(block => (
          <Section key={block.id} style={{ paddingBottom: 40 }}>
            <CustomBlock block={block} editMode={editMode} content={content} setContent={setContent} />
          </Section>
        ))}
        <AddBlockInserter position={position} editMode={editMode} content={content} setContent={setContent} />
      </>
    );
  };

  return sectionOrder.map((sectionId, idx) => {
    const isHidden = hiddenSections.includes(sectionId);
    const renderer = sectionRenderers[sectionId];
    if (!renderer) return null;
    if (isHidden && !editMode) return null;

    return (
      <div key={sectionId} style={isHidden && editMode ? { opacity: 0.35, position: "relative" } : undefined}>
        <_SectionControls
          label={sectionLabels[sectionId] || sectionId}
          editMode={editMode}
          onMoveUp={() => moveSectionOrder(idx, "up")}
          onMoveDown={() => moveSectionOrder(idx, "down")}
          onToggleHide={() => toggleSectionHidden(sectionId)}
          isHidden={isHidden}
          isFirst={idx === 0}
          isLast={idx === sectionOrder.length - 1}
        />
        {renderer()}
        {renderBlocks(`${pageKey}_after_${sectionId}`)}
      </div>
    );
  });
};

// ─── ABOUT PAGE (shared) ─────────────────────────────────────────────
// Props: defaults — { competencies, services, keyAreas, certs } fallbacks per site
// ─── Section wrapper with move/hide controls ──────────────────────
const _SectionControls = ({ label, editMode, onMoveUp, onMoveDown, onToggleHide, isHidden, isFirst, isLast }) => {
  if (!editMode) return null;
  const btnStyle = { background: "rgba(148,163,184,0.12)", border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: theme.white, transition: "background 0.15s" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", marginBottom: 8, background: "rgba(34,211,238,0.04)", border: `1px solid ${theme.accent}22`, borderRadius: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: theme.accent, textTransform: "uppercase", letterSpacing: "0.08em", flex: 1 }}>{label}</span>
      <button onClick={onMoveUp} disabled={isFirst} style={{ ...btnStyle, opacity: isFirst ? 0.3 : 1 }} title="Move up">↑</button>
      <button onClick={onMoveDown} disabled={isLast} style={{ ...btnStyle, opacity: isLast ? 0.3 : 1 }} title="Move down">↓</button>
      <button onClick={onToggleHide} style={{ ...btnStyle, background: isHidden ? "#ef4444" : "rgba(34,211,238,0.2)", color: isHidden ? "#fff" : theme.accent, width: "auto", padding: "0 8px", fontSize: 10, fontWeight: 600 }}>
        {isHidden ? "Hidden" : "Visible"}
      </button>
    </div>
  );
};

const _AboutPage = ({ setPage, editMode = false, content = {}, setContent = () => {}, t = (k) => k, defaults = {} }) => {
  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  const updateContent = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [key]: value }
    }));
  };

  const renderBlocks = (position) => {
    const blocks = (content?.customBlocks || []).filter(b => b.position === position);
    return (
      <>
        {blocks.map(block => (
          <Section key={block.id} style={{ paddingBottom: 40 }}>
            <CustomBlock block={block} editMode={editMode} content={content} setContent={setContent} />
          </Section>
        ))}
        <AddBlockInserter position={position} editMode={editMode} content={content} setContent={setContent} />
      </>
    );
  };

  const dfltCompetencies = defaults.competencies || [];
  const dfltServices = defaults.services || [];
  const dfltKeyAreas = defaults.keyAreas || [];
  const dfltCerts = defaults.certs || [];

  // ─── Section ordering ─────────────────────────────────
  const defaultSectionOrder = ["competencies", "services", "keyAreas", "certs", "cta"];
  const sectionOrder = c("about", "section_order", defaultSectionOrder);
  const hiddenSections = c("about", "hidden_sections", []);
  const sectionLabels = { competencies: "Competencies", services: "Services", keyAreas: "Key Areas", certs: "Certifications", cta: "Call to Action" };

  // ─── Section renderers (each renders one named section) ──────
  const sectionRenderers = {
    competencies: () => (
      <Section style={{ paddingBottom: 80 }}>
        <EditableText value={c("about", "competencies_title", t("about_competencies_title"))} onChange={v => updateContent("about", "competencies_title", v)} editMode={editMode} tag="h2"
          style={{ fontSize: 24, fontWeight: 600, color: theme.white, marginBottom: 24 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 48 }}>
          {(c("about", "competencies", dfltCompetencies)).map((tag, i) => (
            <div key={i} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <Tag text={tag} />
              {editMode && (
                <button onClick={() => { const list = [...(c("about", "competencies", []))]; list.splice(i, 1); updateContent("about", "competencies", list); }} style={{
                  position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ff6b6b", color: "#fff",
                  border: "none", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>×</button>
              )}
            </div>
          ))}
          {editMode && (
            <button onClick={() => { const tag = prompt("New competency:"); if (tag) { const list = [...(c("about", "competencies", dfltCompetencies))]; list.push(tag); updateContent("about", "competencies", list); } }} style={{
              background: "rgba(34,211,238,0.15)", border: `1px dashed ${theme.accent}`, color: theme.accent, padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>+ Add</button>
          )}
        </div>
      </Section>
    ),

    services: () => (
      <Section style={{ paddingBottom: 80 }}>
        <EditableText value={c("about", "services_title", t("about_services_title"))} onChange={v => updateContent("about", "services_title", v)} editMode={editMode} tag="h2"
          style={{ fontSize: 24, fontWeight: 600, color: theme.white, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {(c("about", "services", dfltServices)).map((s, i) => (
            <div key={i} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: "18px 22px", display: "flex", gap: 12, alignItems: "flex-start", position: "relative" }} className="card-lift">
              <span style={{ color: theme.accent, marginTop: 2, flexShrink: 0 }}>◆</span>
              {editMode ? (
                <input value={s} onChange={e => { const list = [...(c("about", "services", []))]; list[i] = e.target.value; updateContent("about", "services", list); }} style={{
                  background: "transparent", border: "1px dashed rgba(34,211,238,0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 14.5, color: theme.textLight, width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif",
                }} />
              ) : (<span style={{ fontSize: 14.5, color: theme.textLight, lineHeight: 1.5 }}>{s}</span>)}
              {editMode && (
                <button onClick={() => { const list = [...(c("about", "services", []))]; list.splice(i, 1); updateContent("about", "services", list); }} style={{
                  position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: "50%", background: "#ff6b6b", color: "#fff", border: "none", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              )}
            </div>
          ))}
          {editMode && (
            <div onClick={() => { const svc = prompt("New service:"); if (svc) { const list = [...(c("about", "services", []))]; list.push(svc); updateContent("about", "services", list); } }} style={{
              background: "transparent", border: `2px dashed rgba(34,211,238,0.2)`, borderRadius: 12, padding: "18px 22px", display: "flex", gap: 12, alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.accent, fontSize: 14,
            }} className="card-lift">+ Add Service</div>
          )}
        </div>
      </Section>
    ),

    keyAreas: () => (
      <Section style={{ paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {(c("about", "keyAreas", dfltKeyAreas)).map((area, areaIdx) => (
            <div key={areaIdx} style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "28px 24px", position: "relative" }} className="card-lift">
              {editMode && (<button onClick={() => { const areas = [...(c("about", "keyAreas", []))]; areas.splice(areaIdx, 1); updateContent("about", "keyAreas", areas); }} style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "#ff6b6b", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>)}
              <EditableText value={area.title} onChange={v => { const areas = [...(c("about", "keyAreas", []))]; areas[areaIdx] = { ...areas[areaIdx], title: v }; updateContent("about", "keyAreas", areas); }} editMode={editMode} tag="h3"
                style={{ fontSize: 17, fontWeight: 600, color: theme.white, marginBottom: 16 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {area.items.map((item, itemIdx) => (
                  <div key={itemIdx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: theme.accent, marginTop: 3, flexShrink: 0, fontSize: 12 }}>→</span>
                    {editMode ? (
                      <div style={{ display: "flex", gap: 4, flex: 1, alignItems: "center" }}>
                        <input value={item} onChange={e => { const areas = [...(c("about", "keyAreas", []))]; const items = [...areas[areaIdx].items]; items[itemIdx] = e.target.value; areas[areaIdx] = { ...areas[areaIdx], items }; updateContent("about", "keyAreas", areas); }} style={{
                          background: "transparent", border: "1px dashed rgba(34,211,238,0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 14, color: theme.textMuted, flex: 1, outline: "none", fontFamily: "'DM Sans', sans-serif",
                        }} />
                        <button onClick={() => { const areas = [...(c("about", "keyAreas", []))]; const items = [...areas[areaIdx].items]; items.splice(itemIdx, 1); areas[areaIdx] = { ...areas[areaIdx], items }; updateContent("about", "keyAreas", areas); }} style={{
                          background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: 14, padding: "2px 4px",
                        }}>×</button>
                      </div>
                    ) : (<span style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.55 }}>{item}</span>)}
                  </div>
                ))}
                {editMode && (<button onClick={() => { const txt = prompt("New item:"); if (txt) { const areas = [...(c("about", "keyAreas", []))]; const items = [...areas[areaIdx].items, txt]; areas[areaIdx] = { ...areas[areaIdx], items }; updateContent("about", "keyAreas", areas); } }} style={{
                  background: "none", border: "1px dashed rgba(34,211,238,0.2)", color: theme.accent, padding: "6px", borderRadius: 6, fontSize: 12, cursor: "pointer", marginTop: 4, fontFamily: "'DM Sans', sans-serif",
                }}>+ Add item</button>)}
              </div>
            </div>
          ))}
          {editMode && (<div onClick={() => { const title = prompt("New area title:"); if (title) { const areas = [...(c("about", "keyAreas", []))]; areas.push({ title, items: ["New item"] }); updateContent("about", "keyAreas", areas); } }} style={{
            background: "transparent", border: `2px dashed rgba(34,211,238,0.2)`, borderRadius: 16, padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.accent, fontSize: 14, minHeight: 160,
          }} className="card-lift">+ Add Area</div>)}
        </div>
      </Section>
    ),

    certs: () => (
      <Section style={{ paddingBottom: 80 }}>
        <CertificationsSection content={content} editMode={editMode} updateContent={updateContent} defaultCerts={dfltCerts} />
      </Section>
    ),

    cta: () => (
      <Section style={{ paddingBottom: 120 }}>
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <EditableText value={c("about", "cta_title", t("about_cta_title"))} onChange={v => updateContent("about", "cta_title", v)} editMode={editMode} tag="h2"
            style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 600, color: theme.white, marginBottom: 28 }} />
          <EditableButton editMode={editMode} linkType={c("about", "cta_linkType", "page")} linkTarget={c("about", "cta_linkTarget", "contact")}
            onChangeLinkType={v => updateContent("about", "cta_linkType", v)} onChangeLinkTarget={v => updateContent("about", "cta_linkTarget", v)}
            onChangeLabel={v => updateContent("about", "cta_label", v)}
            onClick={() => {
              const type = c("about", "cta_linkType", "page"); const target = c("about", "cta_linkTarget", "contact");
              if (type === "page") { setPage(target === "contact" ? PAGES.CONTACT : target === "about" ? PAGES.ABOUT : target === "projects" ? PAGES.PROJECTS : PAGES.HOME); window.scrollTo(0, 0); }
              else if (type === "url") { window.open(target, "_blank"); }
              else if (type === "email") { window.location.href = `mailto:${target}`; }
            }} accent={true}
          >{c("about", "cta_label", t("about_cta_btn"))}</EditableButton>
        </div>
      </Section>
    ),
  };

  return (
  <div>
    {/* Hero (always first) */}
    <PageHero bgKey="about_header" content={content} editMode={editMode} updateContent={updateContent}>
    <Section style={{ paddingTop: 120, paddingBottom: 80 }}>
      <div className="animate-up">
        <p style={{ fontSize: 13, color: theme.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>{t("about_label")}</p>
        <EditableText value={c("about", "title", t("about_title"))} onChange={v => updateContent("about", "title", v)} editMode={editMode} tag="h1" className="serif"
          style={{ fontSize: "clamp(36px, 5vw, 56px)", fontStyle: "italic", color: theme.white, lineHeight: 1.2, marginBottom: 28, letterSpacing: "-0.02em" }} />
      </div>
      <EditableText value={c("about", "description", t("about_description"))} onChange={v => updateContent("about", "description", v)} editMode={editMode} tag="p" className="animate-up delay-2"
        style={{ fontSize: 17, lineHeight: 1.8, color: theme.textMuted, maxWidth: 720, marginBottom: 48 }} />
    </Section>
    </PageHero>

    {/* Dynamic sections — rendered in configurable order */}
    {renderDynamicSections({
      pageKey: "about", sectionOrder, hiddenSections, sectionRenderers, sectionLabels,
      editMode, content, setContent, updateContent,
    })}
  </div>
  );
};

// ─── FOOTER (shared) ─────────────────────────────────────────────────
// Props: Logo, siteName, renderAddress — everything else is driven by t() and content.json
// ─── HOME PAGE (shared, for provisioned sites) ──────────────────────
// Generic dynamic home page with hero + configurable sections.
// Props: extraSections — { id: renderer } to add site-specific sections
const _HomePage = ({ setPage, editMode = false, content = {}, setContent = () => {}, t = (k) => k, weatherVideoUrl = null, extraSections = {}, defaultSectionOrder = null }) => {
  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  const updateContent = (section, key, value) => {
    setContent(prev => ({ ...prev, [section]: { ...(prev?.[section] || {}), [key]: value } }));
  };

  // Built-in section renderers
  const builtInSections = {
    services: () => (
      <Section style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="animate-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 13, color: theme.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>{t("services_label") || "Services"}</p>
          <EditableText value={c("services", "title", t("services_title") || "What We Offer")} onChange={v => updateContent("services", "title", v)} editMode={editMode} tag="h2" className="serif"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", fontStyle: "italic", color: theme.white, lineHeight: 1.2 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {(c("services", "cards", [])).map((card, i) => (
            <ServiceCard key={i}
              title={card.title} subtitle={card.subtitle} price={card.price}
              items={card.items || []} highlight={card.highlight}
              editMode={editMode}
              onUpdate={(field, value) => {
                const cards = [...(c("services", "cards", []))];
                cards[i] = { ...cards[i], [field]: value };
                updateContent("services", "cards", cards);
              }}
              onDelete={() => {
                const cards = [...(c("services", "cards", []))];
                cards.splice(i, 1);
                updateContent("services", "cards", cards);
              }}
            />
          ))}
          {editMode && (
            <div onClick={() => { const cards = [...(c("services", "cards", []))]; cards.push({ icon: "star", title: "New Service", description: "Describe this service." }); updateContent("services", "cards", cards); }} style={{
              background: "transparent", border: `2px dashed rgba(34,211,238,0.2)`, borderRadius: 16, padding: "40px 24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.accent, fontSize: 15, fontWeight: 600, minHeight: 200,
            }}>+ Add Service</div>
          )}
        </div>
      </Section>
    ),

    cta: () => (
      <Section style={{ paddingBottom: 120 }}>
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <EditableText value={c("cta", "title", "Ready to get started?")} onChange={v => updateContent("cta", "title", v)} editMode={editMode} tag="h2"
            style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 600, color: theme.white, marginBottom: 16 }} />
          <EditableText value={c("cta", "subtitle", "Let's build something great together.")} onChange={v => updateContent("cta", "subtitle", v)} editMode={editMode} tag="p"
            style={{ fontSize: 17, color: theme.textMuted, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }} />
          <AccentBtn onClick={() => setPage(PAGES.CONTACT)} style={{ padding: "14px 36px", fontSize: 16 }}>
            {t("contact_title") || "Get in Touch"}
          </AccentBtn>
        </div>
      </Section>
    ),
  };

  // Merge built-in + extra sections
  const sectionRenderers = { ...builtInSections, ...extraSections };
  const dfltOrder = defaultSectionOrder || Object.keys(sectionRenderers);
  const sectionOrder = c("home", "section_order", dfltOrder);
  const hiddenSections = c("home", "hidden_sections", []);
  const sectionLabels = { services: "Services", cta: "Call to Action", ...Object.fromEntries(Object.keys(extraSections).map(k => [k, k.charAt(0).toUpperCase() + k.slice(1)])) };

  return (
    <div>
      {/* Hero (always first, not movable) */}
      <div style={{
        minHeight: "90vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", position: "relative",
        overflow: "hidden", padding: "120px 20px 80px",
      }}>
        {(() => {
          const bgImage = c("hero", "bg_image", "");
          const bgVideo = (content?.settings?.weather_video_enabled && weatherVideoUrl) || c("hero", "bg_video", "");
          const darkOpacity = parseFloat(c("hero", "overlay_dark", 0.75));
          const lightOpacity = parseFloat(c("hero", "overlay_light", 0.7));
          const op = theme.mode === "dark" ? darkOpacity : lightOpacity;
          const overlay = (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: theme.mode === "dark"
                ? `linear-gradient(180deg, rgba(10,15,26,${(op * 0.9).toFixed(2)}) 0%, rgba(10,15,26,${op.toFixed(2)}) 50%, rgba(10,15,26,${Math.min(1, op * 1.25).toFixed(2)}) 100%)`
                : `linear-gradient(180deg, rgba(245,247,250,${(op * 0.9).toFixed(2)}) 0%, rgba(245,247,250,${op.toFixed(2)}) 50%, rgba(245,247,250,${Math.min(1, op * 1.3).toFixed(2)}) 100%)`,
              zIndex: 0,
            }} />
          );
          if (bgVideo) return (<><video key={bgVideo} autoPlay muted loop playsInline style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} src={bgVideo} />{overlay}</>);
          if (bgImage) return (<><div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />{overlay}</>);
          return null;
        })()}
        {editMode && (
          <div style={{ position: "absolute", top: 80, right: 24, zIndex: 10, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
            <label style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>Hero Background</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={async () => { const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.onchange = async (e) => { const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append("image", file); const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: fd }); const data = await res.json(); if (data.url) { updateContent("hero", "bg_image", data.url); updateContent("hero", "bg_video", ""); } }; input.click(); }} style={{ background: "rgba(148,163,184,0.08)", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Image</button>
              <button onClick={async () => { const input = document.createElement("input"); input.type = "file"; input.accept = "video/mp4,video/webm"; input.onchange = async (e) => { const file = e.target.files[0]; if (!file) return; const fd = new FormData(); fd.append("image", file); const res = await fetch(`${API_URL}?action=upload`, { method: "POST", credentials: "include", body: fd }); const data = await res.json(); if (data.url) { updateContent("hero", "bg_video", data.url); updateContent("hero", "bg_image", ""); } }; input.click(); }} style={{ background: "rgba(148,163,184,0.08)", color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Video</button>
            </div>
            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>Overlay (Dark): {Math.round(parseFloat(c("hero", "overlay_dark", 0.75)) * 100)}%</label>
              <input type="range" min="0" max="100" value={Math.round(parseFloat(c("hero", "overlay_dark", 0.75)) * 100)} onChange={e => updateContent("hero", "overlay_dark", (parseInt(e.target.value) / 100).toFixed(2))} style={{ width: "100%", accentColor: theme.accent }} />
              <label style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600 }}>Overlay (Light): {Math.round(parseFloat(c("hero", "overlay_light", 0.7)) * 100)}%</label>
              <input type="range" min="0" max="100" value={Math.round(parseFloat(c("hero", "overlay_light", 0.7)) * 100)} onChange={e => updateContent("hero", "overlay_light", (parseInt(e.target.value) / 100).toFixed(2))} style={{ width: "100%", accentColor: theme.accent }} />
            </div>
          </div>
        )}
        <Section style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className="animate-up">
            <EditableText value={c("hero", "title1", t("site_name"))} onChange={v => updateContent("hero", "title1", v)} editMode={editMode} tag="h1" className="serif"
              style={{ fontSize: "clamp(40px, 7vw, 72px)", fontStyle: "italic", color: theme.white, lineHeight: 1.1, letterSpacing: "-0.02em" }} />
            <EditableText value={c("hero", "title2", "Your Business")} onChange={v => updateContent("hero", "title2", v)} editMode={editMode} tag="h1" className="serif"
              style={{ fontSize: "clamp(40px, 7vw, 72px)", fontStyle: "italic", color: theme.accent, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 24 }} />
            <EditableText value={c("hero", "description", "Edit this text to describe your business.")} onChange={v => updateContent("hero", "description", v)} editMode={editMode} tag="p"
              style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: theme.textMuted, maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7 }} />
            <AccentBtn onClick={() => setPage(PAGES.CONTACT)} style={{ padding: "14px 36px", fontSize: 16 }}>
              {t("contact_title") || "Get in Touch"}
            </AccentBtn>
          </div>
        </Section>
      </div>

      {/* Dynamic sections */}
      {renderDynamicSections({
        pageKey: "home", sectionOrder, hiddenSections, sectionRenderers, sectionLabels,
        editMode, content, setContent, updateContent,
      })}
    </div>
  );
};

const _Footer = ({ setPage, onCopyrightClick, editMode = false, content = {}, setContent = () => {}, t = (k) => k, lang = "en", Logo = null, siteName = "", renderAddress = null }) => {
  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  // Use branding name if admin changed it, otherwise fall back to prop
  const displayName = content?.branding?.site_name || siteName;
  const updateContent = (section, key, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [key]: value }
    }));
  };

  return (
  <footer style={{
    borderTop: `1px solid ${theme.border}`,
    background: theme.mode === "dark" ? "rgba(10,15,26,0.6)" : "rgba(0,0,0,0.04)",
    padding: "48px 24px 32px",
  }}>
    <div style={{
      maxWidth: 1200, margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: 40,
    }}
    className="footer-grid"
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {Logo && <Logo size={28} />}
          <span style={{ fontSize: 17, fontWeight: 600, color: theme.white }}>{displayName}</span>
        </div>
        <EditableText
          value={c("footer", "description", t("footer_description"))}
          onChange={v => updateContent("footer", "description", v)}
          editMode={editMode}
          tag="p"
          style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.7, maxWidth: 380 }}
        />

        {/* Certification badge with link */}
        {(c("footer", "cert_image", "") || editMode) && (
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {c("footer", "cert_image", "") ? (
                <a
                  href={editMode ? undefined : c("footer", "cert_link", "#")}
                  target={editMode ? undefined : "_blank"}
                  rel="noreferrer"
                  onClick={editMode ? (e) => e.preventDefault() : undefined}
                  style={{ display: "block" }}
                >
                  <img
                    src={c("footer", "cert_image", "")}
                    alt={displayName}
                    style={{ height: 56, width: "auto", borderRadius: 8, display: "block" }}
                  />
                </a>
              ) : editMode ? (
                <div style={{
                  width: 56, height: 56, borderRadius: 8,
                  border: `2px dashed ${theme.accent}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: theme.accent, fontSize: 10, textAlign: "center", lineHeight: 1.2,
                }}>No image</div>
              ) : null}
              {editMode && (
                <label style={{
                  position: "absolute", inset: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.5)", borderRadius: 8,
                  color: "#fff", fontSize: 11, fontWeight: 600,
                  opacity: 0, transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  Upload
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("image", file);
                    try {
                      const res = await fetch(`${API_URL}?action=upload`, { method: "POST", body: fd, credentials: "include" });
                      const data = await res.json();
                      if (data.ok && data.url) {
                        updateContent("footer", "cert_image", data.url);
                      }
                    } catch (err) { console.error("Upload failed", err); }
                  }} />
                </label>
              )}
            </div>
            {editMode && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>Badge link URL</label>
                <input
                  value={c("footer", "cert_link", "")}
                  onChange={e => updateContent("footer", "cert_link", e.target.value)}
                  placeholder="https://..."
                  style={{
                    width: 240, background: "rgba(148,163,184,0.06)",
                    border: `1px solid ${theme.border}`, borderRadius: 6,
                    padding: "6px 10px", fontSize: 12, color: theme.white,
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: theme.textLight, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {t("footer_nav")}
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(content?.navigation?.items || [
            { key: PAGES.HOME, label: t("nav_home"), visible: true },
            { key: PAGES.ABOUT, label: t("nav_about"), visible: true },
            { key: PAGES.CONTACT, label: t("nav_contact"), visible: true },
            { key: PAGES.PROJECTS, label: t("nav_projects"), visible: true },
          ]).filter(item => item.visible !== false).map(item => {
            const navT = { [PAGES.HOME]: "nav_home", [PAGES.ABOUT]: "nav_about", [PAGES.CONTACT]: "nav_contact", [PAGES.PROJECTS]: "nav_projects" };
            const label = (item.labels && item.labels[lang]) ? item.labels[lang] : (navT[item.key] ? t(navT[item.key]) : (item.label || item.key));
            return (
              <span
                key={item.key}
                className="glow-link"
                style={{ fontSize: 14, color: theme.textMuted, cursor: "pointer" }}
                onClick={() => {
                  if (item.url) { window.open(item.url, "_blank"); }
                  else { setPage(item.key); window.scrollTo(0, 0); }
                }}
                onMouseEnter={e => e.target.style.color = theme.accent}
                onMouseLeave={e => e.target.style.color = theme.textMuted}
              >
                {label}{item.url ? " ↗" : ""}
              </span>
            );
          })}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: theme.textLight, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {t("footer_address")}
        </h4>
        <EditableText
          value={content?.footer?.address || t("footer_address_default") || "Your Address<br>Your City, Country"}
          onChange={v => setContent(prev => ({ ...prev, footer: { ...(prev?.footer || {}), address: v } }))}
          editMode={editMode}
          tag="div"
          style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.8 }}
        />
        {renderAddress && renderAddress({ theme, t })}
      </div>
    </div>

    <div style={{
      maxWidth: 1200, margin: "0 auto",
      borderTop: `1px solid ${theme.border}`,
      marginTop: 36,
      paddingTop: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: theme.textMuted, cursor: "pointer" }} onClick={onCopyrightClick}>
        {c("footer", "copyright", `\u00a9 ${new Date().getFullYear()} ${displayName}`)}
      </span>
      <a
        href="https://dropcms.app"
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 11, color: theme.textMuted,
          display: "inline-flex", alignItems: "center", gap: 6,
          textDecoration: "none",
          transition: "all 0.2s ease",
          padding: "4px 10px", borderRadius: 6,
          border: "1px solid transparent", opacity: 0.6,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = theme.accent;
          e.currentTarget.style.borderColor = theme.accentDim;
          e.currentTarget.style.background = theme.accentDim;
          e.currentTarget.style.opacity = 1;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = theme.textMuted;
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.opacity = 0.6;
        }}
        title="Learn more about DropCMS"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10l4 4"/><path d="M12 12L8 16"/><circle cx="12" cy="19" r="3"/></svg>
        {t("footer_powered")}
      </a>
      <span style={{ fontSize: 12, color: theme.textMuted, opacity: 0.6 }}>
        {t("footer_location")}
      </span>
    </div>

    <style>{`
      @media (max-width: 680px) {
        .footer-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </footer>
  );
};

// ─── Custom Page (admin-created pages, fully block-based) ────────────
const CustomPage = ({ pageSlug, editMode = false, content = {}, setContent = () => {}, t = (k) => k, setPage = () => {} }) => {
  const pages = content?.customPages || [];
  const pageData = pages.find(p => p.slug === pageSlug);
  const pageTitle = pageData?.title || pageSlug;

  const c = (section, key, fallback) => content?.[section]?.[key] ?? fallback;
  const updateContent = (section, key, value) => {
    setContent(prev => ({ ...prev, [section]: { ...(prev?.[section] || {}), [key]: value } }));
  };

  const blocks = (content?.customBlocks || []).filter(b => b.position === `page_${pageSlug}`);

  return (
    <div>
      <PageHero bgKey={`page_${pageSlug}_header`} content={content} editMode={editMode} updateContent={updateContent}>
      <Section style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="animate-up">
          <EditableText
            value={c(`page_${pageSlug}`, "title", pageTitle)}
            onChange={v => updateContent(`page_${pageSlug}`, "title", v)}
            editMode={editMode}
            tag="h1"
            className="serif"
            style={{ fontSize: "clamp(36px, 5vw, 56px)", fontStyle: "italic", color: theme.white, lineHeight: 1.2, marginBottom: 28, letterSpacing: "-0.02em" }}
          />
        </div>
        <EditableText
          value={c(`page_${pageSlug}`, "description", "Add content to this page using the + button below.")}
          onChange={v => updateContent(`page_${pageSlug}`, "description", v)}
          editMode={editMode}
          tag="p"
          className="animate-up delay-2"
          style={{ fontSize: 17, lineHeight: 1.8, color: theme.textMuted, maxWidth: 720, marginBottom: 48 }}
        />
      </Section>
      </PageHero>

      {blocks.map(block => (
        <Section key={block.id} style={{ paddingBottom: 40 }}>
          <CustomBlock block={block} editMode={editMode} content={content} setContent={setContent} />
        </Section>
      ))}
      <AddBlockInserter position={`page_${pageSlug}`} editMode={editMode} content={content} setContent={setContent} />
    </div>
  );
};

// ─── APP SHELL ────────────────────────────────────────────────────────
// createApp() — shared App logic, parameterized for each site.
// Site-specific index.html calls this with its unique components & config.
function createApp({ UI_STRINGS, HomePage, AboutPage, Footer, SEO_DATA, siteUrl, siteName, defaultPostCategories, homePageExtraProps, renderExtraContent, useSharedHomePage = false }) {
  // Only replace HomePage if site explicitly opts in with useSharedHomePage: true
  if (useSharedHomePage && _HomePage) HomePage = _HomePage;

  function App() {
    const [page, setPageState] = useState(pageFromPath);
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [copyrightClicks, setCopyrightClicks] = useState(0);
    const [postEditorOpen, setPostEditorOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [content, setContent] = useState({});
    const [refreshProjects, setRefreshProjects] = useState(0);
    const [projectSlug, setProjectSlug] = useState(() => window.__projectSlug || null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [cookieConsent, setCookieConsent] = useState(getStoredConsent);
    const [platformUpdate, setPlatformUpdate] = useState(null); // {version, changelog} if update available

    // ─── Platform heartbeat (fires on admin login + every 30 min) ────
    useEffect(() => {
      if (!adminLoggedIn) return;
      const sendHeartbeat = async () => {
        try {
          const errors = [...(window.__dropcmsErrors || [])];
          window.__dropcmsErrors = [];
          const res = await fetch(`${API_URL}?action=platform-heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              version: DROPCMS_VERSION,
              error_count: errors.length,
              errors: errors.slice(0, 20),
            }),
          });
          const data = await res.json();
          if (data.update_available) {
            setPlatformUpdate({ version: data.latest_version, changelog: data.changelog || '' });
          }
        } catch (e) { /* silent */ }
      };
      sendHeartbeat();
      const interval = setInterval(sendHeartbeat, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }, [adminLoggedIn]);

    // ─── Language system ───────────────────────────────────────────────
    const [lang, setLang] = useState(() => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang === 'sv' || urlLang === 'en') return urlLang;
        return localStorage.getItem('gc_lang') || 'en';
      } catch { return 'en'; }
    });
    const t = (key) => UI_STRINGS[lang]?.[key] ?? UI_STRINGS.en[key] ?? key;
    useEffect(() => {
      try { localStorage.setItem('gc_lang', lang); } catch {}
    }, [lang]);

    // ─── Theme system ───────────────────────────────────────────────
    const VISITOR_THEME_KEY = "dropcms_theme_mode";
    const getStoredVisitorTheme = () => {
      try {
        const v = localStorage.getItem(VISITOR_THEME_KEY);
        if (v === "light") return "light";
        if (v) localStorage.removeItem(VISITOR_THEME_KEY);
        return null;
      } catch { return null; }
    };
    const [visitorThemeOverride, setVisitorThemeOverride] = useState(getStoredVisitorTheme);
    const adminDarkId = content?.settings?.theme_dark || content?.settings?.theme_id || "dark";
    const adminLightId = content?.settings?.theme_light || "light";
    const adminDarkTheme = THEME_PRESETS[adminDarkId] || THEME_PRESETS.dark;
    const adminLightTheme = THEME_PRESETS[adminLightId] || THEME_PRESETS.light;
    const adminTheme = adminDarkTheme;
    const resolveTheme = () => {
      if (visitorThemeOverride === "light") return adminLightTheme;
      if (visitorThemeOverride === "dark") return adminDarkTheme;
      return adminDarkTheme;
    };
    theme = resolveTheme();

    const toggleVisitorTheme = () => {
      if (visitorThemeOverride === "light") {
        setVisitorThemeOverride(null);
        try { localStorage.removeItem(VISITOR_THEME_KEY); } catch {}
      } else {
        setVisitorThemeOverride("light");
        try { localStorage.setItem(VISITOR_THEME_KEY, "light"); } catch {}
      }
    };

    const resetVisitorTheme = () => {
      setVisitorThemeOverride(null);
      try { localStorage.removeItem(VISITOR_THEME_KEY); } catch {}
    };

    useEffect(() => {
      document.body.style.background = theme.bg;
      document.body.style.color = theme.text;
      let dynStyle = document.getElementById("dynamic-theme");
      if (!dynStyle) {
        dynStyle = document.createElement("style");
        dynStyle.id = "dynamic-theme";
        document.head.appendChild(dynStyle);
      }
      dynStyle.textContent = `
        body { background: ${theme.bg} !important; color: ${theme.text} !important; }
        ::-webkit-scrollbar-track { background: ${theme.bg} !important; }
        ::-webkit-scrollbar-thumb { background: ${theme.accent} !important; }
      `;
    }, [theme.bg, theme.text, theme.accent]);

    // ─── Weather-based hero video ───────────────────────────────────
    const [weatherVideoUrl, setWeatherVideoUrl] = useState(null);
    const [weatherCondition, setWeatherCondition] = useState(null);

    useEffect(() => {
      const weatherEnabled = content?.settings?.weather_video_enabled;
      const apiKey = content?.settings?.weather_api_key;
      if (!weatherEnabled || !apiKey) {
        setWeatherCondition(null);
        return;
      }
      if (weatherCondition) return;

      let cancelled = false;
      const fetchWeather = async () => {
        try {
          // Geolocation is resolved server-side from the visitor's IP (see admin-api.php weather case).
          // This avoids browser-side services like ipapi.co getting rate-limited across all visitors.
          const weatherRes = await fetch(
            `${API_URL}?action=weather`,
            { signal: AbortSignal.timeout(8000) }
          );
          const weather = await weatherRes.json();
          if (cancelled || !weather.condition) return;

          const condition = weather.condition.toLowerCase();
          const fogTypes = ["mist", "smoke", "haze", "dust", "fog", "sand", "ash", "squall", "tornado"];
          const mapped = fogTypes.includes(condition) ? "mist" : condition;
          // Night override: if it's dark and a night video is configured, use "night"
          if (weather.is_night) {
            window.__dropcmsIsNight = true;
          }
          setWeatherCondition(mapped);
        } catch (e) {
          if (!cancelled) setWeatherCondition("default");
        }
      };
      fetchWeather();
      return () => { cancelled = true; };
    }, [content?.settings?.weather_video_enabled, content?.settings?.weather_api_key]);

    useEffect(() => {
      if (!content?.settings) return;
      const weatherEnabled = content.settings.weather_video_enabled;
      const defaultVideo = content.settings.weather_video_default || "";
      if (!weatherEnabled) {
        setWeatherVideoUrl(null);
        return;
      }
      if (!weatherCondition) {
        setWeatherVideoUrl(defaultVideo || null);
        return;
      }

      // Night video takes priority if it's dark and a night video is set
      const nightVideo = window.__dropcmsIsNight ? (content?.settings?.weather_video_night || "") : "";
      const matchedVideo = content?.settings?.[`weather_video_${weatherCondition}`] || "";
      setWeatherVideoUrl(nightVideo || matchedVideo || defaultVideo || null);
    }, [weatherCondition, content?.settings]);

    // ─── Per-page SEO meta data ──────────────────────────────────────
    const updateSeoMeta = (pg, projectPost) => {
      let title, description, fullUrl;

      if (projectPost && projectPost.slug) {
        title = (projectPost.seo && projectPost.seo.title) || projectPost.title + (siteName ? ` — ${siteName}` : "");
        description = (projectPost.seo && projectPost.seo.description) || projectPost.excerpt || "";
        fullUrl = siteUrl + "/projects/" + projectPost.slug;
      } else {
        const seo = SEO_DATA[pg] || SEO_DATA[PAGES.HOME];
        title = seo.title;
        description = seo.description;
        fullUrl = siteUrl + seo.path;
      }

      document.title = title;

      const setMeta = (attr, key, val) => {
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (el) el.setAttribute("content", val);
      };

      setMeta("name", "description", description);
      setMeta("property", "og:title", title);
      setMeta("property", "og:description", description);
      setMeta("property", "og:url", fullUrl);
      setMeta("name", "twitter:title", title);
      setMeta("name", "twitter:description", description);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", fullUrl);
    };

    const setAdminNoIndex = (isAdmin) => {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      const googlebotMeta = document.querySelector('meta[name="googlebot"]');
      if (isAdmin) {
        if (robotsMeta) robotsMeta.setAttribute("content", "noindex, nofollow");
        if (googlebotMeta) googlebotMeta.setAttribute("content", "noindex, nofollow");
      } else {
        if (robotsMeta) robotsMeta.setAttribute("content", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
        if (googlebotMeta) googlebotMeta.setAttribute("content", "index, follow");
      }
    };

    const setPage = (pg) => {
      window.__projectSlug = null;
      setProjectSlug(null);
      setPageState(pg);
      const newPath = pathForPage(pg);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ page: pg }, "", newPath + window.location.hash);
      }
      updateSeoMeta(pg);
    };

    useEffect(() => {
      setAdminNoIndex(adminLoggedIn);
    }, [adminLoggedIn]);

    const handleAcceptCookies = () => {
      setCookieConsent("accepted");
      try { localStorage.setItem(CONSENT_KEY, "accepted"); } catch (e) {}
    };
    const handleDeclineCookies = () => {
      setCookieConsent("declined");
      try { localStorage.setItem(CONSENT_KEY, "declined"); } catch (e) {}
    };

    useEffect(() => {
      const gaId = content?.settings?.ga_id;
      if (!gaId || !/^G-[A-Z0-9]+$/.test(gaId)) return;
      if (adminLoggedIn) return;
      if (cookieConsent !== "accepted") return;
      if (document.querySelector(`script[src*="${gaId}"]`)) return;
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaId, { anonymize_ip: true });
    }, [content?.settings?.ga_id, adminLoggedIn, cookieConsent]);

    useEffect(() => {
      if (window.gtag && content?.settings?.ga_id && !adminLoggedIn && cookieConsent === "accepted") {
        window.gtag("event", "page_view", {
          page_path: pathForPage(page),
          page_title: SEO_DATA[page]?.title || document.title,
        });
      }
    }, [page]);

    // ─── Dynamic typography from settings ──────────────────────
    useEffect(() => {
      const typo = content?.settings || {};
      const rules = [];
      // Google Fonts import for custom heading font
      const hFont = typo.heading_font || "";
      if (hFont && hFont !== "Instrument Serif" && hFont !== "DM Sans") {
        const link = document.getElementById("dropcms-heading-font");
        const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(hFont)}:wght@400;600;700&display=swap`;
        if (link) { link.href = url; } else {
          const el = document.createElement("link"); el.id = "dropcms-heading-font"; el.rel = "stylesheet"; el.href = url;
          document.head.appendChild(el);
        }
      }
      const hFontFamily = hFont ? `'${hFont}', serif` : "";
      if (hFontFamily) rules.push(`h1, h2, h3, .serif { font-family: ${hFontFamily} !important; }`);
      ["h1", "h2", "h3"].forEach(tag => {
        const props = [];
        if (typo[`${tag}_size`]) props.push(`font-size: ${typo[`${tag}_size`]}`);
        if (typo[`${tag}_color`]) props.push(`color: ${typo[`${tag}_color`]}`);
        if (typo[`${tag}_style`]) props.push(`font-style: ${typo[`${tag}_style`]}`);
        if (typo[`${tag}_weight`]) props.push(`font-weight: ${typo[`${tag}_weight`]}`);
        if (props.length) rules.push(`${tag} { ${props.map(p => p + " !important").join("; ")}; }`);
      });
      let el = document.getElementById("dropcms-typography");
      if (!el) { el = document.createElement("style"); el.id = "dropcms-typography"; document.head.appendChild(el); }
      el.textContent = rules.join("\n");
    }, [content?.settings]);

    useEffect(() => {
      injectStyles();
      updateSeoMeta(page);

      const hashAdmin = window.location.hash === "#admin";
      if (hashAdmin) {
        setAdminLoggedIn(false);
      }

      const onPopState = () => {
        setPageState(pageFromPath());
        setProjectSlug(window.__projectSlug || null);
        window.scrollTo(0, 0);
      };
      window.addEventListener("popstate", onPopState);

      checkAuth();
      loadContent();

      return () => window.removeEventListener("popstate", onPopState);
    }, []);

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}?action=auth-check`, { credentials: "include" });
        const data = await response.json();
        if (data.authenticated) {
          setAdminLoggedIn(true);
        }
      } catch (err) {}
    };

    const loadContent = async (language) => {
      const useLang = language || lang;
      try {
        const response = await fetch(`${API_URL}?action=content&lang=${useLang}`, { credentials: "include" });
        const data = await response.json();
        if (!data || data.error) {
          console.log("Using default content");
          return;
        }
        setContent(data);
      } catch (err) {
        console.log("Using default content");
      }
    };

    useEffect(() => {
      loadContent(lang);
    }, [lang]);

    const handleCopyrightClick = () => {
      setCopyrightClicks(copyrightClicks + 1);
      if (copyrightClicks + 1 === 3) {
        setAdminLoggedIn(false);
        setCopyrightClicks(0);
      }
    };

    const handleLogout = () => {
      fetch(`${API_URL}?action=logout`, { credentials: "include" });
      setAdminLoggedIn(false);
      setEditMode(false);
      setCopyrightClicks(0);
      setPage(PAGES.HOME);
      window.history.pushState({}, "", _basePath);
      window.scrollTo(0, 0);
    };

    const handleNewPage = () => {
      const title = prompt("New page title:");
      if (!title) return;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!slug) return;
      // Add to customPages
      setContent(prev => {
        const pages = [...(prev?.customPages || [])];
        if (pages.find(p => p.slug === slug)) { alert("A page with this URL already exists."); return prev; }
        pages.push({ slug, title });
        // Auto-add to navigation
        const navItems = prev?.navigation?.items || [
          { key: PAGES.HOME, label: "Home", visible: true },
          { key: PAGES.ABOUT, label: "About", visible: true },
          { key: PAGES.CONTACT, label: "Contact", visible: true },
          { key: PAGES.PROJECTS, label: "Projects", visible: true },
        ];
        navItems.push({ key: "custom:" + slug, label: title, labels: { [lang]: title }, visible: true });
        return { ...prev, customPages: pages, navigation: { ...(prev?.navigation || {}), items: navItems } };
      });
      setEditMode(true);
      // Navigate to the new page
      setPageState("custom:" + slug);
      window.history.pushState({}, "", pathForPage("custom:" + slug));
      window.scrollTo(0, 0);
    };

    const handleNewPost = () => {
      setEditingPost(null);
      setPostEditorOpen(true);
    };

    const handleEditPost = (post) => {
      setEditingPost(post);
      setPostEditorOpen(true);
    };

    const handleDeletePost = async (postId) => {
      try {
        const response = await fetch(`${API_URL}?action=post&id=${postId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await response.json();
        if (data.ok) {
          setRefreshProjects(prev => prev + 1);
        } else {
          alert("Failed to delete post: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        alert("Error deleting post");
      }
    };

    const handlePostSave = () => {
      setRefreshProjects(prev => prev + 1);
    };

    const handleSaveContentChanges = async (silent = false) => {
      const response = await fetch(`${API_URL}?action=content&lang=${lang}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!data.ok) throw new Error("Failed to save");
    };

    // Wrapper for setLang that auto-saves and reloads content
    const handleLangChange = async (newLang) => {
      if (editMode && content) {
        // Save current content for current language before switching
        try {
          await fetch(`${API_URL}?action=content&lang=${lang}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(content),
          });
        } catch (e) {}
      }
      setLang(newLang);
    };

    // Collect extra props for HomePage if site provides them
    const extraProps = homePageExtraProps ? homePageExtraProps() : {};

    // Template mode: auto-login + edit mode (protected by admin panel auth)
    if (window.location.hash === "#template" && !adminLoggedIn) {
      setAdminLoggedIn(true);
      setEditMode(true);
      window.location.hash = "#admin";
    }

    // Mount AdminLogin for #admin AND for #reset=<64-hex-token> (password-reset
    // email links). Before 2.3.6 the reset link dropped the visitor on the public
    // homepage and the reset form never mounted — broken flow for anyone who
    // forgot their password.
    const _hashForAuth = window.location.hash || "";
    if ((_hashForAuth === "#admin" || /^#reset=[a-f0-9]{64}$/.test(_hashForAuth)) && !adminLoggedIn) {
      return (
        <div className="noise" style={{ minHeight: "100vh", position: "relative" }}>
          <GridBg />
          <AdminLogin onLoginSuccess={() => setAdminLoggedIn(true)} />
        </div>
      );
    }

    return (
      <div className="noise" style={{ minHeight: "100vh", position: "relative" }}>
        <GridBg />
        <Nav page={page} setPage={setPage} onToggleTheme={toggleVisitorTheme} currentThemeMode={theme.mode} lang={lang} setLang={handleLangChange} t={t} content={content} editMode={editMode} setContent={setContent} />
        <main style={{ position: "relative", zIndex: 1 }}>
          {page === PAGES.HOME && <HomePage setPage={setPage} editMode={editMode} content={content} setContent={setContent} t={t} weatherVideoUrl={weatherVideoUrl} {...extraProps} />}
          {page === PAGES.ABOUT && <AboutPage setPage={setPage} editMode={editMode} content={content} setContent={setContent} t={t} />}
          {page === PAGES.CONTACT && <ContactPage editMode={editMode} content={content} setContent={setContent} t={t} />}
          {page === PAGES.PROJECTS && (
            <ProjectsPage
              adminLoggedIn={adminLoggedIn}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              editMode={editMode}
              content={content}
              setContent={setContent}
              key={refreshProjects + "_" + (projectSlug || "all")}
              t={t}
              setPage={setPage}
              projectSlug={projectSlug}
              setProjectSlug={setProjectSlug}
            />
          )}
          {/* Custom pages (admin-created) */}
          {page.startsWith("custom:") && (
            <CustomPage
              pageSlug={page.substring(7)}
              editMode={editMode}
              content={content}
              setContent={setContent}
              t={t}
              setPage={setPage}
            />
          )}
        </main>
        <Footer setPage={setPage} onCopyrightClick={handleCopyrightClick} editMode={editMode} content={content} setContent={setContent} t={t} lang={lang} />

        {adminLoggedIn && (
          <>
            <AdminToolbar
              editMode={editMode}
              setEditMode={setEditMode}
              onLogout={handleLogout}
              onNewPost={handleNewPost}
              onNewPage={handleNewPage}
              onSaveChanges={handleSaveContentChanges}
              onOpenSettings={() => setSettingsOpen(true)}
            />
            {platformUpdate && (
              <div style={{
                position: "fixed", bottom: 80, right: 24, zIndex: 9990,
                background: theme.bgCard, border: `1px solid ${theme.accent}40`,
                borderRadius: 12, padding: "14px 18px", maxWidth: 320,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>Update Available</span>
                  <span onClick={() => setPlatformUpdate(null)} style={{ cursor: "pointer", color: theme.textMuted, fontSize: 16 }}>&#x2715;</span>
                </div>
                <p style={{ fontSize: 12, color: theme.textMuted, margin: "0 0 10px" }}>
                  v{DROPCMS_VERSION} → v{platformUpdate.version}
                </p>
                {platformUpdate.changelog && (
                  <p style={{ fontSize: 11, color: theme.textMuted, margin: "0 0 10px", lineHeight: 1.5 }}>{platformUpdate.changelog}</p>
                )}
                <button
                  onClick={async () => {
                    if (!window.confirm(`Update to v${platformUpdate.version}? A backup will be created first.`)) return;
                    try {
                      const res = await fetch(`${API_URL}?action=platform-update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ version: platformUpdate.version }),
                      });
                      const data = await res.json();
                      if (data.ok) {
                        alert(`Updated to v${platformUpdate.version}! Reloading...`);
                        window.location.reload();
                      } else {
                        alert('Update failed: ' + (data.error || 'Unknown error'));
                      }
                    } catch (err) {
                      alert('Update failed: ' + err.message);
                    }
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, #06b6d4)`,
                    color: theme.bg, border: "none", padding: "8px 16px", borderRadius: 8,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >Install Update</button>
              </div>
            )}
            <AdminSettingsPanel
              open={settingsOpen}
              onClose={() => { setSettingsOpen(false); handleSaveContentChanges(true); }}
              content={content}
              setContent={setContent}
            />

            <PostEditor
              isOpen={postEditorOpen}
              onClose={() => {
                setPostEditorOpen(false);
                setEditingPost(null);
              }}
              onSave={handlePostSave}
              editingPost={editingPost}
              adminLoggedIn={adminLoggedIn}
              categories={content?.projects?.categories || defaultPostCategories || [
                { id: "projects", title: "Projects" },
              ]}
            />
          </>
        )}

        {/* Site-specific extra content (e.g. onboarding modal) */}
        {renderExtraContent && renderExtraContent({ theme, content, setContent })}

        {!adminLoggedIn && cookieConsent === null && (
          <CookieConsentBanner
            onAccept={handleAcceptCookies}
            onDecline={handleDeclineCookies}
          />
        )}
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<ErrorBoundary><App /></ErrorBoundary>);
}

// Export shared components to window for site-specific code
window.DropCMS = {
  DROPCMS_VERSION, PAGES, THEME_PRESETS,
  ErrorBoundary, EditableText, EditableImage, EditableList, EditableButton,
  AddBlockInserter, CustomBlock, ImageGallery,
  injectStyles, GridBg,
  Nav, Section, SectionBox, PageHero,
  AccentBtn, OutlineBtn, decodeHTML,
  ServiceCard, QuestionPill, Tag,
  AdminLogin, PostEditor,
  CONSENT_KEY, getStoredConsent, CookieConsentBanner,
  AdminSettingsPanel, AdminToolbar,
  CertificationsSection,
  ContactPage, ProjectsPage, _AboutPage, _HomePage, _Footer,
  _SectionControls, renderDynamicSections,
  pageFromPath, pathForPage,
  createApp,
};
