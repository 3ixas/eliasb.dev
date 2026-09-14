"use client";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  function toggleTheme() {
    const root = document.documentElement;
    const current = root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("elias-theme", next);
  }

  return (
    <button
      type="button"
      className={compact ? "site-theme-toggle" : undefined}
      onClick={toggleTheme}
      aria-label="Switch between light and dark theme"
    >
      {compact ? "◐" : "Switch theme"}
    </button>
  );
}
