/**
 * The theme controller. There are three preferences: "system" follows the
 * device live, and "light" or "dark" is an explicit choice that persists.
 * The pre-paint boot script in the root layout reads the same storage key
 * and sets data-theme and data-lights, so the page never paints in the wrong
 * theme.
 *
 * A press of the theme control pours the change from the control (#466): a
 * view transition whose light page spreads out of it or is drawn back into it
 * (shell.css, "Theme change"). Every other change, and a press where the
 * browser has no view transitions, marks the document as changing
 * (data-theme-changing) before the theme flips, so the stylesheet crossfades
 * it. Reduced motion switches instantly. The browser's toolbar colour follows
 * the page.
 *
 * No imports, and nothing runs at load, so the root layout can read the
 * constants below on the server.
 */
export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

export const THEME_STORAGE_KEY = "elias-theme";

/** The page background in each theme: `--page` in tokens.css. */
export const TOOLBAR_COLOUR: Record<Theme, string> = { light: "#eeede9", dark: "#0d0d0f" };

/**
 * Sets the browser's toolbar colour to the page's. The boot script in the root
 * layout makes the meta before first paint; this keeps it current.
 */
export function syncToolbarColour(theme: Theme) {
  setToolbar(TOOLBAR_COLOUR[theme]);
}

function setToolbar(colour: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = colour;
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
  // tokens.css: the palette, and the greeting's sun.
  const palette = ["page", "paper", "ink", "muted", "hair", "tint", "cobalt", "green", "year-0", "year-1", "year-2", "year-3", "year-4", "stock", "stock-end", "shadow"].map((name) => `--${name}`);
  for (const name of ["--sun", ...palette]) {
    CSS.registerProperty({ name, syntax: "<color>", inherits: true, initialValue: "transparent" });
  }
  paletteRegistered = true;
  // Resolve the current palette before a click or device change supplies its target.
  getComputedStyle(document.documentElement).getPropertyValue("--page");
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

/** How a change is shown: the palette's crossfade, or a pour, whose layers are the finished themes. */
type Change = "crossfade" | "pour";

function setLights(theme: Theme, change: Change) {
  // A pour sets the toolbar colour when it ends.
  if (change === "crossfade") {
    markRoomChanging();
    syncToolbarColour(theme);
  }
  document.documentElement.dataset.lights = theme === "dark" ? "on" : "off";
}

function applyPreference(preference: ThemePreference, change: Change): Theme {
  const root = document.documentElement;
  const theme = preference === "system" ? systemTheme() : preference;
  setLights(theme, change);
  if (preference === "system") delete root.dataset.theme;
  else root.dataset.theme = preference;
  try {
    if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The choice still applies for this visit.
  }
  return theme;
}

/** The light page's soft edge, as a share of the pour's radius. */
const POUR_SOFTNESS = 0.22;
let pouring: { transition: ViewTransition; control: Element } | undefined;
let rerouting = false;

/**
 * The theme control's press. Where the browser has view transitions and motion is on, the light pours out of the
 * control or is drawn back into it, from its centre to the viewport's farthest corner, and the function returns
 * true. Otherwise the theme crossfades (instantly with reduced motion) and it returns false.
 */
export function pourLights(control: Element): boolean {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    applyPreference(nextPreference(readPreference(), systemTheme()), "crossfade");
    return false;
  }
  // A press mid-pour finishes the first change at once; this one starts from the control.
  pouring?.transition.skipTransition();
  rerouteTaps();
  const root = document.documentElement;
  const box = control.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  const far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const soft = far * POUR_SOFTNESS;
  root.style.setProperty("--pour-x", `${x}px`);
  root.style.setProperty("--pour-y", `${y}px`);
  root.style.setProperty("--pour-soft", `${soft}px`);
  root.style.setProperty("--pour-reach", `${far + soft}px`);

  // Read the preference inside the update, after any change still waiting for its own, so two quick presses are two flips.
  const transition = document.startViewTransition(() => {
    const theme = applyPreference(nextPreference(readPreference(), systemTheme()), "pour");
    root.dataset.pour = theme === "light" ? "out" : "in";
  });
  const current = { transition, control };
  pouring = current;
  // The browser's toolbar follows the page's background, which shell.css moves with the light.
  const follow = () => {
    if (pouring !== current) return;
    if (root.dataset.pour) setToolbar(getComputedStyle(root).backgroundColor);
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
  transition.finished.finally(() => {
    if (pouring !== current) return;
    pouring = undefined;
    delete root.dataset.pour;
    syncToolbarColour(root.dataset.lights === "on" ? "dark" : "light");
  });
  return true;
}

/**
 * While a pour runs, the page is a picture the browser draws over everything, and a tap lands on the document rather
 * than the control. A tap where the control is (with its 4 px reach) still presses it.
 */
function rerouteTaps() {
  if (rerouting) return;
  rerouting = true;
  document.addEventListener("click", (event) => {
    if (!pouring || event.target !== document.documentElement) return;
    const box = pouring.control.getBoundingClientRect();
    const inside = event.clientX >= box.left - 4 && event.clientX <= box.right + 4 && event.clientY >= box.top - 4 && event.clientY <= box.bottom + 4;
    if (inside) pourLights(pouring.control);
  });
}

/** Follows the device appearance while the visitor has made no choice. */
export function watchSystemTheme() {
  registerPalette();
  const media = window.matchMedia(darkQuery);
  const onChange = () => {
    if (readPreference() !== "system") return;
    const lights = systemTheme() === "dark" ? "on" : "off";
    if (document.documentElement.dataset.lights !== lights) setLights(systemTheme(), "crossfade");
  };
  media.addEventListener("change", onChange);
  // The device may have changed between the boot script and this listener.
  onChange();
  return () => media.removeEventListener("change", onChange);
}
