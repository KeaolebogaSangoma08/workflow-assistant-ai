import { useState, type ReactNode } from "react";
import { Copy, Download, RefreshCw, Save, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";
import { exportAs } from "@/lib/export";
import { useSavedItems } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n";

export function OutputPanel({
  content,
  onChange,
  onRegenerate,
  title,
  type,
  loading,
  extra,
}: {
  content: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  title: string;
  type: string;
  loading?: boolean;
  extra?: ReactNode;
}) {
  const { t } = useLanguage();
  const { add } = useSavedItems();
  const [editing, setEditing] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    toast.success(t("copied"));
  };

  return (
    <div className="rounded-2xl border bg-card shadow-soft animate-float-in">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {extra}
          <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)}>
            {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
            <span className="ml-1 hidden sm:inline">{editing ? t("save") : t("edit")}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={copy}>
            <Copy className="size-4" /> <span className="ml-1 hidden sm:inline">{t("copy")}</span>
          </Button>
          {onRegenerate && (
            <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              <span className="ml-1 hidden sm:inline">{t("regenerate")}</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              add({ type, title, content });
              toast.success(t("saved"));
            }}
          >
            <Save className="size-4" /> <span className="ml-1 hidden sm:inline">{t("save")}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <Download className="size-4" /> <span className="ml-1 hidden sm:inline">{t("download")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportAs("txt", title, content)}>Plain Text (.txt)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("md", title, content)}>Markdown (.md)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAs("doc", title, content)}>Word (.doc)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="p-4">
        {editing ? (
          <Textarea value={content} onChange={(e) => onChange(e.target.value)} className="min-h-80 font-mono text-sm" />
        ) : (
          <Markdown content={content} />
        )}
      </div>
    </div>
  );
}
