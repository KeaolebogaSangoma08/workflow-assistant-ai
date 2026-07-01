import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { OutputPanel } from "@/components/OutputPanel";
import { Field, Placeholder } from "@/routes/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerate } from "@/lib/useGenerate";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research Assistant — AI Workplace Assistant" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const { t } = useLanguage();
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Standard");
  const { loading, output, setOutput, generate } = useGenerate("research");

  const run = () => {
    if (!topic.trim()) return;
    generate(
      `You are a workplace research analyst. Produce a ${depth.toLowerCase()} research report on ANY topic given. Use markdown '## ' sections: Overview, Key Findings, Opportunities, Challenges, Recommendations, References (plausible sources). Be thorough and accurate.`,
      `Research topic: ${topic}`,
    );
  };

  return (
    <ToolShell title={t("researchAssistant")} description="Generate a structured research report on any topic." icon={FlaskConical}>
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <Field label="Research Topic *">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Impact of remote work on team productivity"
              onKeyDown={(e) => e.key === "Enter" && run()} />
          </Field>
          <Field label="Depth">
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Quick", "Standard", "In-depth"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Button className="w-full gradient-primary text-primary-foreground" onClick={run} disabled={loading || !topic.trim()}>
            {loading ? t("generating") : "Generate Report"}
          </Button>
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            Tip: any subject works — market trends, technologies, competitors, policies, or internal processes.
          </div>
        </div>
        {output ? <OutputPanel content={output} onChange={setOutput} onRegenerate={run} loading={loading} title="Research Report" type="Research" /> : <Placeholder text="Your research report will appear here." />}
      </div>
    </ToolShell>
  );
}
