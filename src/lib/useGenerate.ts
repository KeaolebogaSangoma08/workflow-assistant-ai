import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { runAI } from "@/lib/ai.functions";
import { useLanguage } from "@/lib/i18n";
import { bumpStat, type Stats } from "@/lib/store";

export function useGenerate(stat?: keyof Stats) {
  const call = useServerFn(runAI);
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const generate = async (system: string, prompt: string) => {
    setLoading(true);
    try {
      const res = await call({ data: { system, prompt, language: lang } });
      setOutput(res.text);
      if (stat) bumpStat(stat);
      return res.text;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
      return "";
    } finally {
      setLoading(false);
    }
  };

  return { loading, output, setOutput, generate };
}
