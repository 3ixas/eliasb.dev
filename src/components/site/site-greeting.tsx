"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { GreetingScene } from "@/components/site/greeting-scene";
import { greetingKey, greetingLine, greetingLines, isWeekend, type GreetingKey } from "@/content/stretch/greeting";
import { siteCopy } from "@/content/stretch/site-copy";

/** The greeting for the visitor's own clock; it only changes when the time of day does. */
const readGreeting = (): GreetingKey => greetingKey(new Date().getHours());
const readWeekend = () => isWeekend(new Date().getDay());

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/** Where London's time and the greeting's tab stop belong: a wide screen with a pointer that hovers. Phones have neither. */
const WIDE = "(hover: hover) and (min-width: 900px)";

function subscribeWide(onChange: () => void) {
  const media = window.matchMedia(WIDE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const readWide = () => window.matchMedia(WIDE).matches;

const londonClock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });

/** The scene starts a moment after the page is up, so its resting state is seen first, and plays for this long. */
const PLAY_AFTER = 500;
const PLAY_FOR = 3000;

const longest = greetingLines.reduce((a, b) => (b.length > a.length ? b : a));

/**
 * A greeting from the visitor's time of day, with a small scene for it. The page is cached, so the server cannot
 * know the hour or the day: the server and the first browser render say "Hello" with its prompt, then the browser's
 * own clock picks the words and the scene (and, in the afternoon, whether it is a weekend). The time never leaves the browser. The words are as wide as the longest greeting
 * (quiet-header.css sets it from data-longest), so the swap moves nothing, and it is not a live region, so a change
 * is not announced.
 *
 * The scene plays once on every load (data-playing), and again on hover or focus. With reduced motion it rests:
 * quiet-header.css moves nothing. On a wide screen, hover or focus also adds London's time, read when the pointer
 * arrives and placed absolutely, so it can never widen the header. Anywhere else the greeting is a button: a tap
 * plays the scene again and says London's time on a line of its own beneath, and a second tap puts it away.
 */
export function SiteGreeting() {
  const key = useSyncExternalStore(subscribe, readGreeting, () => "hello" as const);
  const weekend = useSyncExternalStore(subscribe, readWeekend, () => false);
  const wide = useSyncExternalStore(subscribeWide, readWide, () => false);
  const [playing, setPlaying] = useState(false);
  const [london, setLondon] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const start = window.setTimeout(() => setPlaying(true), PLAY_AFTER);
    const stop = window.setTimeout(() => setPlaying(false), PLAY_AFTER + PLAY_FOR);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, []);

  const readLondon = () => setLondon(londonClock.format(new Date()));
  const toggle = () => {
    if (!open) {
      readLondon();
      setPlaying(true);
      window.setTimeout(() => setPlaying(false), PLAY_FOR);
    }
    setOpen(!open);
  };

  return (
    <p
      className="qi-greeting"
      data-greeting={key}
      data-playing={playing || undefined}
      data-open={open || undefined}
      tabIndex={0}
      role={wide ? undefined : "button"}
      aria-expanded={wide ? undefined : open}
      onPointerEnter={wide ? readLondon : undefined}
      onFocus={wide ? readLondon : undefined}
      onClick={wide ? undefined : toggle}
      onKeyDown={
        wide
          ? undefined
          : (event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              toggle();
            }
      }
    >
      <GreetingScene period={key} />
      <span className="qi-greeting__words" data-longest={longest}>
        <span>{greetingLine(key, weekend)}</span>
      </span>
      <span className="qi-greeting__more">
        <span>
          <span>{london && siteCopy.header.londonTime(london)}</span>
        </span>
      </span>
    </p>
  );
}
