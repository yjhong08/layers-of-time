import { useState, useRef, useEffect } from "react";

const PALETTE = {
  cream: "#F5F0EB", beige: "#E8DDD3", apricot: "#F2C4A0", tileBlue: "#A8C4D4",
  deep: "#3A3028", warmGray: "#8C7E72", softWhite: "#FDFBF8",
};

/*
  Stationery size: 540 x 400 px (at 96dpi = 5.63 inches wide x 4.17 inches tall)
  Landscape, compact fit for ~100 words single paragraph.
*/
const STATIONERY_W = 540;
const STATIONERY_H = 400;

const RECIPIENTS = [
  { id: "mom", label: "Mom", emoji: "👩" },
  { id: "dad", label: "Dad", emoji: "👨" },
  { id: "grandma", label: "Grandma", emoji: "👵" },
  { id: "grandpa", label: "Grandpa", emoji: "👴" },
  { id: "sibling", label: "Sibling", emoji: "🤝" },
  { id: "other", label: "Other", emoji: "💛" },
];

const SENTIMENTS = [
  { id: "thankyou", label: "Thank You", color: "#F2C4A0" },
  { id: "sorry", label: "Sorry", color: "#A8C4D4" },
  { id: "love", label: "Love You", color: "#E8B4B8" },
  { id: "miss", label: "Miss You", color: "#B8C4A8" },
];

const BG_COLORS = [
  { id: "orange", label: "Peach", color: "#FDEBD3" },
  { id: "yellow", label: "Butter", color: "#FDF5D6" },
  { id: "blue", label: "Sky", color: "#DAE8EF" },
  { id: "brown", label: "Latte", color: "#EDE4DA" },
];

const FRAMES = [
  { id: "minimal", label: "Clean", render: () => (
    <div style={{ position: "absolute", inset: 16, border: `1px solid ${PALETTE.warmGray}33`, borderRadius: 8, pointerEvents: "none" }} />
  )},
  { id: "corner", label: "Corner", render: () => (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg style={{ position: "absolute", top: 16, left: 16 }} width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M2 26 L2 2 L26 2" stroke={PALETTE.deep} strokeWidth="2" strokeLinecap="round" opacity="0.3" /></svg>
      <svg style={{ position: "absolute", top: 16, right: 16 }} width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M2 2 L26 2 L26 26" stroke={PALETTE.deep} strokeWidth="2" strokeLinecap="round" opacity="0.3" /></svg>
      <svg style={{ position: "absolute", bottom: 16, left: 16 }} width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M2 2 L2 26 L26 26" stroke={PALETTE.deep} strokeWidth="2" strokeLinecap="round" opacity="0.3" /></svg>
      <svg style={{ position: "absolute", bottom: 16, right: 16 }} width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M2 26 L26 26 L26 2" stroke={PALETTE.deep} strokeWidth="2" strokeLinecap="round" opacity="0.3" /></svg>
    </div>
  )},
  { id: "dots", label: "Dotted", render: () => (
    <div style={{ position: "absolute", inset: 14, border: `1.5px dashed ${PALETTE.warmGray}55`, borderRadius: 10, pointerEvents: "none" }} />
  )},
  { id: "double", label: "Double", render: () => (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 12, border: `1px solid ${PALETTE.warmGray}33`, borderRadius: 8 }} />
      <div style={{ position: "absolute", inset: 18, border: `1px solid ${PALETTE.warmGray}22`, borderRadius: 6 }} />
    </div>
  )},
];

function LoadingScreen() {
  const [dots, setDots] = useState("");
  useEffect(() => { const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500); return () => clearInterval(iv); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 250, gap: 20 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${PALETTE.beige}`, borderTopColor: PALETTE.apricot, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: PALETTE.warmGray, margin: 0 }}>Writing your letter{dots}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

async function loadHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas;
  return new Promise((resolve, reject) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload = () => resolve(window.html2canvas); s.onerror = () => reject(new Error("Failed")); document.head.appendChild(s); });
}
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  return new Promise((resolve, reject) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; s.onload = () => resolve(window.jspdf.jsPDF); s.onerror = () => reject(new Error("Failed")); document.head.appendChild(s); });
}

function LetterDisplay({ letter, bgColor, frameId, senderName, onReset }) {
  const letterRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState("");
  const frame = FRAMES.find((f) => f.id === frameId);

  const capture = async (scale = 2) => {
    const html2canvas = await loadHtml2Canvas();
    await document.fonts.ready;
    return html2canvas(letterRef.current, { scale, useCORS: true, backgroundColor: null, logging: false });
  };

  const saveImage = async () => {
    setDownloading(true); setMsg("Saving...");
    try { const c = await capture(3); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = "layers-of-time-letter.png"; a.click(); setMsg("Done ✓"); }
    catch { setMsg("Error"); } finally { setDownloading(false); setTimeout(() => setMsg(""), 2000); }
  };

  const savePDF = async () => {
    setDownloading(true); setMsg("Creating PDF...");
    try {
      const [c, JsPDF] = await Promise.all([capture(2), loadJsPDF()]);
      const pw = 210, iw = pw - 30, ih = (c.height / c.width) * iw;
      const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: [pw, Math.max(ih + 40, 297)] });
      pdf.setFillColor(245, 240, 235); pdf.rect(0, 0, pw, Math.max(ih + 40, 297), "F");
      pdf.addImage(c.toDataURL("image/png"), "PNG", 15, 20, iw, ih);
      pdf.save("layers-of-time-letter.pdf"); setMsg("Done ✓");
    } catch { setMsg("Error"); } finally { setDownloading(false); setTimeout(() => setMsg(""), 2000); }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(letter); } catch { const t = document.createElement("textarea"); t.value = letter; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
    setMsg("Copied!"); setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* Stationery — fixed size: 480×640px (5" × 6.67") */}
      <div ref={letterRef} style={{
        position: "relative", width: STATIONERY_W, height: STATIONERY_H,
        background: bgColor, borderRadius: 16,
        padding: "36px 36px 32px", boxSizing: "border-box",
        boxShadow: `0 4px 24px ${PALETTE.beige}66`,
        display: "flex", flexDirection: "column",
      }}>
        {frame && frame.render()}

        {/* Header */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: PALETTE.warmGray, margin: "0 0 14px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, textAlign: "center" }}>#LayersOfTime</p>

        {/* Letter text */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, lineHeight: 1.85, color: PALETTE.deep, whiteSpace: "pre-wrap", flex: 1 }}>{letter}</div>

        {/* Sender name — fixed bottom right */}
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: PALETTE.deep, textAlign: "right", margin: 0, opacity: 0.7 }}>
          — {senderName || "Anonymous"}
        </p>
      </div>

      {msg && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: PALETTE.warmGray, margin: 0 }}>{msg}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={saveImage} disabled={downloading} style={{ ...btnStyle("primary"), opacity: downloading ? 0.5 : 1 }}>Save Image</button>
        <button onClick={savePDF} disabled={downloading} style={{ ...btnStyle("primary"), opacity: downloading ? 0.5 : 1 }}>Save PDF</button>
        <button onClick={copy} disabled={downloading} style={btnStyle("secondary")}>Copy Text</button>
        <button onClick={onReset} style={btnStyle("secondary")}>Write Another</button>
      </div>
    </div>
  );
}

function btnStyle(variant) {
  const base = { padding: "12px 24px", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: "none", fontWeight: 600, transition: "all 0.2s ease" };
  if (variant === "primary") return { ...base, background: PALETTE.deep, color: PALETTE.cream };
  return { ...base, background: "transparent", color: PALETTE.deep, border: `1.5px solid ${PALETTE.beige}` };
}

export default function LayersOfTimeLetterGenerator() {
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [customRecipient, setCustomRecipient] = useState("");
  const [memory, setMemory] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [senderName, setSenderName] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0].color);
  const [frameId, setFrameId] = useState(FRAMES[0].id);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const TOTAL_STEPS = 6;

  const reset = () => { setStep(0); setRecipient(""); setCustomRecipient(""); setMemory(""); setSentiment(""); setSenderName(""); setBgColor(BG_COLORS[0].color); setFrameId(FRAMES[0].id); setLetter(""); setError(""); };

  const generateLetter = async () => {
    setLoading(true); setError("");
    const recipientLabel = recipient === "other" ? (customRecipient || "Someone") : (RECIPIENTS.find((r) => r.id === recipient)?.label || recipient);
    const sentimentLabel = SENTIMENTS.find((s) => s.id === sentiment)?.label || sentiment;
    const prompt = `Write a short personal letter (around 100 words) as ONE single paragraph based on these inputs:
- To: ${recipientLabel}
- A shared memory or thought: "${memory}"
- What the writer wants to say: ${sentimentLabel}

Rules:
- Write as ONE continuous paragraph. No line breaks, no separate closing lines.
- Write in English only. If the memory is in another language, translate it naturally.
- Keep it plain and sincere — no dramatic or overly emotional language. Do not embellish.
- Use the sentiment word ("${sentimentLabel}") at most once.
- ONLY use what the user provided. Do NOT add details, stories, or scenarios the user did not mention. If the memory is short or vague, keep the letter equally simple.
- Do NOT add generic filler like "I hope you are doing well" or "take care of yourself."
- Write as if a real person is speaking — natural, understated, not trying too hard.
- Do NOT start with "Dear X" or any header.
- Do NOT end with a signature, sign-off, or name.
- The paragraph should end naturally without a forced emotional closing.`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
      if (!text) throw new Error("Empty response");
      setLetter(text.trim()); setStep(7);
    } catch (err) { console.error(err); setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${PALETTE.cream} 0%, ${PALETTE.beige}55 100%)`, fontFamily: "'DM Sans', sans-serif", padding: "24px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 560, margin: "0 auto", background: `${PALETTE.softWhite}CC`, borderRadius: 20, padding: "32px 28px", boxShadow: `0 4px 30px ${PALETTE.beige}66`, backdropFilter: "blur(10px)", border: `1px solid ${PALETTE.beige}88` }}>

        {step >= 1 && step <= TOTAL_STEPS && (
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i + 1 <= step ? PALETTE.apricot : PALETTE.beige, transition: "background 0.3s ease" }} />
            ))}
          </div>
        )}

        {step === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: PALETTE.warmGray, letterSpacing: 3, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>#LayersOfTime</p>
            <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: 36, color: PALETTE.deep, margin: "0 0 20px", fontWeight: 400 }}>Layers of Time</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.warmGray, margin: "0 0 32px", lineHeight: 1.7 }}>Write a letter to someone you care about.<br />Say what you haven't said yet.</p>
            <button onClick={() => setStep(1)} style={{ ...btnStyle("primary"), padding: "14px 40px", fontSize: 16 }}>Start Writing</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <StepHeader step={1} total={TOTAL_STEPS} question="Who is this letter for?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "20px 0" }}>
              {RECIPIENTS.map((r) => (
                <button key={r.id} onClick={() => { setRecipient(r.id); if (r.id === "other") { setStep(1.5); } else { setStep(2); } }} style={{ padding: "16px 8px", borderRadius: 12, background: recipient === r.id ? PALETTE.apricot + "44" : PALETTE.softWhite, border: `1.5px solid ${recipient === r.id ? PALETTE.apricot : PALETTE.beige}`, cursor: "pointer", textAlign: "center", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
                  <span style={{ fontSize: 22, display: "block", marginBottom: 4 }}>{r.emoji}</span>
                  <span style={{ fontSize: 13, color: PALETTE.deep }}>{r.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} style={btnStyle("secondary")}>← Back</button>
          </div>
        )}

        {/* Step 1.5: Custom recipient name */}
        {step === 1.5 && (
          <div>
            <StepHeader step={1} total={TOTAL_STEPS} question="Who are you writing to?" />
            <input value={customRecipient} onChange={(e) => setCustomRecipient(e.target.value)} placeholder="e.g. Uncle James, Best friend"
              style={{ width: "100%", padding: 16, borderRadius: 12, border: `1.5px solid ${PALETTE.beige}`, background: PALETTE.softWhite, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.deep, outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(1)} style={btnStyle("secondary")}>← Back</button>
              <button onClick={() => customRecipient.trim() && setStep(2)} disabled={!customRecipient.trim()} style={{ ...btnStyle("primary"), opacity: customRecipient.trim() ? 1 : 0.4 }}>Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeader step={2} total={TOTAL_STEPS} question="What's a memory you share?" />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: PALETTE.warmGray, margin: "0 0 12px", lineHeight: 1.5 }}>
              The more detail you share, the more personal your letter will be.
            </p>
            <textarea value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="e.g. She always cooked for me after school"
              style={{ width: "100%", minHeight: 100, padding: 16, borderRadius: 12, border: `1.5px solid ${PALETTE.beige}`, background: PALETTE.softWhite, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.deep, resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(1)} style={btnStyle("secondary")}>← Back</button>
              <button onClick={() => memory.trim() && setStep(3)} disabled={!memory.trim()} style={{ ...btnStyle("primary"), opacity: memory.trim() ? 1 : 0.4 }}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepHeader step={3} total={TOTAL_STEPS} question="What do you want to say?" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "20px 0" }}>
              {SENTIMENTS.map((s) => (
                <button key={s.id} onClick={() => { setSentiment(s.id); setStep(4); }} style={{ padding: "18px 12px", borderRadius: 12, background: sentiment === s.id ? s.color + "44" : PALETTE.softWhite, border: `1.5px solid ${sentiment === s.id ? s.color : PALETTE.beige}`, cursor: "pointer", textAlign: "center", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.deep, fontWeight: 500 }}>
                  {s.label}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={btnStyle("secondary")}>← Back</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <StepHeader step={4} total={TOTAL_STEPS} question="What's your name?" />
            <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. Alex"
              style={{ width: "100%", padding: 16, borderRadius: 12, border: `1.5px solid ${PALETTE.beige}`, background: PALETTE.softWhite, fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.deep, outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(3)} style={btnStyle("secondary")}>← Back</button>
              <button onClick={() => senderName.trim() && setStep(5)} disabled={!senderName.trim()} style={{ ...btnStyle("primary"), opacity: senderName.trim() ? 1 : 0.4 }}>Next →</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <StepHeader step={5} total={TOTAL_STEPS} question="Pick a background color" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "20px 0" }}>
              {BG_COLORS.map((bg) => (
                <button key={bg.id} onClick={() => setBgColor(bg.color)} style={{ padding: 0, borderRadius: 12, height: 72, cursor: "pointer", transition: "all 0.2s", background: bg.color, border: bgColor === bg.color ? `3px solid ${PALETTE.deep}` : `2px solid ${PALETTE.beige}`, position: "relative" }}>
                  <span style={{ position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: PALETTE.warmGray, fontWeight: 500 }}>{bg.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(4)} style={btnStyle("secondary")}>← Back</button>
              <button onClick={() => setStep(6)} style={btnStyle("primary")}>Next →</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <StepHeader step={6} total={TOTAL_STEPS} question="Choose a frame style" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "20px 0" }}>
              {FRAMES.map((f) => (
                <button key={f.id} onClick={() => setFrameId(f.id)} style={{ padding: 0, borderRadius: 12, height: 72, cursor: "pointer", transition: "all 0.2s", background: bgColor, position: "relative", overflow: "hidden", border: frameId === f.id ? `3px solid ${PALETTE.deep}` : `2px solid ${PALETTE.beige}` }}>
                  {f.render()}
                  <span style={{ position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: PALETTE.warmGray, fontWeight: 500, zIndex: 1 }}>{f.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setStep(5)} style={btnStyle("secondary")}>← Back</button>
              <button onClick={generateLetter} style={{ ...btnStyle("primary"), padding: "12px 32px" }}>Generate Letter ✨</button>
            </div>
          </div>
        )}

        {loading && <LoadingScreen />}
        {error && <div style={{ textAlign: "center", padding: 20 }}><p style={{ color: "#C4564A", fontSize: 14 }}>{error}</p><button onClick={generateLetter} style={btnStyle("primary")}>Retry</button></div>}
        {step === 7 && !loading && <LetterDisplay letter={letter} bgColor={bgColor} frameId={frameId} senderName={senderName} onReset={reset} />}
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: PALETTE.warmGray, marginTop: 24, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>LAYERS OF TIME — CT&D AI HACKATHON 2026</p>
    </div>
  );
}

function StepHeader({ step, total, question }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{ display: "inline-block", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: PALETTE.warmGray, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Step {step} / {total}</span>
      <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: PALETTE.deep, margin: "0 0 4px", fontWeight: 400 }}>{question}</h2>
    </div>
  );
}
