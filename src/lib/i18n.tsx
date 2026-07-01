import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { translateStrings } from "@/lib/ai.functions";

export const LANGUAGES = [
  "English", "Afrikaans", "Setswana", "isiZulu", "isiXhosa", "Sesotho",
  "French", "Spanish", "German", "Portuguese", "Arabic", "Chinese",
  "Italian", "Dutch", "Japanese", "Hindi", "Swahili", "Russian",
] as const;

export const BASE_STRINGS = {
  appName: "AI Workplace Assistant",
  dashboard: "Dashboard",
  emailGenerator: "Email Generator",
  meetingSummarizer: "Meeting Summarizer",
  taskPlanner: "Task Planner",
  researchAssistant: "Research Assistant",
  documentAssistant: "Document Assistant",
  workflowAutomation: "Workflow Automation",
  promptLibrary: "Prompt Library",
  analytics: "Analytics",
  calendar: "Calendar",
  chatbot: "Chatbot",
  settings: "Settings",
  search: "Search everything...",
  generate: "Generate",
  regenerate: "Regenerate",
  copy: "Copy",
  save: "Save",
  download: "Download",
  edit: "Edit",
  share: "Share",
  copied: "Copied to clipboard",
  saved: "Saved",
  generating: "Generating...",
  language: "Language",
  aiNotice: "AI-generated content may contain inaccuracies, bias, or missing context. Review and verify all outputs before using them for professional, legal, financial, medical, or business decisions.",
  quickActions: "Quick Actions",
  productivityScore: "Productivity Score",
  tasksDueToday: "Tasks Due Today",
  upcomingDeadlines: "Upcoming Deadlines",
  recentActivity: "Recent AI Activity",
  welcome: "Welcome back",
  welcomeSub: "Your AI-powered workplace command center.",
};

export type StringKey = keyof typeof BASE_STRINGS;

type Ctx = {
  lang: string;
  setLang: (l: string) => void;
  t: (k: StringKey) => string;
  translating: boolean;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("English");
  const [dict, setDict] = useState<Record<string, string>>(BASE_STRINGS);
  const [translating, setTranslating] = useState(false);
  const translate = useServerFn(translateStrings);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("app_lang") : null;
    if (saved && saved !== "English") setLangState(saved);
  }, []);

  const applyLang = useCallback(
    async (l: string) => {
      setLangState(l);
      if (typeof window !== "undefined") localStorage.setItem("app_lang", l);
      if (l === "English") {
        setDict(BASE_STRINGS);
        return;
      }
      const cacheKey = `i18n_${l}`;
      const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        setDict(JSON.parse(cached));
        return;
      }
      setTranslating(true);
      try {
        const res = await translate({ data: { strings: BASE_STRINGS, language: l } });
        const merged = { ...BASE_STRINGS, ...res.strings };
        setDict(merged);
        if (typeof window !== "undefined") localStorage.setItem(cacheKey, JSON.stringify(merged));
      } catch {
        setDict(BASE_STRINGS);
      } finally {
        setTranslating(false);
      }
    },
    [translate],
  );

  useEffect(() => {
    if (lang !== "English") applyLang(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback((k: StringKey) => dict[k] ?? BASE_STRINGS[k], [dict]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: applyLang, t, translating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
