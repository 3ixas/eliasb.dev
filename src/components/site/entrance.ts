/**
 * The signature entrance (homepage only): the headline types on a blank page,
 * moves up into its place, and the hero and then the rest of the page arrive
 * around it, in about five seconds. The server renders the finished page.
 *
 * Two inline scripts do the work, so nothing waits for React:
 *
 * - `entranceGuardScript` runs before the hero is painted. It marks the
 *   document as entering, unless reduced motion is on, the page is a
 *   back-forward load, or the visitor arrived at a section. While the mark is
 *   there CSS holds every part of the page by opacity, so all of it stays in
 *   the accessibility tree. It also sets the seven-second safety timeout.
 * - `entranceScript` runs once the page's HTML has been parsed and plays the
 *   sequence on a decorative `aria-hidden` layer appended to <body>. It never
 *   edits the page's own markup, so a late hydration has nothing to disagree
 *   with. The real `h1` keeps its full text throughout.
 *
 * Any failure releases the hold at once. Client-side navigation back to `/`
 * never runs either script, because React does not execute scripts it inserts.
 *
 * This module has no imports so `scripts/verify-opening.mjs` can load it.
 */

/** The approved timings from the motion prototype (`prototype/stretch-motion`, tip ff0d834). */
export const entranceTimings = {
  startMs: 200,
  characterMs: 38,
  spaceMs: 28,
  commaPauseMs: 420,
  /** "feel simple." landing, with its underline starting a little after. */
  land: { bounce: 0.3, visualDuration: 0.45 },
  underlineDelayMs: 200,
  underlineMs: 520,
  underlineEase: "cubic-bezier(0.23, 1, 0.32, 1)",
  /** The typed line moving into the h1's place; a fade when that place is below the fold. */
  move: { bounce: 0.15, visualDuration: 0.7 },
  fadeMoveMs: 300,
  /** The name starts this long into the move, and each letter this much after the last. */
  nameDelayMs: 100,
  nameStaggerMs: 35,
  name: { bounce: 0.35, visualDuration: 0.55 },
  nameLift: "0.18em",
  nameStretchFrom: "100%",
  nameStretchTo: "75%",
  /** The portrait starts this long after the name, swinging in from this much further round. */
  portraitDelayMs: 200,
  portrait: { bounce: 0.4, visualDuration: 0.6 },
  portraitSwingDegrees: 6,
  portraitLiftPx: 14,
  label: { bounce: 0.45, visualDuration: 0.3 },
  labelScaleFrom: 1.25,
  /** The header, support line and rest of the page fade in over this long. */
  fadeMs: 500,
  /** If the hold has not been released after this long, the guard releases it. */
  safetyMs: 7000,
  /**
   * The entrance waits at most this long for the page's fonts, so the spots it
   * measures are those of the real typeface. It must leave room under
   * `safetyMs` for the five seconds of the sequence itself.
   */
  fontWaitMs: 1000,
  /** A timer this much later than planned means the page stalled; the entrance gives up. */
  maxLatenessMs: 1000,
} as const;

export type EntranceTimings = typeof entranceTimings;

/**
 * A spring as CSS: the easing curve, how long the curve runs, and when Motion
 * would consider the spring at rest (the moment its `await animate()` resolves).
 */
export type SpringCurve = { easing: string; duration: number; settled: number };

/**
 * Motion's spring({ bounce, visualDuration }) sampled as a CSS linear()
 * easing, for bounce ≥ 0. It mirrors framer-motion's resolution: damping
 * ratio 1 − bounce, natural frequency 2π / (1.2 × visualDuration).
 */
export function springCurve(bounce: number, visualDuration: number): SpringCurve {
  const zeta = Math.max(1 - bounce, 0.05);
  const omega = (2 * Math.PI) / (visualDuration * 1.2);
  // Long enough for Motion's rest test to pass even for the most lightly damped spring here.
  const settle = Math.min(2, Math.log(5000) / (zeta * omega));
  const steps = 40;
  const points: number[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const t = (settle * step) / steps;
    let x: number;
    if (zeta < 1) {
      const damped = omega * Math.sqrt(1 - zeta * zeta);
      x = 1 - Math.exp(-zeta * omega * t) * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
    } else {
      x = 1 - Math.exp(-omega * t) * (1 + omega * t);
    }
    points.push(step === steps ? 1 : Math.round(x * 1000) / 1000);
  }
  // Motion's rest test: within 0.005 of the target and slower than 0.01 per second.
  let settled = 0;
  for (let ms = 0; ms <= settle * 1000; ms += 1) {
    const t = ms / 1000;
    const decay = Math.exp(-zeta * omega * t);
    let offset: number;
    let velocity: number;
    if (zeta < 1) {
      const damped = omega * Math.sqrt(1 - zeta * zeta);
      offset = decay * (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
      velocity = decay * ((omega * omega) / damped) * Math.sin(damped * t);
    } else {
      offset = decay * (1 + omega * t);
      velocity = decay * omega * omega * t;
    }
    if (Math.abs(offset) <= 0.005 && Math.abs(velocity) <= 0.01) {
      settled = ms;
      break;
    }
  }
  return { easing: `linear(${points.join(", ")})`, duration: Math.round(settle * 1000), settled: settled || Math.round(settle * 1000) };
}

/**
 * Marks the document as entering, or does nothing. Self-contained: it is
 * serialised into an inline script, so it takes everything it needs as
 * arguments and touches only the document element.
 */
export function holdPage(safetyMs: number) {
  const root = document.documentElement;
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    navigation?.type === "back_forward" ||
    (location.hash && location.hash !== "#top") ||
    document.hidden ||
    typeof Element.prototype.animate !== "function"
  ) {
    return;
  }
  const release = () => root.removeAttribute("data-entering");
  root.setAttribute("data-entering", "");
  window.setTimeout(release, safetyMs);
  // Someone tabbing around would land on held, invisible controls: the first Tab shows the page.
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    release();
    window.removeEventListener("keydown", onKey, true);
  };
  window.addEventListener("keydown", onKey, true);
  // A page restored from the back-forward cache is shown as it was left.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) release();
  });
}

/**
 * Calls `play` once the page's fonts have loaded, or after `waitMs`, whichever
 * comes first. The entrance measures the headline and the name once, up front;
 * measured in the fallback font on a slow connection, the typed line would land
 * in the wrong place and the page would jump when the real font arrived.
 * Self-contained: it is serialised into an inline script.
 */
export function whenFontsReady(play: () => void, waitMs: number) {
  const fonts = document.fonts;
  // Reading a layout value makes the page request the fonts it uses.
  void document.documentElement.offsetHeight;
  if (!fonts || fonts.status !== "loading") {
    play();
    return;
  }
  let played = false;
  const once = () => {
    if (played) return;
    played = true;
    play();
  };
  window.setTimeout(once, waitMs);
  fonts.ready.then(once, once);
}

/** Plays the entrance. Self-contained: it is serialised into an inline script. */
export function runEntrance(spring: (bounce: number, visualDuration: number) => SpringCurve, timing: EntranceTimings) {
  const root = document.documentElement;
  // Nothing was held, so there is nothing to play.
  if (!root.hasAttribute("data-entering")) return;

  const part = (name: string) => document.querySelector<HTMLElement>(`[data-entrance~="${name}"]`);
  const heading = part("headline");
  const name = part("name");
  const portrait = part("portrait");
  const label = portrait?.querySelector<HTMLElement>("figcaption");
  if (!heading || !name || !portrait || !label) {
    root.removeAttribute("data-entering");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timers: number[] = [];
  const animations: Animation[] = [];
  let layer: HTMLElement | undefined;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    animations.forEach((animation) => animation.cancel());
    layer?.remove();
    root.removeAttribute("data-released");
    root.removeAttribute("data-entering");
    reducedMotion.removeEventListener("change", finish);
    document.removeEventListener("visibilitychange", onVisibility);
  };
  const onVisibility = () => {
    if (document.hidden) finish();
  };
  const release = (...parts: string[]) => {
    root.setAttribute("data-released", `${root.getAttribute("data-released") ?? ""} ${parts.join(" ")}`.trim());
  };

  // If the page stalls (a long task holds the timers back) the entrance gives
  // up and shows the finished page rather than a half-played one.
  const startedAt = performance.now();
  const later = (callback: () => void, delay: number) => {
    timers.push(
      window.setTimeout(() => {
        try {
          // A hero that has left the page (client-side navigation), a hold
          // released by someone else (the safety timeout, a restored page),
          // or a late timer all end the entrance.
          if (!heading.isConnected || !root.hasAttribute("data-entering") || performance.now() - startedAt - delay > timing.maxLatenessMs) {
            finish();
          } else {
            callback();
          }
        } catch {
          finish();
        }
      }, delay),
    );
  };
  const animate = (element: Element, keyframes: Keyframe[], options: { duration: number; easing: string; delay?: number }) => {
    let animation: Animation;
    try {
      animation = element.animate(keyframes, { ...options, fill: "both" });
    } catch {
      // Browsers without linear() easing get a plain ease-out of similar length.
      animation = element.animate(keyframes, { ...options, duration: options.duration * 0.6, easing: "ease-out", fill: "both" });
    }
    animations.push(animation);
    return animation;
  };
  const angleOf = (element: Element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  };

  try {
    const target = heading.getBoundingClientRect();
    const nameBox = name.getBoundingClientRect();
    const portraitAngle = angleOf(portrait);
    const labelAngle = angleOf(label);

    // The decorative layer: the typed line, then the name's letters.
    layer = document.createElement("div");
    layer.className = "stretch-entrance";
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-entrance-layer", "");

    // The line holds the whole sentence, with the untyped part transparent, so
    // its lines break exactly where the finished heading's do.
    const emphasis = heading.querySelector("em");
    const text = heading.textContent ?? "";
    const lead = emphasis ? text.slice(0, text.length - (emphasis.textContent ?? "").length).trim() : "";
    if (!lead || !emphasis) throw new Error("The headline is not as expected");
    const line = document.createElement("p");
    line.className = "stretch-entrance__line";
    line.style.width = `${target.width}px`;
    line.style.left = `${Math.max(0, (innerWidth - target.width) / 2)}px`;
    line.style.top = `${Math.max(0, (innerHeight - target.height) / 2)}px`;
    const typed = document.createElement("span");
    typed.setAttribute("data-entrance-typed", "");
    const caret = document.createElement("span");
    caret.className = "stretch-entrance__caret";
    caret.append(document.createElement("span"));
    const rest = document.createElement("span");
    rest.className = "stretch-entrance__untyped";
    rest.textContent = `${lead} `;
    const land = emphasis.cloneNode(true) as HTMLElement;
    land.style.opacity = "0";
    const path = land.querySelector<SVGPathElement>("path");
    const length = path?.getTotalLength() ?? 0;
    if (path) {
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    }
    line.append(typed, caret, rest, land);

    // The name, split into letters over the held real one, lower and wider.
    const display = document.createElement("p");
    display.className = "stretch-display stretch-entrance__name";
    display.style.left = `${nameBox.left}px`;
    display.style.top = `${nameBox.top}px`;
    display.style.width = `${nameBox.width}px`;
    display.style.visibility = "hidden";
    const letters: HTMLElement[] = [];
    for (const word of (name.textContent ?? "").trim().split(/\s+/)) {
      const row = document.createElement("span");
      for (const character of word) {
        const letter = document.createElement("i");
        letter.textContent = character;
        row.append(letter);
        letters.push(letter);
      }
      display.append(row);
    }
    layer.append(line, display);
    document.body.append(layer);

    reducedMotion.addEventListener("change", finish);
    document.addEventListener("visibilitychange", onVisibility);

    const characters = [...rest.textContent!];
    const commaAt = characters.indexOf(",");
    let elapsed = timing.startMs;
    characters.forEach((character, index) => {
      later(() => {
        typed.textContent += character;
        rest.textContent = rest.textContent!.slice(character.length);
      }, elapsed);
      elapsed += character === " " ? timing.spaceMs : timing.characterMs;
      if (index === commaAt) {
        later(() => caret.classList.add("stretch-entrance__caret--blink"), elapsed);
        elapsed += timing.commaPauseMs;
        later(() => caret.classList.remove("stretch-entrance__caret--blink"), elapsed);
      }
    });

    // "feel simple." lands while its underline is already drawing.
    const landing = spring(timing.land.bounce, timing.land.visualDuration);
    later(() => {
      caret.remove();
      land.style.opacity = "";
      animate(land, [{ opacity: 0, transform: "translateY(14px) rotate(-2deg)" }, { opacity: 1, transform: "translateY(0) rotate(0deg)" }], landing);
      if (path) {
        animate(path, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
          duration: timing.underlineMs,
          easing: timing.underlineEase,
          delay: timing.underlineDelayMs,
        });
      }
    }, elapsed);
    elapsed += Math.max(landing.settled, timing.underlineDelayMs + timing.underlineMs);

    // The line moves up into the headline's place, and the hero arrives around it.
    const moveStart = elapsed;
    const fits = target.top >= 0 && target.bottom <= innerHeight - 24;
    const moving = spring(timing.move.bounce, timing.move.visualDuration);
    const moveMs = fits ? moving.settled : timing.fadeMoveMs;
    later(() => {
      if (fits) {
        // Measured now, in case the visitor has scrolled since the entrance began.
        const from = line.getBoundingClientRect();
        const place = heading.getBoundingClientRect();
        animate(line, [{ transform: "translate(0, 0)" }, { transform: `translate(${place.left - from.left}px, ${place.top - from.top}px)` }], moving);
      } else {
        animate(line, [{ opacity: 1 }, { opacity: 0 }], { duration: timing.fadeMoveMs, easing: "ease-out" });
      }
    }, moveStart);

    const nameStart = moveStart + timing.nameDelayMs;
    const nameSettle = spring(timing.name.bounce, timing.name.visualDuration);
    const nameEnd = nameStart + (letters.length - 1) * timing.nameStaggerMs + nameSettle.settled;
    later(() => {
      display.style.visibility = "";
      letters.forEach((letter, index) => {
        animate(
          letter,
          [
            { transform: `translateY(${timing.nameLift})`, fontStretch: timing.nameStretchFrom },
            { transform: "translateY(0)", fontStretch: timing.nameStretchTo },
          ],
          { ...nameSettle, delay: index * timing.nameStaggerMs },
        );
      });
      // The layer shows the name from its first frame; the real one is released
      // when the letters are home, with no fade, so the hand-over does not blink.
    }, nameStart);
    later(() => {
      display.remove();
      release("name");
    }, nameEnd);

    const portraitStart = nameStart + timing.portraitDelayMs;
    const portraitSettle = spring(timing.portrait.bounce, timing.portrait.visualDuration);
    const portraitEnd = portraitStart + portraitSettle.settled;
    later(() => {
      animate(
        portrait,
        [
          { transform: `rotate(${portraitAngle + timing.portraitSwingDegrees}deg) translateY(-${timing.portraitLiftPx}px)` },
          { transform: `rotate(${portraitAngle}deg) translateY(0)` },
        ],
        portraitSettle,
      );
      animate(label, [{ transform: `rotate(${labelAngle}deg) scale(${timing.labelScaleFrom})` }], { duration: 0, easing: "linear" });
      release("portrait");
    }, portraitStart);

    // When the line is home the real headline takes over from it, the label presses on,
    // and the header and support line fade in.
    const moveEnd = moveStart + moveMs;
    const labelPress = spring(timing.label.bounce, timing.label.visualDuration);
    later(() => {
      release("headline", "header", "support");
      line.remove();
      animate(
        label,
        [
          { transform: `rotate(${labelAngle}deg) scale(${timing.labelScaleFrom})` },
          { transform: `rotate(${labelAngle}deg) scale(1)` },
        ],
        labelPress,
      );
    }, moveEnd);

    // The rest of the page follows once the name and portrait have settled.
    const restStart = Math.max(nameEnd, portraitEnd, moveEnd);
    later(() => release("rest"), restStart);
    later(finish, restStart + timing.fadeMs);
  } catch {
    finish();
  }
}

/** The inline script that marks the page as entering, before it is painted. */
export const entranceGuardScript = `try{(${holdPage.toString()})(${entranceTimings.safetyMs})}catch(_){document.documentElement.removeAttribute("data-entering")}`;

/** The inline script that plays the entrance. */
export const entranceScript = `try{(${whenFontsReady.toString()})(function(){try{(${runEntrance.toString()})(${springCurve.toString()},${JSON.stringify(entranceTimings)})}catch(_){document.documentElement.removeAttribute("data-entering")}},${entranceTimings.fontWaitMs})}catch(_){document.documentElement.removeAttribute("data-entering")}`;
