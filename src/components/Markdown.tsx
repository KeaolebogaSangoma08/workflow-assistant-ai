import { Fragment } from "react";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-sm">{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 ml-5 list-disc space-y-1">
          {list.map((li, i) => <li key={i}>{inline(li)}</li>)}
        </ul>,
      );
      list = [];
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (/^#{1,3}\s/.test(line)) {
      flush();
      const level = line.match(/^#+/)![0].length;
      const txt = line.replace(/^#+\s/, "");
      const cls = level === 1 ? "text-xl font-bold mt-4 mb-2" : level === 2 ? "text-lg font-semibold mt-3 mb-1.5" : "text-base font-semibold mt-2 mb-1";
      blocks.push(<p key={idx} className={cls}>{inline(txt)}</p>);
    } else if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      list.push(line.replace(/^[-*]\s/, "").replace(/^\d+\.\s/, ""));
    } else if (line === "") {
      flush();
    } else {
      flush();
      blocks.push(<p key={idx} className="my-1.5 leading-relaxed">{inline(line)}</p>);
    }
  });
  flush();
  return <div className="text-sm text-foreground">{blocks}</div>;
}
