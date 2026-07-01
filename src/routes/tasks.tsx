import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { OutputPanel } from "@/components/OutputPanel";
import { Field, Placeholder } from "@/routes/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerate } from "@/lib/useGenerate";
import { useLanguage } from "@/lib/i18n";
import { useTasks, type TaskItem } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — AI Workplace Assistant" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { t } = useLanguage();
  const [f, setF] = useState({ goal: "", deadline: "", priority: "Medium", team: "" });
  const { loading, output, setOutput, generate } = useGenerate("tasks");
  const { tasks, save, addMany } = useTasks();

  const run = async () => {
    if (!f.goal.trim()) return;
    const text = await generate(
      "You are a senior project manager. Turn the goal into a structured plan with markdown '## ' sections: Milestones, Tasks (bullet list), Deadlines, Dependencies, Progress Tracking suggestions.",
      `Goal: ${f.goal}\nDeadline: ${f.deadline || "flexible"}\nPriority: ${f.priority}\nTeam members: ${f.team || "unspecified"}`,
    );
    if (text) {
      const lines = text.split("\n").filter((l) => /^[-*]\s/.test(l.trim())).map((l) => l.replace(/^[-*]\s/, "").trim()).slice(0, 8);
      if (lines.length) {
        addMany(lines.map((task) => ({
          id: crypto.randomUUID(), task, owner: f.team.split(",")[0]?.trim() || "Unassigned",
          due: f.deadline || "", priority: f.priority as TaskItem["priority"], status: "Open" as const,
        })));
        toast.success(`${lines.length} tasks added to your board`);
      }
    }
  };

  const addManual = () => addMany([{ id: crypto.randomUUID(), task: "New task", owner: "Unassigned", due: "", priority: "Medium", status: "Open" }]);
  const setStatus = (id: string, status: TaskItem["status"]) => save(tasks.map((x) => (x.id === id ? { ...x, status } : x)));
  const remove = (id: string) => save(tasks.filter((x) => x.id !== id));

  return (
    <ToolShell title={t("taskPlanner")} description="Turn goals into structured plans and a live task board." icon={ListChecks}>
      <ResponsibleAINotice />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
          <Field label="Goal *"><Textarea value={f.goal} onChange={(e) => setF({ ...f, goal: e.target.value })} placeholder="e.g. Launch our new customer portal" className="min-h-20" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline"><Input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Field>
            <Field label="Priority">
              <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["High", "Medium", "Low"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Team Members"><Input value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })} placeholder="comma separated" /></Field>
          <Button className="w-full gradient-primary text-primary-foreground" onClick={run} disabled={loading || !f.goal.trim()}>
            {loading ? t("generating") : "Generate Plan"}
          </Button>
        </div>
        {output ? <OutputPanel content={output} onChange={setOutput} onRegenerate={run} loading={loading} title="Project Plan" type="Plan" /> : <Placeholder text="Your project plan will appear here." />}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Task Board ({tasks.length})</h2>
          <Button size="sm" variant="outline" onClick={addManual}><Plus className="size-4" /> Add task</Button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet. Generate a plan or add one manually.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                <Input value={task.task} onChange={(e) => save(tasks.map((x) => x.id === task.id ? { ...x, task: e.target.value } : x))} className="h-8 flex-1 min-w-40 bg-background" />
                <span className="text-xs text-muted-foreground">{task.owner}</span>
                <Select value={task.status} onValueChange={(v) => setStatus(task.id, v as TaskItem["status"])}>
                  <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Open", "In Progress", "Done"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => remove(task.id)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
