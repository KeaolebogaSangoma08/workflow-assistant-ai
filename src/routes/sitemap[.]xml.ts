import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/email", changefreq: "monthly", priority: "0.8" },
          { path: "/meetings", changefreq: "monthly", priority: "0.8" },
          { path: "/tasks", changefreq: "monthly", priority: "0.8" },
          { path: "/research", changefreq: "monthly", priority: "0.8" },
          { path: "/documents", changefreq: "monthly", priority: "0.8" },
          { path: "/workflow", changefreq: "monthly", priority: "0.8" },
          { path: "/prompts", changefreq: "monthly", priority: "0.7" },
          { path: "/analytics", changefreq: "monthly", priority: "0.6" },
          { path: "/calendar", changefreq: "monthly", priority: "0.7" },
          { path: "/chatbot", changefreq: "monthly", priority: "0.8" },
          { path: "/settings", changefreq: "monthly", priority: "0.4" },
        ];
        const urls = entries.map((e) =>
          `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
