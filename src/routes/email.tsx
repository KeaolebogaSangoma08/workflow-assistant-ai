import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerate } from "@/lib/useGenerate";
import { useLanguage, LANGUAGES } from "@/lib/i18n";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Email Generator — AI Workplace Assistant" }] }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Formal", "Persuasive", "Concise", "Apologetic", "Enthusiastic"];

function EmailPage() {
  const { t, lang } = useLanguage();
  const [f, setF] = useState({ recipient: "", subject: "", purpose: "", tone: "Professional", notes: "", outLang: "" });
  const { loading, output, setOutput, generate } = useGenerate("emails");

  const run = () => {
    if (!f.purpose.trim()) return;
    generate(
      "You are an expert workplace communication assistant. Write a complete, ready-to-send professional email. Return only the email (subject line + body), no commentary.",
      `Write a workplace email.
Recipient: ${f.recipient || "colleague"}
Subject: ${f.subject || "(you decide)"}
Purpose: ${f.purpose}
Tone: ${f.tone}
Additional notes: ${f.notes || "none"}
Output language: ${f.outLang || lang}`,
    );
  };

  return (
    <ToolShell title={t("emailGenerator")} description="Generate polished workplace emails from a few details." icon={Mail}>
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Recipient"><Input value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} placeholder="e.g. Marketing Team" /></Field>
            <Field label="Subject"><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Optional" /></Field>
          </div>
          <Field label="Purpose *">
            <Textarea value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} placeholder="What should this email accomplish?" className="min-h-24" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tone">
              <Select value={f.tone} onValueChange={(v) => setF({ ...f, tone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Output Language">
              <Select value={f.outLang || lang} onValueChange={(v) => setF({ ...f, outLang: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{LANGUAGES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Additional Notes">
            <Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Any extra context" className="min-h-16" />
          </Field>
          <Button className="w-full gradient-primary text-primary-foreground" onClick={run} disabled={loading || !f.purpose.trim()}>
            {loading ? t("generating") : t("generate")}
          </Button>
        </div>

        {output ? (
          <OutputPanel content={output} onChange={setOutput} onRegenerate={run} loading={loading} title="Generated Email" type="Email" />
        ) : (
          <Placeholder text="Your generated email will appear here." />
        )}
      </div>
    </ToolShell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function Placeholder({ text }: { text: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
