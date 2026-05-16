/**
 * Persists the teacher's access code in sessionStorage so they don't have
 * to re-enter it on every page load within the same browser session.
 *
 * The special value "demo" means the user chose to explore without a code.
 * It is handled purely client-side — no demo code is ever sent to the API.
 */

import { useState, useCallback } from "react";

const STORAGE_KEY = "scaffold-access-code";
export const DEMO_CODE = "demo";

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(code: string | null): void {
  try {
    if (code === null) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, code);
    }
  } catch {
    // sessionStorage unavailable — silent fallback
  }
}

export interface UseAccessCode {
  accessCode: string | null;
  isDemo: boolean;
  isUnlocked: boolean;
  unlock: (code: string) => void;
  enterDemo: () => void;
  logout: () => void;
}

export function useAccessCode(): UseAccessCode {
  const [accessCode, setAccessCode] = useState<string | null>(() => readStored());

  const isDemo = accessCode === DEMO_CODE;
  const isUnlocked = accessCode !== null;

  const unlock = useCallback((code: string) => {
    const upper = code.trim().toUpperCase();
    writeStored(upper);
    setAccessCode(upper);
  }, []);

  const enterDemo = useCallback(() => {
    writeStored(DEMO_CODE);
    setAccessCode(DEMO_CODE);
  }, []);

  const logout = useCallback(() => {
    writeStored(null);
    setAccessCode(null);
  }, []);

  return { accessCode, isDemo, isUnlocked, unlock, logout, enterDemo };
}
