import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Send, Mic, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatAI } from "@/lib/ai.functions";
import { useLanguage } from "@/lib/i18n";
import { bumpStat } from "@/lib/store";

export const Route = createFileRoute("/chatbot")({
  head: () => ({ meta: [{ title: "AI Chatbot — AI Workplace Assistant" }] }),
  component: ChatbotPage,
});

type Msg = { role: "user" | "assistant"; content: string };
const SUGGESTIONS = [
  "Draft a meeting invitation for Friday",
  "Summarize the key trends in remote work",
  "Help me prioritize my tasks for today",
  "Write a follow-up email after a client call",
];

function ChatbotPage() {
  const { t, lang } = useLanguage();
  const call = useServerFn(chatAI);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat_history");
    if (saved) setMessages(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages.slice(-50)));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await call({ data: { messages: next, language: lang } });
      setMessages([...next, { role: "assistant", content: res.text }]);
      bumpStat("aiRequests");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported in this browser"); return; }
    if (recording) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.interimResults = true;
    rec.onresult = (e: any) => setInput(Array.from(e.results).map((r: any) => r[0].transcript).join(""));
    rec.onend = () => { setRecording(false); recRef.current = null; };
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow"><MessagesSquare className="size-6" /></div>
          <div><h1 className="text-2xl font-bold">{t("chatbot")}</h1><p className="text-sm text-muted-foreground">Your always-on AI workplace assistant.</p></div>
        </div>
        {messages.length > 0 && <Button variant="ghost" size="sm" onClick={() => setMessages([])}><Trash2 className="size-4" /> Clear</Button>}
      </div>
      <ResponsibleAINotice />

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border bg-card p-4 shadow-soft">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Sparkles className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">Ask me anything, or try a suggestion:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-lg border bg-background px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-muted/40">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "gradient-primary text-primary-foreground" : "bg-muted"}`}>
                {m.role === "user" ? <p className="text-sm whitespace-pre-wrap">{m.content}</p> : <Markdown content={m.content} />}
              </div>
            </div>
          ))
        )}
        {loading && <div className="flex justify-start"><div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">Thinking…</div></div>}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Type a message…"
          className="max-h-32 min-h-11 flex-1 resize-none"
        />
        <Button variant={recording ? "destructive" : "outline"} size="icon" onClick={toggleVoice} className="size-11 shrink-0">
          <Mic className="size-5" />
        </Button>
        <Button className="size-11 shrink-0 gradient-primary text-primary-foreground" size="icon" onClick={() => send(input)} disabled={loading}>
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  );
}
