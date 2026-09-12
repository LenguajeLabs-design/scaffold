/**
 * Persists the teacher's access code in sessionStorage so they don't have
 * to re-enter it on every page load within the same browser session.
 *
 * The special value "demo" means the user chose to explore without a code.
 * It is handled purely client-side — no demo code is ever sent to the API.
 */

import { useState, useCallback, useEffect } from "react";

import { clearCredential, getCredential } from "@/lib/auth-session";

const STORAGE_KEY = "scaffold-access-code";
export const DEMO_CODE = "demo";

function readStored(): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored === DEMO_CODE || getCredential() ? stored : null;
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
  isAdmin: boolean;
  unlock: (code: string, admin?: boolean) => void;
  enterDemo: () => void;
  logout: () => void;
}

export function useAccessCode(): UseAccessCode {
  const [accessCode, setAccessCode] = useState<string | null>(() => readStored());

  const [isAdmin, setAdmin] = useState(false);
  useEffect(() => {
    const reset = () => { setAccessCode(null); setAdmin(false); writeStored(null); };
    window.addEventListener("scaffold-signout", reset);
    return () => window.removeEventListener("scaffold-signout", reset);
  }, []);

  const isDemo = accessCode === DEMO_CODE;
  const isUnlocked = accessCode !== null;

  const unlock = useCallback((code: string, admin = false) => {
    setAdmin(admin);
    const upper = code.trim().toUpperCase();
    writeStored(upper);
    setAccessCode(upper);
  }, []);

  const enterDemo = useCallback(() => {
    writeStored(DEMO_CODE);
    setAccessCode(DEMO_CODE);
  }, []);

  const logout = useCallback(() => {
    setAdmin(false);
    clearCredential();
    writeStored(null);
    setAccessCode(null);
  }, []);

  return { accessCode, isAdmin, isDemo, isUnlocked, unlock, logout, enterDemo };
}
