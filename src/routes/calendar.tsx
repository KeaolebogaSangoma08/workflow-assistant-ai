import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Plus, Clock, Trash2, ExternalLink } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — AI Workplace Assistant" }] }),
  component: CalendarPage,
});

type Event = { id: string; title: string; date: string; time: string; type: "Meeting" | "Deadline" | "Reminder" };
const TYPE_COLORS: Record<string, string> = {
  Meeting: "bg-primary/15 text-primary border-primary/30",
  Deadline: "bg-destructive/15 text-destructive border-destructive/30",
  Reminder: "bg-warning/20 text-warning border-warning/30",
};

function gcalLink(e: Event) {
  const start = `${e.date.replace(/-/g, "")}T${(e.time || "09:00").replace(":", "")}00`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${start}/${start}`;
}
function outlookLink(e: Event) {
  const dt = `${e.date}T${e.time || "09:00"}:00`;
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(e.title)}&startdt=${dt}&enddt=${dt}`;
}

function CalendarPage() {
  const { t } = useLanguage();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Event, "id">>({ title: "", date: today.toISOString().slice(0, 10), time: "09:00", type: "Meeting" });

  useEffect(() => { setEvents(JSON.parse(localStorage.getItem("cal_events") || "[]")); }, []);
  const save = (list: Event[]) => { setEvents(list); localStorage.setItem("cal_events", JSON.stringify(list)); };
  const add = () => { if (!form.title.trim()) return; save([...events, { id: crypto.randomUUID(), ...form }]); setOpen(false); setForm({ ...form, title: "" }); };

  const year = cursor.getFullYear(), month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const upcoming = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <ToolShell title={t("calendar")} description="Meetings, deadlines and reminders with date and time." icon={CalendarDays}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild><a href="https://calendar.google.com" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Google Calendar</a></Button>
        <Button variant="outline" asChild><a href="https://outlook.live.com/calendar" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> Outlook Calendar</a></Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="ml-auto gradient-primary text-primary-foreground"><Plus className="size-4" /> Add event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label className="text-xs">Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Event["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Meeting", "Deadline", "Reminder"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button className="gradient-primary text-primary-foreground" onClick={add}>Save event</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</Button>
            <h2 className="font-semibold">{monthName}</h2>
            <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const ds = fmt(d);
              const dayEvents = events.filter((e) => e.date === ds);
              const isToday = ds === today.toISOString().slice(0, 10);
              return (
                <div key={i} className={`min-h-16 rounded-lg border p-1 text-left text-xs ${isToday ? "border-primary bg-primary/5" : "border-transparent bg-muted/30"}`}>
                  <div className={`mb-0.5 font-medium ${isToday ? "text-primary" : ""}`}>{d}</div>
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} className={`mb-0.5 truncate rounded px-1 py-0.5 ${TYPE_COLORS[e.type]}`}>{e.time} {e.title}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-muted-foreground">+{dayEvents.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="mb-3 font-semibold">Upcoming</h2>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No events yet.</p> : (
            <div className="space-y-2">
              {upcoming.map((e) => (
                <div key={e.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {e.date} · {e.time}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${TYPE_COLORS[e.type]}`}>{e.type}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <a className="text-xs text-primary hover:underline" href={gcalLink(e)} target="_blank" rel="noreferrer">+ Google</a>
                    <a className="text-xs text-primary hover:underline" href={outlookLink(e)} target="_blank" rel="noreferrer">+ Outlook</a>
                    <button className="ml-auto text-muted-foreground hover:text-destructive" onClick={() => save(events.filter((x) => x.id !== e.id))}><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
}
