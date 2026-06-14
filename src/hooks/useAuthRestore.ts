import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { UserRole, UserProfile } from "../types";

const STORAGE_KEY = "auth_session";

/**
 * Restores login session from localStorage on app load.
 * Mount once near the app root (e.g. in App.tsx).
 */
export function useAuthRestore() {
  const { setRole, setUserProfile } = useApp();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const session = JSON.parse(raw) as { role: UserRole; profile: UserProfile };
      if (session?.profile && session?.role) {
        setRole(session.role);
        setUserProfile(session.profile);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setRole, setUserProfile]);
}

/** Call this on successful login/register */
export function saveAuthSession(role: UserRole, profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, profile }));
}

/** Call this on logout */
export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEY);
}