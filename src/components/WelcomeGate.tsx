import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Mail, FileText, ListChecks, FlaskConical } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const FEATURES = [
  { icon: Mail, label: "Email" },
  { icon: FileText, label: "Meetings" },
  { icon: ListChecks, label: "Tasks" },
  { icon: FlaskConical, label: "Research" },
];

export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [entered, setEntered] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setEntered(sessionStorage.getItem("entered") === "1");
  }, []);

  const enter = () => {
    setLeaving(true);
    sessionStorage.setItem("entered", "1");
    setTimeout(() => setEntered(true), 500);
  };

  if (entered) return <>{children}</>;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden gradient-primary transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* decorative glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-4 flex max-w-lg flex-col items-center text-center text-prim-foreground">
        <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md shadow-glow animate-float-in">
          <Sparkles className="size-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
          {t("appName")}
        </h1>
        <p className="mt-4 max-w-md text-base text-primary-foreground/80">
          Your AI-powered command center for email, meetings, planning, research and documents — all in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-md"
            >
              <Icon className="size-4" />
              {label}
            </div>
          ))}
        </div>

        <button
          onClick={enter}
          className="group mt-10 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-primary shadow-glow transition-transform hover:scale-105 active:scale-95"
        >
          Enter Workspace
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
