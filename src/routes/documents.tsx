import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileStack, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { ToolShell } from "@/components/ToolShell";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { OutputPanel } from "@/components/OutputPanel";
import { Placeholder } from "@/routes/email";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeDoc } from "@/lib/ai.functions";
import { useLanguage } from "@/lib/i18n";
import { bumpStat } from "@/lib/store";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Document Assistant — AI Workplace Assistant" }] }),
  component: DocumentsPage,
});

const TEXT_EXT = ["txt", "md", "csv", "json", "log", "xml", "html", "rtf", "tsv", "yaml", "yml"];

const TASKS = [
  { key: "summary", label: "Summarize", prompt: "Provide a clear executive summary of this document." },
  { key: "actions", label: "Action Items", prompt: "Extract all key action items with owners and due dates if present, as a markdown checklist." },
  { key: "report", label: "Generate Report", prompt: "Generate a structured report from this document with sections and key insights." },
  { key: "translate", label: "Translate", prompt: "Translate the document content into the requested language, preserving structure." },
  { key: "qa", label: "Key Insights", prompt: "List the most important insights, facts, figures and risks from this document." },
];

function readFile(file: File, asText: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    if (asText) r.readAsText(file); else r.readAsDataURL(file);
  });
}

function DocumentsPage() {
  const { t, lang } = useLanguage();
  const call = useServerFn(analyzeDoc);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState("summary");

  const run = async (taskKey: string) => {
    const task = TASKS.find((x) => x.key === taskKey)!;
    setActiveTask(taskKey);
    if (!file && !pasted.trim()) { toast.error("Upload a file or paste content first"); return; }
    setLoading(true);
    try {
      let payload: any = { task: task.prompt, filename: file?.name || "pasted-content.txt", language: lang };
      if (pasted.trim() && !file) {
        payload.text = pasted;
      } else if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (TEXT_EXT.includes(ext) || file.type.startsWith("text/")) {
          payload.text = await readFile(file, true);
        } else {
          payload.dataUrl = await readFile(file, false);
          payload.mime = file.type || "application/octet-stream";
        }
      }
      const res = await call({ data: payload });
      setOutput(res.text);
      bumpStat("documents");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell title={t("documentAssistant")} description="Upload any document — PDF, Word, Excel, PowerPoint, images or text — and let AI analyze it." icon={FileStack}>
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition hover:border-primary/50 hover:bg-muted/40"
          >
            <Upload className="size-8 text-primary" />
            <p className="text-sm font-medium">{file ? file.name : "Click to upload any document"}</p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, XLSX, TXT, images and more</p>
            <input ref={inputRef} type="file" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); setPasted(""); }} />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or paste content <div className="h-px flex-1 bg-border" />
          </div>
          <Textarea value={pasted} onChange={(e) => { setPasted(e.target.value); }} placeholder="Paste document text here…" className="min-h-32" />

          <div className="flex flex-wrap gap-2">
            {TASKS.map((x) => (
              <Button key={x.key} size="sm" variant={activeTask === x.key ? "default" : "outline"}
                className={activeTask === x.key ? "gradient-primary text-primary-foreground" : ""}
                onClick={() => run(x.key)} disabled={loading}>
                <FileText className="size-4" /> {x.label}
              </Button>
            ))}
          </div>
          {loading && <p className="text-sm text-muted-foreground">{t("generating")}</p>}
        </div>

        {output ? <OutputPanel content={output} onChange={setOutput} onRegenerate={() => run(activeTask)} loading={loading} title="Document Analysis" type="Document" /> : <Placeholder text="Document analysis will appear here." />}
      </div>
    </ToolShell>
  );
}
