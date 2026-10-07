import type { Page, TestInfo } from "@playwright/test";

/**
 * When a motion test fails, attaches what the engine thinks is happening:
 * the media queries it matched, which animations exist and how far along they
 * are, and the fan-out's measured state. Linux WebKit in CI can't be run
 * locally, so this is how a failed run explains itself from its artifacts.
 */
export async function attachMotionState(page: Page, testInfo: TestInfo) {
  if (testInfo.status === testInfo.expectedStatus) return;
  const state = await page
    .evaluate(() => {
      const describe = (animation: Animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target as Element | null;
        const timeline = animation.timeline as (AnimationTimeline & { constructor: { name: string } }) | null;
        return {
          name: (animation as CSSAnimation).animationName ?? (animation as CSSTransition).transitionProperty ?? animation.id,
          target: target ? `${target.tagName.toLowerCase()}.${String((target as HTMLElement).className).slice(0, 40)}` : null,
          playState: animation.playState,
          timeline: timeline ? timeline.constructor.name : null,
          currentTime: animation.currentTime === null ? null : String(animation.currentTime),
          progress: animation.effect?.getComputedTiming().progress ?? null,
        };
      };
      const strings = [...document.querySelectorAll<SVGElement>(".board-string")].map((path) => {
        const style = getComputedStyle(path);
        return {
          strokeDashoffset: style.strokeDashoffset,
          strokeDasharray: style.strokeDasharray,
          animationName: style.animationName,
          animationTimeline: style.getPropertyValue("animation-timeline"),
          animationRange: style.getPropertyValue("animation-range"),
        };
      });
      const journey = document.querySelector<HTMLElement>("[data-journey]");
      const extras = [...document.querySelectorAll<HTMLElement>("[data-clipping-extra]")].map((extra) => {
        const style = getComputedStyle(extra);
        return { transform: style.transform, opacity: style.opacity, height: extra.getBoundingClientRect().height };
      });
      const space = document.querySelector<HTMLElement>("[data-clipping-extra]")?.closest<HTMLElement>("[id]");
      return {
        userAgent: navigator.userAgent,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        reducedMotionBare: matchMedia("(prefers-reduced-motion)").matches,
        supportsViewTimeline: CSS.supports("animation-timeline: view()"),
        supportsTimelineScope: CSS.supports("timeline-scope: --journey"),
        supportsViewTimelineName: CSS.supports("view-timeline-name: --journey"),
        supportsAnimationRange: CSS.supports("animation-range: cover 10% cover 20%"),
        hasScrollTimeline: "ScrollTimeline" in window,
        hasViewTimeline: "ViewTimeline" in window,
        scrollY: Math.round(window.scrollY),
        journey: journey && { top: Math.round(journey.getBoundingClientRect().top + window.scrollY), height: Math.round(journey.getBoundingClientRect().height) },
        journeyViewTimelineName: journey && getComputedStyle(journey).getPropertyValue("view-timeline-name"),
        strings,
        animations: document.getAnimations().map(describe),
        fanOutSpaceStyleHeight: space?.style.height ?? null,
        extras,
      };
    })
    .catch((error) => ({ error: String(error) }));
  const body = JSON.stringify(state, null, 2);
  await testInfo.attach("motion-state.json", { body, contentType: "application/json" });
  console.log(`motion-state ${testInfo.title} [${testInfo.project.name}]\n${body}`);
}
