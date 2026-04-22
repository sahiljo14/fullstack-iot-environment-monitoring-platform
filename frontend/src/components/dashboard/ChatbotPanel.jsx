import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot } from "lucide-react";
import { sendChatMessage } from "@/lib/api";

const QUICK_ACTIONS = [
  "Summarize room",
  "Compare indoor/outdoor",
  "Air quality report",
  "Daily summary",
];

export function ChatbotPanel({ latest, outdoor }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I can analyze your room environment, compare indoor vs outdoor conditions, and provide recommendations. Try asking me something or use the quick actions below.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    try {
      const { reply } = await sendChatMessage(t, { indoor: latest, outdoor });
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Couldn't connect to AI. Try again." }]);
    }
  };

  return (
    <div className="es-card es-fade-in" style={{ display: "flex", flexDirection: "column", height: 480 }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
        <span
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: "var(--accent-soft)", color: "var(--accent-color)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Bot size={14} />
        </span>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>EnviroAI Assistant</h3>
      </div>

      <div ref={scrollRef} className="es-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <span
                style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: "var(--accent-color)", color: "white",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  marginRight: 8, flexShrink: 0,
                }}
              >
                <Bot size={12} />
              </span>
            )}
            <div
              style={{
                maxWidth: "85%",
                fontSize: 13,
                lineHeight: 1.5,
                padding: "10px 14px",
                borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                background: m.role === "user" ? "var(--accent-color)" : "var(--surface-alt)",
                color: m.role === "user" ? "white" : "var(--text-primary)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="es-no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0", marginTop: 8 }}>
        {QUICK_ACTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            style={{
              fontSize: 12,
              padding: "6px 14px",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              color: "var(--text-secondary)",
              background: "var(--surface)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        style={{ display: "flex", gap: 8, marginTop: 4 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your environment..."
          style={{
            flex: 1,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 14,
            background: "var(--surface)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          aria-label="Send"
          style={{
            width: 40, height: 40, borderRadius: 8,
            background: "var(--accent-color)", color: "white",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer", transition: "filter 0.15s ease",
          }}
        >
          <ArrowUp size={16} />
        </button>
      </form>
    </div>
  );
}
