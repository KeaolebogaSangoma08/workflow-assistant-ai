import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Workflow, Play, Check, Loader2, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { ToolShell } from "@/components/ToolShell";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runAI } from "@/lib/ai.functions";
import { useLanguage } from "@/lib/i18n";
import { bumpStat } from "@/lib/store";

export const Route = createFileRoute("/workflow")({
  head: () => ({ meta: [{ title: "Workflow Automation — AI Workplace Assistant" }] }),
  component: WorkflowPage,
});

type Step = { name: string; system: string; prompt: (input: string, prev: string) => string };

const WORKFLOWS: Record<string, { label: string; desc: string; placeholder: string; steps: Step[] }> = {
  meeting: {
    label: "Meeting Workflow",
    desc: "Transcript → Summary → Action Items → Follow-up Email",
    placeholder: "Paste your meeting transcript…",
    steps: [
      { name: "Summary", system: "Summarize the meeting concisely.", prompt: (i) => `Transcript:\n${i}` },
      { name: "Action Items", system: "Extract action items as a checklist with owners and due dates.", prompt: (_, p) => `From this summary, list action items:\n${p}` },
      { name: "Follow-up Email", system: "Write a professional follow-up email recapping the meeting and next steps.", prompt: (_, p) => `Write a follow-up email based on:\n${p}` },
    ],
  },
  research: {
    label: "Research Workflow",
    desc: "Topic → Research Summary → Report → Presentation Outline → Speaker Notes",
    placeholder: "Enter a research topic…",
    steps: [
      { name: "Research Summary", system: "Provide a concise research summary of the topic.", prompt: (i) => `Topic: ${i}` },
      { name: "Full Report", system: "Write a structured report with sections.", prompt: (i, p) => `Expand into a full report. Topic: ${i}\nSummary:\n${p}` },
      { name: "Presentation Outline", system: "Create a slide-by-slide presentation outline.", prompt: (_, p) => `Turn this report into a presentation outline:\n${p}` },
      { name: "Speaker Notes", system: "Write speaker notes for each slide.", prompt: (_, p) => `Write speaker notes for this outline:\n${p}` },
    ],
  },
  support: {
    label: "Customer Service Workflow",
    desc: "Complaint → Analysis → Response Draft → Task Assignment",
    placeholder: "Paste the customer complaint…",
    steps: [
      { name: "Analysis", system: "Analyze the complaint: sentiment, root cause, severity.", prompt: (i) => `Complaint:\n${i}` },
      { name: "Response Draft", system: "Write an empathetic, solution-focused customer response.", prompt: (i, p) => `Complaint: ${i}\nAnalysis:\n${p}\nWrite the response.` },
      { name: "Task Assignment", system: "Create internal follow-up tasks with owners and priority to resolve and escalate if needed.", prompt: (_, p) => `Based on this, list internal tasks:\n${p}` },
    ],
  },
};

function WorkflowPage() {
  const { t, lang } = useLanguage();
  const call = useServerFn(runAI);
  const [wf, setWf] = useState<keyof typeof WORKFLOWS>("meeting");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ name: string; content: string }[]>([]);
  const [running, setRunning] = useState(-1);

  const run = async () => {
    if (!input.trim()) return;
    const flow = WORKFLOWS[wf];
    setResults([]);
    let prev = "";
    for (let i = 0; i < flow.steps.length; i++) {
      setRunning(i);
      try {
        const step = flow.steps[i];
        const res = await call({ data: { system: step.system, prompt: step.prompt(input, prev), language: lang } });
        prev = res.text;
        setResults((r) => [...r, { name: step.name, content: res.text }]);
        bumpStat("aiRequests");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Workflow failed");
        break;
      }
    }
    setRunning(-1);
    toast.success("Workflow complete");
  };

  const flow = WORKFLOWS[wf];

  return (
    <ToolShell title={t("workflowAutomation")} description="Chain multiple AI steps into one automated workplace flow." icon={Workflow}>
      <ResponsibleAINotice />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(Object.keys(WORKFLOWS) as (keyof typeof WORKFLOWS)[]).map((k) => (
          <button key={k} onClick={() => { setWf(k); setResults([]); }}
            className={`rounded-xl border p-4 text-left transition ${wf === k ? "border-primary bg-primary/5 shadow-glow" : "hover:border-primary/40"}`}>
            <p className="font-semibold">{WORKFLOWS[k].label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{WORKFLOWS[k].desc}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={flow.placeholder} className="min-h-28" />
        <Button className="mt-3 w-full gradient-primary text-primary-foreground" onClick={run} disabled={running !== -1 || !input.trim()}>
          {running !== -1 ? <><Loader2 className="size-4 animate-spin" /> Running step {running + 1}/{flow.steps.length}…</> : <><Play className="size-4" /> Run workflow</>}
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {flow.steps.map((step, i) => {
          const result = results[i];
          const active = running === i;
          return (
            <div key={step.name}>
              {i > 0 && <div className="flex justify-center py-1"><ArrowDown className="size-4 text-muted-foreground" /></div>}
              <div className={`rounded-2xl border bg-card shadow-soft ${active ? "border-primary" : ""}`}>
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${result ? "bg-success text-primary-foreground" : active ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {result ? <Check className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" /> : i + 1}
                  </div>
                  <h3 className="text-sm font-semibold">{step.name}</h3>
                </div>
                {result && <div className="p-4"><Markdown content={result.content} /></div>}
              </div>
            </div>
          );
        })}
      </div>
    </ToolShell>
  );
}
