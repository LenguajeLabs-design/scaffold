/**
 * Copilot session library — persists to localStorage so sessions survive tab
 * switches and page refreshes. Mirrors the shape of use-saved-lessons.ts so
 * both can be swapped for a server-side store together when auth is added.
 */

import { useState, useCallback } from "react";
import type { ClassroomSupport } from "@workspace/api-client-react";

const STORAGE_KEY = "scaffold-copilot-sessions";

export interface SavedCopilotSession {
  id: string;
  savedAt: string;
  /** First 80 chars of the teacher's question — used as a display label. */
  preview: string;
  gradeLevel: string;
  widaLevel: string;
  need: string;
  support: ClassroomSupport;
}

function readFromStorage(): SavedCopilotSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedCopilotSession[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(sessions: SavedCopilotSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage may be full or unavailable (e.g. private browsing)
  }
}

export function useSavedCopilotSessions() {
  const [sessions, setSessions] = useState<SavedCopilotSession[]>(readFromStorage);

  const save = useCallback(
    (
      support: ClassroomSupport,
      meta: { gradeLevel: string; widaLevel: string; need: string }
    ): string => {
      const entry: SavedCopilotSession = {
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        preview: meta.need.trim().slice(0, 80),
        gradeLevel: meta.gradeLevel,
        widaLevel: meta.widaLevel,
        need: meta.need,
        support,
      };
      setSessions((prev) => {
        const next = [entry, ...prev];
        writeToStorage(next);
        return next;
      });
      return entry.id;
    },
    []
  );

  const remove = useCallback((id: string): void => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      writeToStorage(next);
      return next;
    });
  }, []);

  return { sessions, save, remove };
}
