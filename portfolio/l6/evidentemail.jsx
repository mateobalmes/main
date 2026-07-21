import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Copy, Check, Pencil, X, RotateCcw } from "lucide-react";

const FOREST = "#1B4D35";
const PAPER = "#FCFBF8";
const INK = "#191919";
const LINE = "#E3E0D8";

const AI_KEYWORD_RE = /\b(AI|ML|NLP)\b/i;

const DEFAULT_FAMILIES = [
  {
    id: "fam-dev",
    name: "AI Development",
    roles: [
      { id: "r1", tdTitle: "Advanced Analytics, Data Science", linkedinTitle: "Data Scientist" },
      { id: "r2", tdTitle: "Decision Scientist, Decision Science", linkedinTitle: "Decision Scientist" },
      { id: "r3", tdTitle: "Model Developer, Modeler", linkedinTitle: "Model Developer" },
      { id: "r4", tdTitle: "Quantitative Analyst, Algo Trader, Strat", linkedinTitle: "Quant" },
    ],
  },
  {
    id: "fam-spec",
    name: "AI Specialist",
    roles: [
      { id: "r5", tdTitle: "AI Architect, ML Architect", linkedinTitle: "AI Architect" },
      { id: "r5b", tdTitle: "AI Engineer, AI Developer", linkedinTitle: "AI Engineer" },
      { id: "r5c", tdTitle: "AI Scientist, ML Scientist", linkedinTitle: "AI Scientist" },
      { id: "r5d", tdTitle: "Chatbot Engineer, Conversational AI", linkedinTitle: "Conversational AI" },
      { id: "r5e", tdTitle: "Gen AI, LLM Engineer, LLM Developer", linkedinTitle: "Generative AI" },
      { id: "r5f", tdTitle: "Machine Learning Engineer, ML Developer", linkedinTitle: "ML Engineer" },
      { id: "r5g", tdTitle: "NLP Data Scientist, NLP Developer", linkedinTitle: "NLP Data Scientist" },
      { id: "r5h", tdTitle: "NLP Engineer", linkedinTitle: "NLP Engineer" },
    ],
  },
  {
    id: "fam-risk",
    name: "Model Risk",
    roles: [
      { id: "r6", tdTitle: "Model Governance Analyst", linkedinTitle: "Model Governance" },
      { id: "r6b", tdTitle: "Model Risk, Model Validation", linkedinTitle: "Model Risk" },
      { id: "r6c", tdTitle: "Model Risk Audit, Model Auditor", linkedinTitle: "Model Risk Audit" },
    ],
  },
  {
    id: "fam-eng",
    name: "Data Engineering",
    roles: [
      { id: "r7", tdTitle: "Data Architect, Data Manager", linkedinTitle: "Data Architect" },
      { id: "r7b", tdTitle: "Data Engineer, Data Warehouse", linkedinTitle: "Data Engineer" },
      { id: "r7c", tdTitle: "Data Governance, Data Risk", linkedinTitle: "Data Governance" },
      { id: "r7d", tdTitle: "Database Admin, DBA", linkedinTitle: "Database Administrator" },
    ],
  },
  {
    id: "fam-pm",
    name: "Product Management",
    roles: [
      { id: "r8", tdTitle: "Product Owner, Product Manager", linkedinTitle: "Product Manager" },
      { id: "r8b", tdTitle: "Project Owner, Project Manager", linkedinTitle: "Project Manager" },
    ],
  },
  {
    id: "fam-impl",
    name: "Implementation",
    roles: [
      { id: "r9", tdTitle: "Software Developer, Software Engineer", linkedinTitle: "Software Engineer" },
      { id: "r9b", tdTitle: "MLOps, ML Ops, AI Ops, AIOps", linkedinTitle: "MLOps Engineer" },
      { id: "r9c", tdTitle: "Backend, Back End Developer", linkedinTitle: "Backend Developer" },
      { id: "r9d", tdTitle: "Frontend, Web Developer", linkedinTitle: "Frontend Developer" },
      { id: "r9e", tdTitle: "Full Stack, Fullstack Developer", linkedinTitle: "Full Stack Developer" },
      { id: "r9f", tdTitle: "Cloud Developer, Cloud Architect", linkedinTitle: "Cloud Developer" },
      { id: "r9g", tdTitle: "DevOps, Dev Ops, Developer Ops", linkedinTitle: "DevOps" },
      { id: "r9h", tdTitle: "Software / Solutions Architect", linkedinTitle: "Software Architect" },
      { id: "r9i", tdTitle: "Technical Lead, Principal Engineer", linkedinTitle: "Technical Lead" },
    ],
  },
  {
    id: "fam-rec",
    name: "Recruitment",
    roles: [{ id: "r10", tdTitle: "Recruiter, Talent Acquisition", linkedinTitle: "Recruitment" }],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function App() {
  const [families, setFamilies] = useState(DEFAULT_FAMILIES);
  const [selectedFam, setSelectedFam] = useState({}); // famId -> true
  const [editFam, setEditFam] = useState({}); // famId -> true (edit mode)
  const [sender, setSender] = useState("Mateo");
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("evident-job-families", false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          if (Array.isArray(parsed) && parsed.length) setFamilies(parsed);
        }
      } catch (e) {
        // no saved data yet
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set("evident-job-families", JSON.stringify(families), false);
        setSaveState("saved");
      } catch (e) {
        setSaveState("idle");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [families, loaded]);

  function toggleFamSelected(id) {
    setSelectedFam((s) => ({ ...s, [id]: !s[id] }));
  }

  function updateRole(famId, roleId, field, value) {
    setFamilies((fs) =>
      fs.map((f) =>
        f.id !== famId ? f : { ...f, roles: f.roles.map((r) => (r.id === roleId ? { ...r, [field]: value } : r)) }
      )
    );
  }

  function addRole(famId) {
    const newId = uid();
    setFamilies((fs) =>
      fs.map((f) =>
        f.id !== famId ? f : { ...f, roles: [...f.roles, { id: newId, tdTitle: "New TD title", linkedinTitle: "New prescribed title" }] }
      )
    );
  }

  function removeRole(famId, roleId) {
    setFamilies((fs) => fs.map((f) => (f.id !== famId ? f : { ...f, roles: f.roles.filter((r) => r.id !== roleId) })));
  }

  function addFamily() {
    const newId = uid();
    const roleId = uid();
    setFamilies((fs) => [...fs, { id: newId, name: "New job family", roles: [{ id: roleId, tdTitle: "TD title", linkedinTitle: "Prescribed title" }] }]);
    setEditFam((s) => ({ ...s, [newId]: true }));
  }

  function removeFamily(famId) {
    setFamilies((fs) => fs.filter((f) => f.id !== famId));
    setSelectedFam((s) => {
      const next = { ...s };
      delete next[famId];
      return next;
    });
  }

  function renameFamily(famId, name) {
    setFamilies((fs) => fs.map((f) => (f.id === famId ? { ...f, name } : f)));
  }

  function resetDefaults() {
    setFamilies(DEFAULT_FAMILIES);
    setSelectedFam({});
  }

  const chosenFamilies = families.filter((f) => selectedFam[f.id]);
  const allRoles = chosenFamilies.flatMap((f) => f.roles);
  const needsBioLine = allRoles.some((r) => !AI_KEYWORD_RE.test(r.linkedinTitle));
  const message = buildMessage({ families: chosenFamilies, needsBioLine, sender, recipient });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div style={{ background: PAPER, minHeight: "100vh", color: INK, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: ${FOREST}; color: white; }
        input:focus, textarea:focus { outline: 2px solid ${FOREST}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${FOREST}; outline-offset: 2px; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "28px 32px 22px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: FOREST, fontWeight: 700, marginBottom: 6 }}>
            Evident AI Index — Talent Bucket
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>LinkedIn Update Message Generator</h1>
          <p style={{ fontSize: 14, color: "#5b5b5b", margin: "6px 0 0", maxWidth: 640 }}>
            Pick the job family or families. Every title under it gets listed automatically.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 32px 80px", display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 28 }}>
        {/* LEFT: family picker */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#444", margin: 0 }}>
              1. Job family
            </h2>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9a9a9a" }}>
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
              </span>
              <button onClick={resetDefaults} style={ghostBtnStyle}>
                <RotateCcw size={12} strokeWidth={2.2} /> Reset
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {families.map((fam) => {
              const isSel = !!selectedFam[fam.id];
              const isEditing = !!editFam[fam.id];
              return (
                <div
                  key={fam.id}
                  style={{
                    border: `1px solid ${isSel ? FOREST : LINE}`,
                    borderRadius: 4,
                    background: isSel ? "#F1F6F3" : "white",
                    transition: "border-color 120ms, background 120ms",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", padding: "12px 12px", cursor: "pointer" }}
                    onClick={() => toggleFamSelected(fam.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleFamSelected(fam.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ accentColor: FOREST, width: 16, height: 16, marginRight: 10 }}
                    />
                    {isEditing ? (
                      <input
                        value={fam.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => renameFamily(fam.id, e.target.value)}
                        style={{ ...inputStyle, fontWeight: 700, fontSize: 14, flex: 1 }}
                      />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{fam.name}</span>
                    )}
                    <span style={{ fontSize: 11.5, color: "#999", marginRight: 8 }}>{fam.roles.length} titles</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditFam((s) => ({ ...s, [fam.id]: !s[fam.id] }));
                      }}
                      style={iconBtnStyle}
                      aria-label="Edit family"
                    >
                      {isEditing ? <Check size={14} /> : <Pencil size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFamily(fam.id);
                      }}
                      style={iconBtnStyle}
                      aria-label="Delete family"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isEditing && (
                    <div style={{ borderTop: `1px solid ${LINE}`, padding: "8px 12px 12px" }}>
                      {fam.roles.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 22px",
                            gap: 8,
                            alignItems: "center",
                            padding: "5px 0",
                            borderBottom: `1px solid ${LINE}`,
                          }}
                        >
                          <input value={r.tdTitle} onChange={(e) => updateRole(fam.id, r.id, "tdTitle", e.target.value)} style={inputStyle} placeholder="Current TD title" />
                          <input value={r.linkedinTitle} onChange={(e) => updateRole(fam.id, r.id, "linkedinTitle", e.target.value)} style={inputStyle} placeholder="Prescribed LinkedIn title" />
                          <button onClick={() => removeRole(fam.id, r.id)} style={iconBtnStyle} aria-label="Remove role">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addRole(fam.id)} style={{ ...ghostBtnStyle, marginTop: 8 }}>
                        <Plus size={12} strokeWidth={2.2} /> Add title
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={addFamily} style={{ ...ghostBtnStyle, marginTop: 12 }}>
            <Plus size={12} strokeWidth={2.2} /> Add job family
          </button>
        </section>

        {/* RIGHT: generated message */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#444", margin: 0 }}>
              2. Message
            </h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ fontSize: 12, color: "#666", display: "flex", gap: 6, alignItems: "center" }}>
                Talking to
                <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="team" style={{ ...inputStyle, width: 100 }} />
              </label>
              <label style={{ fontSize: 12, color: "#666", display: "flex", gap: 6, alignItems: "center" }}>
                Sign as
                <input value={sender} onChange={(e) => setSender(e.target.value)} style={{ ...inputStyle, width: 80 }} />
              </label>
              <button onClick={handleCopy} style={primaryBtnStyle}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {chosenFamilies.length === 0 ? (
            <div style={{ border: `1px dashed ${LINE}`, borderRadius: 4, padding: 32, textAlign: "center", color: "#999", fontSize: 13, background: "white" }}>
              Select a job family on the left to generate the message.
            </div>
          ) : (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13.5,
                lineHeight: 1.65,
                background: "white",
                border: `1px solid ${LINE}`,
                borderRadius: 4,
                padding: "22px 24px",
                margin: 0,
              }}
            >
              {message}
            </pre>
          )}

          <div style={{ marginTop: 22 }}>
            <h3 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#444", marginBottom: 10 }}>
              Example
            </h3>
            <ExampleCard label="Title" before="Senior Manager, Analytics" after="Senior Manager, Data Scientist" />
            <ExampleCard label="Headline (optional)" before="Senior Manager at TD" after="Senior Manager, Data Science at TD" />
          </div>
        </section>
      </main>
    </div>
  );
}

function ExampleCard({ label, before, after }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 4, background: "white", padding: "10px 14px", marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: FOREST, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#888", textDecoration: "line-through", marginBottom: 3 }}>{before}</div>
      <div style={{ fontSize: 12.5, color: INK, fontWeight: 600 }}>{after}</div>
    </div>
  );
}

function buildMessage({ families, needsBioLine, sender, recipient }) {
  if (families.length === 0) return "";
  const greeting = recipient && recipient.trim() ? `Hi ${recipient.trim()},` : "Hi team,";

  const roleLines = [];
  families.forEach((f) => {
    f.roles.forEach((r) => {
      roleLines.push(`If your TD title looks like: ${r.tdTitle}`);
      roleLines.push(`You should use: ${r.linkedinTitle}`);
      roleLines.push("");
    });
  });

  const lines = [];
  lines.push("Subject: Quick LinkedIn update — Evident AI Index");
  lines.push("");
  lines.push(greeting);
  lines.push("");
  lines.push(
    "Following Sumee's email on the Evident AI Index: it scores banks on how well their AI talent shows up on LinkedIn. Titled correctly, our people count toward that score."
  );
  lines.push("");
  lines.push("Your team may have the following roles:");
  lines.push("");
  lines.push(roleLines.join("\n").trim());
  lines.push("");
  lines.push("Update your LinkedIn title to match.");
  lines.push("");
  lines.push("Also encouraged, not required: update your headline, About section, and experience bullets to describe your AI/ML work.");
  if (needsBioLine) {
    lines.push("If your new title doesn't include AI, ML, or NLP, this matters more. Work the word AI into your About section or a recent experience bullet.");
  }
  lines.push("");
  lines.push("Examples below.");
  lines.push("");
  lines.push("Details, poster, and live Q&A: https://bit.ly/EvidentIndexTD");
  lines.push("");
  lines.push("Questions? Reach out to me directly.");
  lines.push("");
  lines.push("Appreciate you taking the two minutes on this. It genuinely adds up.");
  lines.push("");
  lines.push("Thanks,");
  lines.push(sender);

  return lines.join("\n");
}

const inputStyle = {
  border: `1px solid ${LINE}`,
  borderRadius: 3,
  padding: "4px 7px",
  fontSize: 13,
  fontFamily: "inherit",
  background: PAPER,
};

const ghostBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  color: FOREST,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "4px 2px",
  fontWeight: 600,
};

const iconBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  color: "#999",
  cursor: "pointer",
  padding: 4,
  marginLeft: 2,
};

const primaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12.5,
  fontWeight: 700,
  color: "white",
  background: FOREST,
  border: "none",
  borderRadius: 4,
  padding: "7px 14px",
  cursor: "pointer",
};
