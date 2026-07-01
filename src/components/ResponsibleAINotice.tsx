import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function ResponsibleAINotice() {
  const { t } = useLanguage();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("ai_notice_dismissed")) setShow(false);
  }, []);

  if (!show) return null;
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm animate-float-in">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <p className="flex-1 text-muted-foreground">{t("aiNotice")}</p>
      <button
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem("ai_notice_dismissed", "1");
          setShow(false);
        }}
        className="rounded-md p-1 hover:bg-warning/20"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
