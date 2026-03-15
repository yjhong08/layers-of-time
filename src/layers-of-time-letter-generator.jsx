import { useState, useRef, useEffect } from "react";

const PALETTE = {
  cream: "#F5F0EB",
  beige: "#E8DDD3",
  apricot: "#F2C4A0",
  tileBlue: "#A8C4D4",
  deep: "#3A3028",
  warmGray: "#8C7E72",
  softWhite: "#FDFBF8",
};

const RECIPIENTS = [
  { id: "mom", label: "엄마 / Mom", emoji: "🤲" },
  { id: "dad", label: "아빠 / Dad", emoji: "🫂" },
  { id: "grandma", label: "할머니 / Grandma", emoji: "👵" },
  { id: "grandpa", label: "할아버지 / Grandpa", emoji: "👴" },
  { id: "sibling", label: "형제자매 / Sibling", emoji: "🤝" },
  { id: "other", label: "그 외 / Other", emoji: "💛" },
];

const SENTIMENTS = [
  { id: "thankyou", label: "고마워요 / Thank you", color: PALETTE.apricot },
  { id: "sorry", label: "미안해요 / I'm sorry", color: PALETTE.tileBlue },
  { id: "love", label: "사랑해요 / I love you", color: "#E8B4B8" },
  { id: "miss", label: "보고 싶어요 / I miss you", color: "#B8C4A8" },
];

/* ───── hand-drawn SVG decorations ───── */
const ScrubGlove = ({ size = 40, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={style}>
    <path
      d="M20 60 C20 30, 30 15, 40 12 C50 15, 60 30, 60 60 C60 68, 50 72, 40 72 C30 72, 20 68, 20 60Z"
      fill={PALETTE.apricot}
      stroke={PALETTE.deep}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M28 35 Q40 28, 52 35" stroke={PALETTE.deep} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M28 45 Q40 38, 52 45" stroke={PALETTE.deep} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M28 55 Q40 48, 52 55" stroke={PALETTE.deep} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const WaterDrop = ({ size = 24, color = PALETTE.tileBlue, style = {} }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 24 34" fill="none" style={style}>
    <path
      d="M12 2 C12 2, 2 16, 2 22 C2 28, 6 32, 12 32 C18 32, 22 28, 22 22 C22 16, 12 2, 12 2Z"
      fill={color}
      opacity="0.5"
      stroke={PALETTE.deep}
      strokeWidth="1"
    />
  </svg>
);

const HandsIcon = ({ size = 50, style = {} }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70" fill="none" style={style}>
    <path
      d="M15 50 C15 35, 25 20, 35 18 C38 17, 40 20, 40 25 L40 40"
      stroke={PALETTE.deep}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M85 50 C85 35, 75 20, 65 18 C62 17, 60 20, 60 25 L60 40"
      stroke={PALETTE.deep}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M40 40 C40 45, 45 50, 50 50 C55 50, 60 45, 60 40"
      stroke={PALETTE.apricot}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

/* ───── Loading animation ───── */
function LoadingScreen() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: 300, gap: 24,
    }}>
      <div style={{ position: "relative", width: 120, height: 80 }}>
        <div style={{
          position: "absolute", left: 0, top: 0,
          animation: "scrubMove 1.8s ease-in-out infinite",
        }}>
          <ScrubGlove size={60} />
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 10, right: 10, height: 4,
          background: PALETTE.beige, borderRadius: 2,
        }} />
      </div>
      <p style={{
        fontFamily: "'Nanum Pen Script', 'Caveat', cursive",
        fontSize: 22, color: PALETTE.deep, margin: 0,
      }}>
        마음을 담는 중{dots}
      </p>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: PALETTE.warmGray, margin: 0,
      }}>
        Putting your heart into words{dots}
      </p>
      <style>{`
        @keyframes scrubMove {
          0%, 100% { transform: translateX(0px) rotate(-5deg); }
          50% { transform: translateX(50px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

/* ───── Stationery letter display ───── */
function LetterDisplay({ letter, recipient, sentiment, onReset }) {
  const letterRef = useRef(null);

  const downloadAsText = () => {
    const blob = new Blob([letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layers-of-time-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      alert("편지가 복사되었습니다! / Letter copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = letter;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("편지가 복사되었습니다! / Letter copied!");
    }
  };

  const sentimentData = SENTIMENTS.find((s) => s.id === sentiment);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {/* Stationery */}
      <div
        ref={letterRef}
        style={{
          position: "relative",
          width: "100%", maxWidth: 520, minHeight: 400,
          background: `linear-gradient(165deg, ${PALETTE.softWhite} 0%, ${PALETTE.cream} 50%, ${PALETTE.beige}44 100%)`,
          borderRadius: 16,
          padding: "48px 36px 60px",
          boxShadow: `0 2px 20px ${PALETTE.beige}88, 0 8px 40px ${PALETTE.beige}44`,
          border: `1px solid ${PALETTE.beige}`,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* decorative elements */}
        <WaterDrop size={18} style={{ position: "absolute", top: 20, right: 30, opacity: 0.4 }} />
        <WaterDrop size={12} color={PALETTE.apricot} style={{ position: "absolute", top: 45, right: 55, opacity: 0.3 }} />
        <WaterDrop size={14} style={{ position: "absolute", bottom: 80, left: 25, opacity: 0.3 }} />
        <ScrubGlove size={30} style={{ position: "absolute", bottom: 20, right: 20, opacity: 0.15 }} />

        {/* top decorative line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${sentimentData?.color || PALETTE.apricot}, ${PALETTE.tileBlue}, ${PALETTE.apricot})`,
        }} />

        {/* header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <HandsIcon size={44} style={{ marginBottom: 8, opacity: 0.7 }} />
          <p style={{
            fontFamily: "'Nanum Pen Script', 'Caveat', cursive",
            fontSize: 14, color: PALETTE.warmGray, margin: 0, letterSpacing: 2,
          }}>
            LAYERS OF TIME
          </p>
        </div>

        {/* letter text */}
        <div style={{
          fontFamily: "'Nanum Pen Script', 'Caveat', cursive",
          fontSize: 19, lineHeight: 1.85, color: PALETTE.deep,
          whiteSpace: "pre-wrap", wordBreak: "keep-all",
        }}>
          {letter}
        </div>

        {/* bottom tagline */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, color: PALETTE.warmGray,
          textAlign: "right", marginTop: 32, marginBottom: 0,
          letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          #LayersOfTime — Scrub away the surface. Find your roots.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={copyToClipboard} style={btnStyle("primary")}>
          📋 복사하기 / Copy
        </button>
        <button onClick={downloadAsText} style={btnStyle("primary")}>
          📥 다운로드 / Download
        </button>
        <button onClick={onReset} style={btnStyle("secondary")}>
          ✏️ 다시 쓰기 / Write Another
        </button>
      </div>
    </div>
  );
}

function btnStyle(variant) {
  const base = {
    padding: "12px 24px", borderRadius: 10, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
    border: "none", fontWeight: 600, transition: "all 0.2s ease",
  };
  if (variant === "primary") {
    return { ...base, background: PALETTE.deep, color: PALETTE.cream };
  }
  return { ...base, background: "transparent", color: PALETTE.deep, border: `1.5px solid ${PALETTE.beige}` };
}

/* ───── Main App ───── */
export default function LayersOfTimeLetterGenerator() {
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [memory, setMemory] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep(0); setRecipient(""); setMemory(""); setSentiment("");
    setLetter(""); setError("");
  };

  const generateLetter = async () => {
    setLoading(true);
    console.log("API KEY:", import.meta.env.VITE_ANTHROPIC_API_KEY);

    setError("");

    const recipientLabel = RECIPIENTS.find((r) => r.id === recipient)?.label || recipient;
    const sentimentLabel = SENTIMENTS.find((s) => s.id === sentiment)?.label || sentiment;

    const prompt = `You are a warm, heartfelt letter writer for the "Layers of Time" campaign (#LayersOfTime). This campaign is inspired by Korean jjimjilbang (communal bathhouse) culture, where families scrub each other's backs as an act of love. The metaphor: when you peel back the layers of the present, you find your family's stories underneath.

Write a personal letter based on these inputs:
- Recipient: ${recipientLabel}
- A shared memory: "${memory}"
- What the user wants to express: ${sentimentLabel}

Guidelines:
- Write in a warm, personal, intimate tone — as if the user is speaking from the heart
- Keep it 150–200 words
- Reference the specific memory naturally — make it feel personal, not generic
- Subtly weave in the theme of layers / time / uncovering what's underneath
- End with a quiet, emotionally resonant closing line
- Write primarily in English, but if the recipient is a Korean family member (엄마, 아빠, 할머니, 할아버지), you may naturally include 1-2 Korean terms of endearment or phrases
- Do NOT include a subject line or "Dear X" header — start directly with the letter body
- Do NOT include any signatures at the end — end with the last emotional line`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
      },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content
        ?.filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n") || "";

      if (!text) throw new Error("Empty response");

      setLetter(text.trim());
      setStep(4);
    } catch (err) {
      console.error(err);
      setError("편지 생성에 문제가 있었어요. 다시 시도해주세요. / Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ───── STEP RENDERERS ───── */

  const renderIntro = () => (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <ScrubGlove size={64} style={{ margin: "0 auto 16px", display: "block" }} />
      <h1 style={{
        fontFamily: "'Nanum Pen Script', 'Caveat', cursive",
        fontSize: 36, color: PALETTE.deep, margin: "0 0 8px", fontWeight: 400,
      }}>
        Layers of Time
      </h1>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: PALETTE.warmGray, letterSpacing: 2, margin: "0 0 24px",
        textTransform: "uppercase",
      }}>
        #LayersOfTime
      </p>
      <p style={{
        fontFamily: "'Nanum Pen Script', 'Caveat', cursive",
        fontSize: 20, color: PALETTE.deep, margin: "0 0 8px", lineHeight: 1.6,
      }}>
        때를 밀면 밀수록, 시간이 보여요.
      </p>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, color: PALETTE.warmGray, margin: "0 0 32px", lineHeight: 1.6,
      }}>
        Scrub away the surface. Find your roots.<br />
        Write a letter to someone you love.
      </p>
      <button onClick={() => setStep(1)} style={{
        ...btnStyle("primary"),
        padding: "14px 40px", fontSize: 16,
      }}>
        편지 쓰기 시작 / Start Writing
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <StepHeader number={1} question="누구에게 쓸 편지인가요?" sub="Who do you want to write to?" />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 10, margin: "20px 0",
      }}>
        {RECIPIENTS.map((r) => (
          <button
            key={r.id}
            onClick={() => { setRecipient(r.id); setStep(2); }}
            style={{
              padding: "16px 12px", borderRadius: 12,
              background: recipient === r.id ? PALETTE.apricot + "44" : PALETTE.softWhite,
              border: `1.5px solid ${recipient === r.id ? PALETTE.apricot : PALETTE.beige}`,
              cursor: "pointer", textAlign: "center", transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{r.emoji}</span>
            <span style={{ fontSize: 13, color: PALETTE.deep }}>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <StepHeader
        number={2}
        question="함께한 기억이 있나요?"
        sub="What's a memory you share with them?"
      />
      <textarea
        value={memory}
        onChange={(e) => setMemory(e.target.value)}
        placeholder="예: 매일 학교 끝나면 엄마가 밥 해주셨어요 / e.g. She always cooked for me after school"
        style={{
          width: "100%", minHeight: 120, padding: 16, borderRadius: 12,
          border: `1.5px solid ${PALETTE.beige}`, background: PALETTE.softWhite,
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.deep,
          resize: "vertical", outline: "none", lineHeight: 1.6,
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button onClick={() => setStep(1)} style={btnStyle("secondary")}>← 이전</button>
        <button
          onClick={() => memory.trim() && setStep(3)}
          disabled={!memory.trim()}
          style={{
            ...btnStyle("primary"),
            opacity: memory.trim() ? 1 : 0.4,
          }}
        >
          다음 → Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <StepHeader number={3} question="어떤 마음을 전하고 싶나요?" sub="What do you want to say?" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "20px 0" }}>
        {SENTIMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSentiment(s.id)}
            style={{
              padding: "18px 12px", borderRadius: 12,
              background: sentiment === s.id ? s.color + "44" : PALETTE.softWhite,
              border: `1.5px solid ${sentiment === s.id ? s.color : PALETTE.beige}`,
              cursor: "pointer", textAlign: "center", transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: PALETTE.deep,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button onClick={() => setStep(2)} style={btnStyle("secondary")}>← 이전</button>
        <button
          onClick={() => { if (sentiment) generateLetter(); }}
          disabled={!sentiment}
          style={{
            ...btnStyle("primary"),
            opacity: sentiment ? 1 : 0.4,
            padding: "12px 32px",
          }}
        >
          편지 만들기 ✨ / Generate Letter
        </button>
      </div>
    </div>
  );

  /* ───── LAYOUT ───── */
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${PALETTE.cream} 0%, ${PALETTE.beige}55 100%)`,
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px 16px",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=DM+Sans:wght@400;500;600&family=Nanum+Pen+Script&display=swap"
        rel="stylesheet"
      />
      <div style={{
        maxWidth: 560, margin: "0 auto",
        background: `${PALETTE.softWhite}CC`,
        borderRadius: 20,
        padding: "32px 28px",
        boxShadow: `0 4px 30px ${PALETTE.beige}66`,
        backdropFilter: "blur(10px)",
        border: `1px solid ${PALETTE.beige}88`,
      }}>
        {/* Progress bar */}
        {step >= 1 && step <= 3 && (
          <div style={{
            display: "flex", gap: 6, marginBottom: 28,
          }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: s <= step ? PALETTE.apricot : PALETTE.beige,
                transition: "background 0.3s ease",
              }} />
            ))}
          </div>
        )}

        {step === 0 && renderIntro()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {loading && <LoadingScreen />}
        {error && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p style={{ color: "#C4564A", fontSize: 14 }}>{error}</p>
            <button onClick={() => generateLetter()} style={btnStyle("primary")}>
              다시 시도 / Retry
            </button>
          </div>
        )}
        {step === 4 && !loading && (
          <LetterDisplay
            letter={letter}
            recipient={recipient}
            sentiment={sentiment}
            onReset={reset}
          />
        )}
      </div>

      {/* Footer */}
      <p style={{
        textAlign: "center", fontSize: 11, color: PALETTE.warmGray,
        marginTop: 24, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1,
      }}>
        LAYERS OF TIME — CT&D AI HACKATHON 2026
      </p>
    </div>
  );
}

function StepHeader({ number, question, sub }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{
        display: "inline-block", fontFamily: "'DM Sans', sans-serif",
        fontSize: 11, color: PALETTE.warmGray, letterSpacing: 2,
        textTransform: "uppercase", marginBottom: 6,
      }}>
        Step {number} / 3
      </span>
      <h2 style={{
        fontFamily: "'Nanum Pen Script', 'Caveat', cursive",
        fontSize: 26, color: PALETTE.deep, margin: "0 0 4px", fontWeight: 400,
      }}>
        {question}
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: PALETTE.warmGray, margin: 0,
      }}>
        {sub}
      </p>
    </div>
  );
}
