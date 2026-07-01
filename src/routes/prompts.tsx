import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookMarked, Copy, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/prompts")({
  head: () => ({ meta: [{ title: "Prompt Library — AI Workplace Assistant" }] }),
  component: PromptsPage,
});

const CATEGORIES = ["HR", "Finance", "Sales", "Marketing", "Operations", "Customer Support", "Legal", "IT"];
const LIBRARY: Record<string, { title: string; text: string }[]> = {
  HR: [
    { title: "Job description", text: "Write a job description for a [role] including responsibilities, requirements and benefits." },
    { title: "Interview questions", text: "Generate 10 structured interview questions for a [role] candidate." },
  ],
  Finance: [
    { title: "Budget summary", text: "Summarize this quarterly budget and highlight variances and risks." },
    { title: "Invoice reminder", text: "Write a polite payment reminder email for an overdue invoice." },
  ],
  Sales: [
    { title: "Cold outreach", text: "Write a personalized cold outreach email to a prospect in [industry]." },
    { title: "Follow-up", text: "Draft a follow-up email after a sales demo emphasizing value." },
  ],
  Marketing: [
    { title: "Campaign brief", text: "Create a marketing campaign brief for launching [product]." },
    { title: "Social posts", text: "Write 5 engaging LinkedIn posts about [topic]." },
  ],
  Operations: [
    { title: "SOP draft", text: "Write a standard operating procedure for [process]." },
    { title: "Incident report", text: "Draft an incident report summary for [event]." },
  ],
  "Customer Support": [
    { title: "Complaint response", text: "Write an empathetic response to a customer complaint about [issue]." },
    { title: "FAQ answer", text: "Write a clear FAQ answer for the question: [question]." },
  ],
  Legal: [
    { title: "NDA summary", text: "Summarize the key obligations in this NDA in plain language." },
    { title: "Policy draft", text: "Draft a workplace policy about [topic]." },
  ],
  IT: [
    { title: "Outage notice", text: "Write a clear IT outage notification for staff about [system]." },
    { title: "Onboarding checklist", text: "Create an IT onboarding checklist for a new employee." },
  ],
};

type Custom = { id: string; category: string; title: string; text: string };

function PromptsPage() {
  const { t } = useLanguage();
  const [cat, setCat] = useState("HR");
  const [custom, setCustom] = useState<Custom[]>([]);
  const [form, setForm] = useState({ title: "", text: "", category: "HR" });

  useEffect(() => { setCustom(JSON.parse(localStorage.getItem("custom_prompts") || "[]")); }, []);
  const saveCustom = (list: Custom[]) => { setCustom(list); localStorage.setItem("custom_prompts", JSON.stringify(list)); };

  const add = () => {
    if (!form.title.trim() || !form.text.trim()) return;
    saveCustom([{ id: crypto.randomUUID(), ...form }, ...custom]);
    setForm({ title: "", text: "", category: cat });
    toast.success("Prompt saved");
  };
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success(t("copied")); };

  const shown = LIBRARY[cat] || [];
  const customInCat = custom.filter((c) => c.category === cat);

  return (
    <ToolShell title={t("promptLibrary")} description="Ready-made prompt templates plus your own saved prompts." icon={BookMarked}>
      <Tabs value={cat} onValueChange={setCat} className="mb-5">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c} className="rounded-full border data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">{c}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2">
        {customInCat.map((p) => (
          <Card key={p.id} title={p.title} text={p.text} onCopy={() => copy(p.text)} starred />
        ))}
        {shown.map((p) => (
          <Card key={p.title} title={p.title} text={p.text} onCopy={() => copy(p.text)} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Plus className="size-4" /> Save a custom prompt</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="gradient-primary text-primary-foreground" onClick={add}>Save prompt</Button>
        </div>
        <Textarea placeholder="Prompt text…" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="mt-3 min-h-20" />
      </div>
    </ToolShell>
  );
}

function Card({ title, text, onCopy, starred }: { title: string; text: string; onCopy: () => void; starred?: boolean }) {
  return (
    <div className="group rounded-xl border bg-card p-4 shadow-soft transition hover:border-primary/40">
      <div className="mb-1.5 flex items-center gap-2">
        {starred && <Star className="size-3.5 fill-warning text-warning" />}
        <h3 className="font-medium">{title}</h3>
        <Button size="icon" variant="ghost" className="ml-auto size-7 opacity-0 transition group-hover:opacity-100" onClick={onCopy}><Copy className="size-4" /></Button>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
