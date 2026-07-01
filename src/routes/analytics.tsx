import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Zap, Mail, FileText, FileStack, ListChecks, FlaskConical, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { ToolShell } from "@/components/ToolShell";
import { useLanguage } from "@/lib/i18n";
import { useStats, useTasks } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — AI Workplace Assistant" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { t } = useLanguage();
  const stats = useStats();
  const { tasks } = useTasks();
  const done = tasks.filter((x) => x.status === "Done").length;
  const score = Math.min(100, 40 + stats.aiRequests * 3 + done * 5);
  const timeSaved = Math.round(stats.aiRequests * 8 + stats.documents * 12);

  const usage = [
    { name: "Emails", value: stats.emails },
    { name: "Summaries", value: stats.summaries },
    { name: "Docs", value: stats.documents },
    { name: "Tasks", value: stats.tasks },
    { name: "Research", value: stats.research },
  ];
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <ToolShell title={t("analytics")} description="Track your AI usage and productivity impact." icon={BarChart3}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={TrendingUp} label={t("productivityScore")} value={`${score}`} />
        <Kpi icon={Zap} label="AI Requests" value={`${stats.aiRequests}`} />
        <Kpi icon={FileText} label="Time Saved (min)" value={`${timeSaved}`} />
        <Kpi icon={ListChecks} label="Tasks Completed" value={`${done}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="mb-4 font-semibold">Usage by feature</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usage}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {usage.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="mb-4 font-semibold">Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={usage.filter((u) => u.value > 0)} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                {usage.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {usage.every((u) => u.value === 0) && <p className="text-center text-sm text-muted-foreground">Start using AI tools to see insights.</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Mini icon={Mail} label="Emails" value={stats.emails} />
        <Mini icon={FileText} label="Summaries" value={stats.summaries} />
        <Mini icon={FileStack} label="Documents" value={stats.documents} />
        <Mini icon={ListChecks} label="Task plans" value={stats.tasks} />
        <Mini icon={FlaskConical} label="Reports" value={stats.research} />
      </div>
    </ToolShell>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
function Mini({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-soft">
      <Icon className="size-5 text-primary" />
      <div><p className="font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </div>
  );
}
