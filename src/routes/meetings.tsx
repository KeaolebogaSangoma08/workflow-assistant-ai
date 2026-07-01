import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileText, Mic, Square, ClipboardPaste } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { OutputPanel } from "@/components/OutputPanel";
import { Placeholder } from "@/routes/email";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGenerate } from "@/lib/useGenerate";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — AI Workplace Assistant" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { t } = useLanguage();
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);
  const baseRef = useRef("");
  const { loading, output, setOutput, generate } = useGenerate("summaries");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    baseRef.current = transcript ? transcript + " " : "";
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += txt + " ";
        else interim += txt;
      }
      if (final) baseRef.current += final;
      setTranscript(baseRef.current + interim);
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") toast.error("Microphone access denied.");
    };
    rec.onend = () => { if (recRef.current) rec.start(); };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    toast.success("Recording started — speak now");
  };

  const stop = () => {
    const rec = recRef.current;
    recRef.current = null;
    rec?.stop();
    setRecording(false);
  };

  const summarize = () => {
    if (!transcript.trim()) { toast.error("Add a transcript first"); return; }
    generate(
      "You are a meeting notes expert. Summarize the transcript into these markdown sections with '## ' headers: Executive Summary, Key Decisions, Risks, Action Items (with owners if mentioned), Next Steps.",
      `Meeting transcript:\n\n${transcript}`,
    );
  };

  return (
    <ToolShell title={t("meetingSummarizer")} description="Record a live meeting or paste a transcript to get a structured summary." icon={FileText}>
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <Tabs defaultValue="record">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record"><Mic className="mr-1.5 size-4" /> Record</TabsTrigger>
              <TabsTrigger value="paste"><ClipboardPaste className="mr-1.5 size-4" /> Paste</TabsTrigger>
            </TabsList>
            <TabsContent value="record" className="mt-4 space-y-3">
              {supported ? (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-6">
                  <button
                    onClick={recording ? stop : start}
                    className={`flex size-20 items-center justify-center rounded-full text-primary-foreground shadow-glow transition ${recording ? "bg-destructive animate-pulse" : "gradient-primary"}`}
                  >
                    {recording ? <Square className="size-8" /> : <Mic className="size-8" />}
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {recording ? "Recording… tap to stop" : "Tap to record the meeting you're in"}
                  </p>
                </div>
              ) : (
                <p className="rounded-lg bg-warning/10 p-3 text-sm text-muted-foreground">
                  Live recording isn't supported in this browser. Use Chrome, or paste your transcript instead.
                </p>
              )}
            </TabsContent>
            <TabsContent value="paste" className="mt-4">
              <p className="mb-2 text-sm text-muted-foreground">For online meetings, copy the transcript and paste it below.</p>
            </TabsContent>
          </Tabs>

          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Live transcript appears here as you record, or paste a meeting transcript…"
            className="min-h-56"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTranscript("")} disabled={!transcript}>Clear</Button>
            <Button className="flex-1 gradient-primary text-primary-foreground" onClick={summarize} disabled={loading}>
              {loading ? t("generating") : "Summarize Meeting"}
            </Button>
          </div>
        </div>

        {output ? (
          <OutputPanel content={output} onChange={setOutput} onRegenerate={summarize} loading={loading} title="Meeting Summary" type="Meeting Summary" />
        ) : (
          <Placeholder text="Your meeting summary will appear here." />
        )}
      </div>
    </ToolShell>
  );
}
