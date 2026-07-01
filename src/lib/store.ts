import { useCallback, useEffect, useState } from "react";

export type SavedItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: number;
};

const SAVED_KEY = "saved_items";
const STATS_KEY = "usage_stats";

export type Stats = {
  aiRequests: number;
  emails: number;
  summaries: number;
  documents: number;
  tasks: number;
  research: number;
};

const DEFAULT_STATS: Stats = { aiRequests: 0, emails: 0, summaries: 0, documents: 0, tasks: 0, research: 0 };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function bumpStat(key: keyof Stats) {
  const s = read<Stats>(STATS_KEY, DEFAULT_STATS);
  s.aiRequests += 1;
  s[key] += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("stats-updated"));
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  useEffect(() => {
    const load = () => setStats(read<Stats>(STATS_KEY, DEFAULT_STATS));
    load();
    window.addEventListener("stats-updated", load);
    return () => window.removeEventListener("stats-updated", load);
  }, []);
  return stats;
}

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);
  useEffect(() => {
    const load = () => setItems(read<SavedItem[]>(SAVED_KEY, []));
    load();
    window.addEventListener("saved-updated", load);
    return () => window.removeEventListener("saved-updated", load);
  }, []);

  const add = useCallback((item: Omit<SavedItem, "id" | "createdAt">) => {
    const list = read<SavedItem[]>(SAVED_KEY, []);
    list.unshift({ ...item, id: crypto.randomUUID(), createdAt: Date.now() });
    localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 200)));
    window.dispatchEvent(new Event("saved-updated"));
  }, []);

  const remove = useCallback((id: string) => {
    const list = read<SavedItem[]>(SAVED_KEY, []).filter((i) => i.id !== id);
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("saved-updated"));
  }, []);

  return { items, add, remove };
}

export type TaskItem = {
  id: string;
  task: string;
  owner: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Done";
};

const TASKS_KEY = "tasks";
export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  useEffect(() => {
    const load = () => setTasks(read<TaskItem[]>(TASKS_KEY, []));
    load();
    window.addEventListener("tasks-updated", load);
    return () => window.removeEventListener("tasks-updated", load);
  }, []);
  const save = useCallback((list: TaskItem[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("tasks-updated"));
  }, []);
  const addMany = useCallback((newTasks: TaskItem[]) => {
    const list = read<TaskItem[]>(TASKS_KEY, []);
    save([...newTasks, ...list]);
  }, [save]);
  return { tasks, save, addMany };
}
