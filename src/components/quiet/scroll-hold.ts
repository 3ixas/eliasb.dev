/** A tapped row is held for at least as long as a look takes to open, and never past this, however slowly the page runs. */
const HOLD_MS = 450;
const HOLD_CAP_MS = 1500;

type Hold = { trigger: HTMLElement; top: number; frame: number; stop: () => void };

/*
 * One hold for the whole page. The look that folds away above a tapped row can belong to another closer-look controller (a look
 * in the opening closes when a row in Work is tapped), so the hold, and the count of looks still folding, cannot be a
 * controller's own: whichever controller unmounts the folded look must be able to correct the page in its commit, and the hold
 * must wait for every controller's folds.
 */
let current: Hold | null = null;
const folding = new Map<object, number>();

/**
 * How many looks `owner` (a controller) still has folding or waiting to be unmounted: those scheduled for removal and those removed
 * but not yet committed. A controller reports it when it schedules a removal and again after every commit, so the count falls
 * only once the look is really gone from the page, however far apart the timer and the commit are on a slow one.
 */
export function reportFolding(owner: object, count: number) {
  if (count > 0) folding.set(owner, count);
  else folding.delete(owner);
}

const stillFolding = () => [...folding.values()].some((count) => count > 0);

/** Puts the held row back where it was on screen, if the page has moved it. Run in a commit, so the correction lands with the layout change. */
export function correctHold() {
  // TEMP-DIAG
  const log = ((window as unknown as { __holdLog?: unknown[] }).__holdLog ??= []);
  // A trigger that has left the page (a link was followed) has no position to hold.
  if (!current || !current.trigger.isConnected) {
    log.push({ skipped: !current ? "no hold" : "disconnected" });
    return;
  }
  const shift = current.trigger.getBoundingClientRect().top - current.top;
  const y0 = window.scrollY;
  if (Math.abs(shift) >= 0.5) window.scrollBy({ top: shift, behavior: "instant" });
  log.push({ shift: Math.round(shift * 10) / 10, y0: Math.round(y0), y1: Math.round(window.scrollY), top: Math.round(current.trigger.getBoundingClientRect().top * 10) / 10 });
}

/** Ends the hold in progress: its frame, its listeners and the held row. A new hold and an unmounting controller call it. */
export function stopHold() {
  current?.stop();
}

/**
 * Keeps `trigger` where it is on screen while the looks around it open and fold, frame by frame, until the user takes over the
 * scroll, every folding look has been unmounted, or the cap. (Browsers that anchor scroll already do most of this; setting
 * `overflow-anchor: none` to stop them makes WebKit throw the scroll position back, so it is left alone.)
 */
export function startHold(trigger: HTMLElement) {
  stopHold();
  const started = performance.now();
  let taken = false;
  const take = () => {
    taken = true;
  };
  window.addEventListener("touchstart", take, { once: true, passive: true });
  window.addEventListener("wheel", take, { once: true, passive: true });
  const hold: Hold = {
    trigger,
    top: trigger.getBoundingClientRect().top,
    frame: 0,
    stop: () => {
      window.cancelAnimationFrame(hold.frame);
      window.removeEventListener("touchstart", take);
      window.removeEventListener("wheel", take);
      if (current === hold) current = null;
    },
  };
  current = hold;
  const step = () => {
    // The user's own scroll moves the trigger too, so once they have taken over nothing is measured or corrected.
    if (taken || !trigger.isConnected) return hold.stop();
    correctHold();
    const now = performance.now();
    if (now >= started + HOLD_CAP_MS || (now >= started + HOLD_MS && !stillFolding())) return hold.stop();
    hold.frame = window.requestAnimationFrame(step);
  };
  hold.frame = window.requestAnimationFrame(step);
}
