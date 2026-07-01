import { createServerFn } from "@tanstack/react-start";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGateway(messages: ChatMessage[], model = "google/gemini-3-flash-preview") {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (res.status === 429) throw new Error("Rate limited. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").trim();
}

/** Generic AI generation for all workplace tools. */
export const runAI = createServerFn({ method: "POST" })
  .inputValidator((input: { system: string; prompt: string; language?: string }) => input)
  .handler(async ({ data }) => {
    const langLine = data.language && data.language !== "English"
      ? `\n\nIMPORTANT: Write your entire response in ${data.language}.`
      : "";
    const text = await callGateway([
      { role: "system", content: data.system + langLine },
      { role: "user", content: data.prompt },
    ]);
    return { text };
  });

/** Multi-turn chatbot. */
export const chatAI = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[]; language?: string }) => input)
  .handler(async ({ data }) => {
    const sys: ChatMessage = {
      role: "system",
      content:
        "You are the AI Workplace Productivity Assistant — a helpful, concise professional assistant. Use markdown formatting." +
        (data.language && data.language !== "English" ? ` Always respond in ${data.language}.` : ""),
    };
    const text = await callGateway([sys, ...data.messages]);
    return { text };
  });

/** Translate a JSON dictionary of UI strings into a target language. */
export const translateStrings = createServerFn({ method: "POST" })
  .inputValidator((input: { strings: Record<string, string>; language: string }) => input)
  .handler(async ({ data }) => {
    if (!data.language || data.language === "English") return { strings: data.strings };
    const text = await callGateway([
      {
        role: "system",
        content:
          "You are a professional UI translator. Translate the VALUES of the given JSON object into " +
          data.language +
          ". Keep the KEYS unchanged. Keep it natural and concise for a software interface. Return ONLY valid JSON, no markdown fences.",
      },
      { role: "user", content: JSON.stringify(data.strings) },
    ]);
    try {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      return { strings: JSON.parse(cleaned) as Record<string, string> };
    } catch {
      return { strings: data.strings };
    }
  });
