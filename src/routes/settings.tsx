import { createFileRoute } from "@tanstack/react-router";
import { Settings, Globe, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { ToolShell } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, LANGUAGES } from "@/lib/i18n";
import { useSavedItems } from "@/lib/store";
import { exportAs } from "@/lib/export";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Workplace Assistant" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const { items, remove } = useSavedItems();

  const clearAll = () => {
    ["saved_items", "tasks", "cal_events", "chat_history", "custom_prompts", "usage_stats"].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("saved-updated"));
    window.dispatchEvent(new Event("tasks-updated"));
    window.dispatchEvent(new Event("stats-updated"));
    toast.success("All local data cleared");
  };

  return (
    <ToolShell title={t("settings")} description="Preferences and your saved AI outputs." icon={Settings}>
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Globe className="size-4" /> {t("language")}</h2>
          <p className="mb-3 text-sm text-muted-foreground">Choose any language — the entire interface and all AI-generated content will adapt.</p>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Save className="size-4" /> Saved outputs ({items.length})</h2>
          {items.length === 0 ? <p className="text-sm text-muted-foreground">Save AI outputs to find them here.</p> : (
            <div className="space-y-2">
              {items.slice(0, 20).map((it) => (
                <div key={it.id} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{it.type}</span>
                  <span className="flex-1 truncate text-sm">{it.title}</span>
                  <Button size="sm" variant="ghost" onClick={() => exportAs("doc", it.title, it.content)}>Export</Button>
                  <Button size="icon" variant="ghost" className="size-8" onClick={() => remove(it.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="mb-2 font-semibold text-destructive">Danger zone</h2>
          <p className="mb-3 text-sm text-muted-foreground">Clear all locally stored data (tasks, events, saved outputs, chat history, stats).</p>
          <Button variant="destructive" onClick={clearAll}><Trash2 className="size-4" /> Clear all data</Button>
        </div>
      </div>
    </ToolShell>
  );
}
