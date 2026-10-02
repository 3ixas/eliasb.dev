/**
 * The opening: the headline types in, "feel simple." lands, the highlight
 * draws, and the card is pinned to the wall. Timings come from the approved
 * motion prototype (opening B, on the prototype/board-motion branch).
 *
 * It runs as an inline script straight after the hero's HTML, so the card is
 * lifted from the first frame without waiting for the page's JavaScript, and
 * React never runs it on client-side navigation. The server-rendered heading
 * is never changed: a decorative, aria-hidden copy types over it, and any
 * failure removes the copy and shows the finished heading.
 */

/**
 * The opening's timings, approved by feel in the motion prototype (opening B).
 * This module has no imports so the verifier can load it directly.
 */
export const openingTimings = {
  startMs: 450,
  characterMs: 38,
  spaceMs: 28,
  commaPauseMs: 420,
  /** "feel simple." landing. */
  land: { bounce: 0.3, visualDuration: 0.45 },
  highlightMs: 520,
  highlightEase: "cubic-bezier(0.23, 1, 0.32, 1)",
  /** The card settling onto the wall, and the pin pressing in. */
  settle: { bounce: 0.25, visualDuration: 0.45 },
  press: { bounce: 0.35, visualDuration: 0.35 },
  shadowMs: 350,
} as const;

export type OpeningTimings = typeof openingTimings;

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
  const settle = Math.min(2, Math.log(1000) / (zeta * omega));
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

/** Plays the opening. Self-contained: it is serialised into an inline script. */
export function runOpening(spring: (bounce: number, visualDuration: number) => SpringCurve, timing: OpeningTimings) {
  const root = document.documentElement;
  const card = document.querySelector<HTMLElement>("[data-opening-card] [data-pin]");
  const heading = card?.querySelector("h1");
  const layer = heading?.querySelector<HTMLElement>("[data-opening-layer]");
  const lead = heading?.querySelector("[data-opening-lead]")?.textContent ?? "";
  const emphasis = heading?.querySelector("[data-opening-emphasis]");
  const pin = card?.querySelector<SVGSVGElement>(":scope > [data-fixing-mark]");
  if (!card || !heading || !layer || !emphasis || !pin || !lead) return;

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (
    navigation?.type === "back_forward" ||
    (location.hash && location.hash !== "#top") ||
    reducedMotion.matches ||
    document.hidden ||
    typeof card.animate !== "function" ||
    // The heading is only hidden behind the copy through :has().
    !CSS.supports("selector(:has(*))")
  ) {
    return;
  }


  const timers: number[] = [];
  const animations: Animation[] = [];
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    animations.forEach((animation) => animation.cancel());
    root.removeAttribute("data-opening");
    layer.textContent = "";
    reducedMotion.removeEventListener("change", finish);
    document.removeEventListener("visibilitychange", onVisibility);
  };
  const onVisibility = () => {
    if (document.hidden) finish();
  };
  // If the page stalls (a long task holds the timers back), the opening gives
  // up and shows the finished heading rather than a half-typed one.
  const MAX_LATENESS_MS = 1000;
  const startedAt = performance.now();
  const later = (callback: () => void, delay: number) => {
    timers.push(
      window.setTimeout(() => {
        try {
          // A card that has left the page (client-side navigation) ends it too.
          if (!card.isConnected || performance.now() - startedAt - delay > MAX_LATENESS_MS) finish();
          else callback();
        } catch {
          finish();
        }
      }, delay),
    );
  };
  const animate = (element: Element, keyframes: Keyframe[], timing: { duration: number; easing: string }) => {
    let animation: Animation;
    try {
      animation = element.animate(keyframes, { ...timing, fill: "both" });
    } catch {
      // Browsers without linear() easing get a plain ease-out of similar length.
      animation = element.animate(keyframes, { duration: timing.duration * 0.6, easing: "ease-out", fill: "both" });
    }
    animations.push(animation);
    return animation;
  };

  try {
    // Resting values, read before anything moves.
    const resting = getComputedStyle(card);
    const restRotate = resting.rotate === "none" ? "0deg" : resting.rotate;
    const restShadow = resting.boxShadow;
    const liftShadow = resting.getPropertyValue("--shadow-pin-lift");
    const pinX = getComputedStyle(pin).translate.split(" ")[0] || "0px";
    const lifted = { translate: "0 -8px", rotate: "-1.1deg", scale: "1.012" };
    const settled = { translate: "0 0", rotate: restRotate, scale: "1" };
    const pinUp = { opacity: "0", translate: `${pinX} -18px`, scale: "1.15" };
    const pinIn = { opacity: "1", translate: `${pinX} 0px`, scale: "1" };

    // The decorative copy holds the whole sentence, with the untyped part
    // transparent, so its lines break exactly where the finished heading's do.
    const typed = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "board-caret";
    caret.append(document.createElement("span"));
    const rest = document.createElement("span");
    rest.className = "board-untyped";
    rest.textContent = `${lead} `;
    const land = emphasis.cloneNode(true) as HTMLElement;
    land.removeAttribute("data-opening-emphasis");
    land.removeAttribute("data-opening-source");
    land.style.opacity = "0";
    const path = land.querySelector<SVGPathElement>("path");
    const length = path?.getTotalLength() ?? 0;
    if (path) {
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    }
    layer.replaceChildren(typed, caret, rest, land);

    root.setAttribute("data-opening", "");
    animations.push(card.animate([{ ...lifted, boxShadow: liftShadow }], { duration: 0, fill: "forwards" }));
    animations.push(pin.animate([pinUp], { duration: 0, fill: "forwards" }));
    reducedMotion.addEventListener("change", finish);
    document.addEventListener("visibilitychange", onVisibility);

    const characters = [...rest.textContent];
    const commaAt = characters.indexOf(",");
    let elapsed = timing.startMs;
    characters.forEach((character, index) => {
      later(() => {
        typed.textContent += character;
        rest.textContent = rest.textContent!.slice(character.length);
      }, elapsed);
      elapsed += character === " " ? timing.spaceMs : timing.characterMs;
      if (index === commaAt) {
        later(() => caret.classList.add("board-caret-blink"), elapsed);
        elapsed += timing.commaPauseMs;
        later(() => caret.classList.remove("board-caret-blink"), elapsed);
      }
    });

    const landing = spring(timing.land.bounce, timing.land.visualDuration);
    later(() => {
      caret.remove();
      land.style.opacity = "";
      animate(land, [{ opacity: 0, translate: "0 14px", rotate: "-2deg" }, { opacity: 1, translate: "0 0", rotate: "0deg" }], landing);
    }, elapsed);
    // As in the prototype, the highlight waits until the words have landed.
    elapsed += landing.settled;

    later(() => {
      if (path) animate(path, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: timing.highlightMs, easing: timing.highlightEase });
    }, elapsed);
    elapsed += timing.highlightMs;

    const settle = spring(timing.settle.bounce, timing.settle.visualDuration);
    const press = spring(timing.press.bounce, timing.press.visualDuration);
    later(() => {
      animate(card, [lifted, settled], settle);
      animate(card, [{ boxShadow: liftShadow }, { boxShadow: restShadow }], { duration: timing.shadowMs, easing: timing.highlightEase });
      animate(pin, [pinUp, pinIn], press);
    }, elapsed);
    later(finish, elapsed + Math.max(settle.settled, press.settled, timing.shadowMs));
  } catch {
    finish();
  }
}

/** The inline script that plays the opening. */
export const openingScript = `try{(${runOpening.toString()})(${springCurve.toString()},${JSON.stringify(openingTimings)})}catch(_){document.documentElement.removeAttribute("data-opening")}`;
