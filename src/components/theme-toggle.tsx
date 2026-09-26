"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

const THEME_STORAGE_KEY = "elias-theme";
const THEME_PREFERENCE_EVENT = "elias-theme-preference-change";

function getThemePreference(): ThemePreference {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Fall back to the theme set on the document when storage is unavailable.
  }

  const appliedTheme = document.documentElement.dataset.theme;
  return appliedTheme === "light" || appliedTheme === "dark" ? appliedTheme : "system";
}

function subscribeToThemePreference(listener: () => void) {
  window.addEventListener(THEME_PREFERENCE_EVENT, listener);
  return () => window.removeEventListener(THEME_PREFERENCE_EVENT, listener);
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeToSystemTheme(listener: () => void) {
  const systemAppearance = window.matchMedia("(prefers-color-scheme: dark)");
  systemAppearance.addEventListener("change", listener);
  return () => systemAppearance.removeEventListener("change", listener);
}

function getServerThemePreference(): ThemePreference {
  return "system";
}

function getServerSystemTheme(): Theme {
  return "light";
}

function subscribeToHydrationStatus() {
  return () => {};
}

function getHydrationStatus() {
  return true;
}

function getServerHydrationStatus() {
  return false;
}

function nextThemePreference(current: ThemePreference, systemTheme: Theme): ThemePreference {
  if (current === "system") return systemTheme === "dark" ? "light" : "dark";
  return current === systemTheme ? "system" : systemTheme;
}

function themeName(theme: ThemePreference) {
  return theme === "system" ? "system appearance" : `${theme} mode`;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const preference = useSyncExternalStore(
    subscribeToThemePreference,
    getThemePreference,
    getServerThemePreference,
  );
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getServerSystemTheme,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydrationStatus,
    getHydrationStatus,
    getServerHydrationStatus,
  );
  const nextPreference = nextThemePreference(preference, systemTheme);
  const accessibleName = !hydrated
    ? "Change appearance between system, light, and dark modes."
    : preference === "system"
    ? `Appearance follows your device's ${systemTheme} setting. Activate to use ${themeName(nextPreference)}.`
    : `Appearance is set to ${preference} mode. Activate to use ${themeName(nextPreference)}.`;

  function toggleTheme() {
    const systemThemeNow = getSystemTheme();
    const next = nextThemePreference(preference, systemThemeNow);
    const root = document.documentElement;

    if (next === "system") {
      delete root.dataset.theme;
      try {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {
        // The page still follows the device setting for this visit.
      }
    } else {
      root.dataset.theme = next;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // The chosen appearance still applies for this visit.
      }
    }

    window.dispatchEvent(new Event(THEME_PREFERENCE_EVENT));
  }

  return (
    <button
      type="button"
      className={`site-theme-toggle${compact ? "" : " site-theme-toggle--labelled"}`}
      onClick={toggleTheme}
      aria-label={accessibleName}
      title={accessibleName}
    >
      <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <g className="theme-toggle-rays" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
        </g>
        <circle className="theme-toggle-sun-disc" cx="12" cy="12" r="4.15" fill="currentColor" />
        <path
          className="theme-toggle-moon"
          d="M19.2 15.45A7.4 7.4 0 0 1 8.55 4.8 7.5 7.5 0 1 0 19.2 15.45Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
      {!compact && <span className="theme-toggle-label">{preference === "system" ? "System" : preference}</span>}
    </button>
  );
}
