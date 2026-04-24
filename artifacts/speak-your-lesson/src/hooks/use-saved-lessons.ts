/**
 * Lesson library — persists to localStorage so lessons survive tab switches
 * and page refreshes. The storage layer is isolated here so it can be swapped
 * for Supabase (or any other backend) without touching any component code.
 */

import { useState, useCallback } from "react";
import type { LessonPlan } from "@workspace/api-client-react";

const STORAGE_KEY = "scaffold-lesson-library";

export interface SavedLesson {
  id: string;
  savedAt: string;
  title: string;
  gradeLevel: string;
  widaBand: string;
  topic: string;
  lesson: LessonPlan;
}

function readFromStorage(): SavedLesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedLesson[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(lessons: SavedLesson[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  } catch {
    // localStorage may be full or unavailable (e.g. private browsing)
  }
}

export function useSavedLessons() {
  const [lessons, setLessons] = useState<SavedLesson[]>(readFromStorage);

  const save = useCallback(
    (
      lesson: LessonPlan,
      meta: { gradeLevel: string; widaBand: string; topic: string }
    ): string => {
      const entry: SavedLesson = {
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        title: lesson.title,
        gradeLevel: meta.gradeLevel,
        widaBand: meta.widaBand,
        topic: meta.topic,
        lesson,
      };
      setLessons((prev) => {
        const next = [entry, ...prev];
        writeToStorage(next);
        return next;
      });
      return entry.id;
    },
    []
  );

  const remove = useCallback((id: string): void => {
    setLessons((prev) => {
      const next = prev.filter((l) => l.id !== id);
      writeToStorage(next);
      return next;
    });
  }, []);

  return { lessons, save, remove };
}
