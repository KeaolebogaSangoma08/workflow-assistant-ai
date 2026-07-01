import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Mail, FileText, ListChecks, FlaskConical, FileStack,
  Workflow, BookMarked, BarChart3, CalendarDays, MessagesSquare, Settings,
  Menu, X, Globe, Search, Sparkles, Moon, Sun,
} from "lucide-react";
import { useLanguage, LANGUAGES, type StringKey } from "@/lib/i18n";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const NAV: { to: string; icon: React.ComponentType<{ className?: string }>; key: StringKey }[] = [
  { to: "/", icon: LayoutDashboard, key: "dashboard" },
  { to: "/email", icon: Mail, key: "emailGenerator" },
  { to: "/meetings", icon: FileText, key: "meetingSummarizer" },
  { to: "/tasks", icon: ListChecks, key: "taskPlanner" },
  { to: "/research", icon: FlaskConical, key: "researchAssistant" },
  { to: "/documents", icon: FileStack, key: "documentAssistant" },
  { to: "/workflow", icon: Workflow, key: "workflowAutomation" },
  { to: "/prompts", icon: BookMarked, key: "promptLibrary" },
  { to: "/analytics", icon: BarChart3, key: "analytics" },
  { to: "/calendar", icon: CalendarDays, key: "calendar" },
  { to: "/chatbot", icon: MessagesSquare, key: "chatbot" },
  { to: "/settings", icon: Settings, key: "settings" },
];

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang, translating } = useLanguage();
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useDarkMode();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const NavList = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {NAV.map(({ to, icon: Icon, key }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="size-4.5 shrink-0" />
            <span className="truncate">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );

  const Brand = (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="flex size-9 items-center justify-center rounded-xl gradient-accent text-primary-foreground shadow-glow">
        <Sparkles className="size-5" />
      </div>
      <span className="text-[15px] font-bold text-sidebar-foreground leading-tight">{t("appName")}</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar lg:flex">
        {Brand}
        {NavList}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar animate-float-in">
            <div className="flex items-center justify-between pr-3">
              {Brand}
              <button onClick={() => setOpen(false)} className="text-sidebar-foreground">
                <X className="size-5" />
              </button>
            </div>
            {NavList}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur-md">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </button>
          <Link to="/search" className="flex flex-1 items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40">
            <Search className="size-4" />
            <span className="truncate">{t("search")}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Globe className="size-4 text-muted-foreground" />
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="w-32 sm:w-40" aria-label={t("language")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>
        {translating && (
          <div className="bg-primary/10 px-4 py-1.5 text-center text-xs text-primary">Translating interface…</div>
        )}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
