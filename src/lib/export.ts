export function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAs(format: "txt" | "md" | "doc", title: string, content: string) {
  const safe = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "export";
  if (format === "txt") return downloadFile(`${safe}.txt`, content);
  if (format === "md") return downloadFile(`${safe}.md`, content, "text/markdown");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:Calibri,Arial,sans-serif;white-space:pre-wrap;">${content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br>")}</body></html>`;
  return downloadFile(`${safe}.doc`, html, "application/msword");
}
