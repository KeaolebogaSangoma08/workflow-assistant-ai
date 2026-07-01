import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { useSavedItems, useTasks } from "@/lib/store";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — AI Workplace Assistant" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { t } = useLanguage();
  const { items } = useSavedItems();
  const { tasks } = useTasks();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return [];
    const out: { type: string; title: string; snippet: string }[] = [];
    items.forEach((i) => { if ((i.title + i.content).toLowerCase().includes(query)) out.push({ type: i.type, title: i.title, snippet: i.content.slice(0, 120) }); });
    tasks.forEach((task) => { if (task.task.toLowerCase().includes(query)) out.push({ type: "Task", title: task.task, snippet: `${task.status} · ${task.priority}` }); });
    const events = JSON.parse(localStorage.getItem("cal_events") || "[]");
    events.forEach((e: any) => { if (e.title.toLowerCase().includes(query)) out.push({ type: "Event", title: e.title, snippet: `${e.date} ${e.time}` }); });
    const chat = JSON.parse(localStorage.getItem("chat_history") || "[]");
    chat.forEach((m: any) => { if (m.content.toLowerCase().includes(query)) out.push({ type: "Chat", title: m.role, snippet: m.content.slice(0, 120) }); });
    return out;
  }, [q, items, tasks]);

  return (
    <ToolShell title="Global Search" description="Search across emails, documents, tasks, meetings, research and chat." icon={Search}>
      <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="mb-5 h-12 text-base" />
      {q && results.length === 0 && <p className="text-sm text-muted-foreground">No results for “{q}”.</p>}
      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{r.type}</span>
              <span className="font-medium">{r.title}</span>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{r.snippet}</p>
          </div>
        ))}
      </div>
    </ToolShell>
  );
}
