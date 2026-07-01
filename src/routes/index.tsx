import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail, FileText, ListChecks, FlaskConical, FileStack, MessagesSquare,
  TrendingUp, CalendarDays, Clock, Zap, ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useStats, useTasks, useSavedItems } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Assistant" },
      { name: "description", content: "Your AI-powered workplace command center: tasks, deadlines, and quick AI actions." },
    ],
  }),
  component: Dashboard,
});

const QUICK = [
  { to: "/email", icon: Mail, label: "Write an email" },
  { to: "/meetings", icon: FileText, label: "Summarize a meeting" },
  { to: "/tasks", icon: ListChecks, label: "Plan a project" },
  { to: "/research", icon: FlaskConical, label: "Research a topic" },
  { to: "/documents", icon: FileStack, label: "Analyze a document" },
  { to: "/chatbot", icon: MessagesSquare, label: "Ask the assistant" },
];

function Dashboard() {
  const { t } = useLanguage();
  const stats = useStats();
  const { tasks } = useTasks();
  const { items } = useSavedItems();

  const dueToday = tasks.filter((x) => x.status !== "Done").slice(0, 5);
  const score = Math.min(100, 40 + stats.aiRequests * 3 + tasks.filter((x) => x.status === "Done").length * 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground shadow-glow animate-float-in">
        <p className="text-sm/relaxed opacity-90">{t("welcome")} 👋</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t("welcomeSub")}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={TrendingUp} label={t("productivityScore")} value={`${score}`} tone="primary" />
        <Stat icon={Zap} label="AI Requests" value={`${stats.aiRequests}`} tone="accent" />
        <Stat icon={Mail} label="Emails" value={`${stats.emails}`} tone="success" />
        <Stat icon={FileText} label="Summaries" value={`${stats.summaries}`} tone="warning" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("quickActions")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <h2 className="font-semibold">{t("tasksDueToday")}</h2>
          </div>
          {dueToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open tasks. Create some in the Task Planner.</p>
          ) : (
            <ul className="space-y-2">
              {dueToday.map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="truncate">{task.task}</span>
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    task.priority === "High" ? "bg-destructive/15 text-destructive"
                    : task.priority === "Medium" ? "bg-warning/20 text-warning" : "bg-success/15 text-success"
                  }`}>{task.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <h2 className="font-semibold">{t("recentActivity")}</h2>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your saved AI outputs will appear here.</p>
          ) : (
            <ul className="space-y-2">
              {items.slice(0, 5).map((it) => (
                <li key={it.id} className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="font-medium">{it.type}</span> · <span className="text-muted-foreground">{it.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string;
  tone: "primary" | "accent" | "success" | "warning";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning",
  };
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft animate-float-in">
      <div className={`mb-2 flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
