/**
 * The theme controller. There are three preferences: "system" follows the
 * device live, and "light" or "dark" is an explicit choice that persists.
 * The pre-paint boot script in the root layout reads the same storage key
 * and sets data-theme and data-lights, so the page never paints in the wrong
 * theme.
 *
 * Changes mark the document as changing (data-theme-changing) before the
 * theme flips, so the stylesheet crossfades even a device setting change.
 * Reduced motion switches instantly. The browser's toolbar colour follows
 * the page.
 *
 * No imports, and nothing runs at load, so the root layout can read the
 * constants below on the server.
 */
export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

export const THEME_STORAGE_KEY = "elias-theme";

/** The page background in each theme: `--stretch-page` in stretch-tokens.css. */
export const TOOLBAR_COLOUR: Record<Theme, string> = { light: "#fbfbf8", dark: "#0d0d12" };

/**
 * Sets the browser's toolbar colour to the page's. The boot script in the root
 * layout makes the meta before first paint; this keeps it current.
 */
export function syncToolbarColour(theme: Theme) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = TOOLBAR_COLOUR[theme];
}

const ROOM_CHANGE_MS = 300;
const darkQuery = "(prefers-color-scheme: dark)";

/**
 * What flipping the switch chooses. It always changes the lights; when the
 * result matches the device, the visitor is back on their device setting
 * rather than pinned to a theme that happens to agree with it.
 */
export function nextPreference(current: ThemePreference, system: Theme): ThemePreference {
  const active = current === "system" ? system : current;
  const next: Theme = active === "dark" ? "light" : "dark";
  return next === system ? "system" : next;
}

export function readPreference(): ThemePreference {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be blocked; the document still knows what was applied.
  }
  const applied = document.documentElement.dataset.theme;
  return applied === "light" || applied === "dark" ? applied : "system";
}

export function systemTheme(): Theme {
  return window.matchMedia(darkQuery).matches ? "dark" : "light";
}

let changeTimer: number | undefined;
let paletteRegistered = false;

/** Register after boot: WebKit can briefly inherit stale colours when @property
 * and the pre-paint preference script both run while the document is parsing. */
function registerPalette() {
  if (paletteRegistered || typeof CSS.registerProperty !== "function") return;
  for (const name of ["page", "ink", "muted", "rule", "card", "cobalt", "on-cobalt", "tile-edge", "tape"]) {
    CSS.registerProperty({ name: `--stretch-${name}`, syntax: "<color>", inherits: true, initialValue: "transparent" });
  }
  paletteRegistered = true;
  // Resolve the current palette before a click or device change supplies its target.
  getComputedStyle(document.documentElement).getPropertyValue("--stretch-page");
}

/** Marks the room as changing, so the stylesheet crossfades it. */
function markRoomChanging() {
  registerPalette();
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.clearTimeout(changeTimer);
  if (reduced) {
    delete root.dataset.themeChanging;
    return;
  }
  root.dataset.themeChanging = "";
  changeTimer = window.setTimeout(
    () => delete root.dataset.themeChanging,
    ROOM_CHANGE_MS + 100,
  );
}

function setLights(theme: Theme) {
  markRoomChanging();
  document.documentElement.dataset.lights = theme === "dark" ? "on" : "off";
  syncToolbarColour(theme);
}

export function applyPreference(preference: ThemePreference) {
  const root = document.documentElement;
  setLights(preference === "system" ? systemTheme() : preference);
  if (preference === "system") delete root.dataset.theme;
  else root.dataset.theme = preference;
  try {
    if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The choice still applies for this visit.
  }
}

export function flipLights() {
  applyPreference(nextPreference(readPreference(), systemTheme()));
}

/** Follows the device appearance while the visitor has made no choice. */
export function watchSystemTheme() {
  registerPalette();
  const media = window.matchMedia(darkQuery);
  const onChange = () => {
    if (readPreference() !== "system") return;
    const lights = systemTheme() === "dark" ? "on" : "off";
    if (document.documentElement.dataset.lights !== lights) setLights(systemTheme());
  };
  media.addEventListener("change", onChange);
  // The device may have changed between the boot script and this listener.
  onChange();
  return () => media.removeEventListener("change", onChange);
}
