/** A tapped row is held for at least as long as a look takes to open, and never past this, however slowly the page runs. */
const HOLD_MS = 450;
const HOLD_CAP_MS = 1500;

/** A scroll the hold is carrying out: its held row's place on screen moves from `from` to `to` over `ms`, from `start`. */
type Glide = { from: number; to: number; start: number; ms: number };
type Hold = { trigger: HTMLElement; top: number; frame: number; glide?: Glide; stop: () => void };

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
  // A trigger that has left the page (a link was followed) has no position to hold.
  if (!current || !current.trigger.isConnected) return;
  const shift = current.trigger.getBoundingClientRect().top - current.top;
  if (Math.abs(shift) >= 0.5) window.scrollBy({ top: shift, behavior: "instant" });
}

/**
 * Moves the held row up the screen by `by` px over `ms` (0 for at once), so a look opened low on the page comes into view. The
 * hold carries the scroll out, so the two never pull the page in different directions, and the visitor's own scroll ends both.
 */
export function glideHold(by: number, ms: number) {
  if (!current || by <= 0) return;
  if (ms <= 0) {
    current.top -= by;
    correctHold();
    return;
  }
  current.glide = { from: current.top, to: current.top - by, start: performance.now(), ms };
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
  window.addEventListener("keydown", take, { once: true });
  const hold: Hold = {
    trigger,
    top: trigger.getBoundingClientRect().top,
    frame: 0,
    stop: () => {
      window.cancelAnimationFrame(hold.frame);
      window.removeEventListener("touchstart", take);
      window.removeEventListener("wheel", take);
      window.removeEventListener("keydown", take);
      if (current === hold) current = null;
    },
  };
  current = hold;
  const step = () => {
    // The user's own scroll moves the trigger too, so once they have taken over nothing is measured or corrected.
    if (taken || !trigger.isConnected) return hold.stop();
    const now = performance.now();
    const { glide } = hold;
    if (glide) {
      const done = Math.min(1, (now - glide.start) / glide.ms);
      hold.top = glide.from + (glide.to - glide.from) * (1 - (1 - done) ** 3);
      if (done === 1) hold.glide = undefined;
    }
    correctHold();
    if (now >= started + HOLD_CAP_MS || (now >= started + HOLD_MS && !stillFolding() && !hold.glide)) return hold.stop();
    hold.frame = window.requestAnimationFrame(step);
  };
  hold.frame = window.requestAnimationFrame(step);
}
