"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { ExternalLink } from "@/components/board/external-link";
import { Pin } from "@/components/board/pin";
import { board } from "@/content/board";
import type { HistoryImage } from "@/integrations/types";

export type ClippingStory = {
  key: string;
  dateLine: string;
  text: string;
  href: string;
  linkLabel: string;
  image: HistoryImage | null;
};

// The approved fan-out: a gentle spring, each clipping 60 ms after the last.
const SPRING = { type: "spring", bounce: 0.2, visualDuration: 0.5 } as const;
const STAGGER = 0.06;
const EXTRA_WIDTH = 280;

const wideQuery = "(min-width: 900px)";
const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia(wideQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * The clipping and its fan-out. On wide screens the other two oddities are
 * tucked behind the main cutting and fan out to its right; on narrow screens
 * they open below it, the space growing to their measured height. With
 * reduced motion the change is instant. Folded clippings are inert and
 * hidden from assistive technology, so the keyboard and screen readers skip them.
 */
export function WeeklyCuriosity({
  dateline,
  stories,
  source,
}: {
  dateline: (string | null)[];
  stories: ClippingStory[];
  source: { href: string; label: string };
}) {
  const [lead, ...extras] = stories;
  const [open, setOpen] = useState(false);
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches, () => false);
  const reduced = useReducedMotion();
  const extrasId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(0);
  const extraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [extraHeights, setExtraHeights] = useState<number[]>([]);
  const copy = board.clipping;

  // Fanned positions come from real sizes: the slot's width and each clipping's height.
  useEffect(() => {
    const element = slot.current;
    if (!element) return;
    const measure = () => {
      setSlotWidth(element.getBoundingClientRect().width);
      setExtraHeights(extraRefs.current.map((extra) => extra?.offsetHeight ?? 0));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const extra of extraRefs.current) if (extra) observer.observe(extra);
    return () => observer.disconnect();
  }, [wide]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  // Opening deals the clippings out in order; closing gathers them in reverse.
  const transition = (index: number): Transition =>
    reduced ? { duration: 0 } : { ...SPRING, delay: (open ? index : extras.length - 1 - index) * STAGGER };

  // Fanned out beside the main cutting, never over its own links or each other: each lies below the one before.
  const fanned = (index: number) => ({
    x: slotWidth + 16 + index * 32,
    y: extraHeights.slice(0, index).reduce((total, height) => total + height + 20, 0),
    rotate: index ? -2.5 : 3,
  });
  // Tucked low enough behind the main cutting that their pins are hidden too.
  const tucked = (index: number) => ({ x: 10 * (index + 1), y: 28 + 10 * index, rotate: index ? -2 : 2.5 });

  if (!lead) return null;

  return (
    <div ref={slot} className="relative">
      <div className="relative z-[2]">
        <Pin object="clipping" fixing="pushpin" surface="linen" looseness="loose" tilt={-1} stock="newsprint" className="p-5 sm:p-6">
          <p className="m-0 flex flex-wrap justify-between gap-x-3 border-y border-rule py-1 font-mono text-label uppercase">
            {dateline.filter(Boolean).map((part) => (
              <span key={part}>{part}</span>
            ))}
          </p>
          <h3 className="board-masthead m-0 mt-3 text-heading">{board.labels.clipping}</h3>
          <p className="m-0 mt-1 font-display text-body text-muted italic">{copy.strapline}</p>
          <Story story={lead} stamped />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 border-t border-rule pt-1">
            {extras.length > 0 && (
              <button
                ref={toggle}
                type="button"
                aria-expanded={open}
                aria-controls={extrasId}
                onClick={() => setOpen((value) => !value)}
                className="board-focus inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-accent decoration-2 underline-offset-4"
              >
                {open ? copy.fold : copy.more(extras.length)} <span aria-hidden="true">{open ? "↑" : "↓"}</span>
              </button>
            )}
            <ExternalLink href={source.href}>{source.label}</ExternalLink>
          </div>
        </Pin>
      </div>

      {wide ? (
        // Fanned clippings lie above everything beside the main cutting; tucked ones sit behind it.
        <div id={extrasId} inert={!open} aria-hidden={!open || undefined} className={`pointer-events-none absolute inset-0 ${open ? "z-[3]" : "z-[1]"}`}>
          {extras.map((story, index) => (
            <motion.div
              key={story.key}
              ref={(element) => {
                extraRefs.current[index] = element;
              }}
              data-clipping-extra
              className="pointer-events-auto absolute top-0 left-0"
              style={{ width: EXTRA_WIDTH, zIndex: extras.length - index }}
              initial={false}
              animate={open ? fanned(index) : tucked(index)}
              transition={transition(index)}
            >
              <ExtraClipping story={story} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          id={extrasId}
          inert={!open}
          aria-hidden={!open || undefined}
          className="overflow-hidden"
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={reduced ? { duration: 0 } : SPRING}
        >
          <div className="flex flex-col items-center gap-10 px-2 pt-10 pb-4">
            {extras.map((story, index) => (
              <motion.div
                key={story.key}
                data-clipping-extra
                className="w-full max-w-[320px]"
                initial={false}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
                transition={transition(index)}
              >
                <ExtraClipping story={story} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** One of the two further oddities: a smaller cutting with no masthead. */
function ExtraClipping({ story }: { story: ClippingStory }) {
  return (
    <Pin object="clipping" fixing="pushpin" surface="linen" looseness="loose" stock="newsprint" className="p-4">
      <Story story={story} />
    </Pin>
  );
}

/** A fact as the clipping prints it: picture and credit if there is one, the fact, its date, and its source. */
function Story({ story, stamped = false }: { story: ClippingStory; stamped?: boolean }) {
  const { image } = story;
  const stamp = stamped && <p className="board-news-stamp m-0 w-fit">{board.clipping.stamp}</p>;

  return (
    <article className="mt-4">
      {image ? (
        <figure className="relative m-0">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 899px) 420px, 460px"
            className="block h-auto max-h-80 w-full object-cover grayscale-[0.35] sepia-[0.15]"
          />
          {stamp && <div className="absolute -top-2 -right-2">{stamp}</div>}
          <figcaption className="mt-1.5 font-mono text-label">
            {board.clipping.imageCredit}{" "}
            <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="board-focus underline underline-offset-2">
              {image.creator}
            </a>{" "}
            ·{" "}
            <a href={image.licenseUrl ?? image.sourceUrl} target="_blank" rel="noreferrer" className="board-focus underline underline-offset-2">
              {image.licenseName}
            </a>
          </figcaption>
        </figure>
      ) : (
        stamp
      )}
      {/* The fact is the headline; the lead's is set larger than the other two. */}
      <p className={`m-0 mt-3 font-display leading-tight font-semibold ${stamped ? "text-title" : "text-lead"}`}>{story.text}</p>
      <p className="m-0 mt-1.5 font-display text-small text-muted italic">{story.dateLine}</p>
      <ExternalLink href={story.href}>{story.linkLabel}</ExternalLink>
    </article>
  );
}
