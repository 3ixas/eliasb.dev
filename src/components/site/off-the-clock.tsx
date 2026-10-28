import Image from "next/image";
import { useId, type ReactNode } from "react";
import { bookEntry, filmEntry, makingEntry, OffTheClockList, trainingEntry } from "@/components/quiet/off-the-clock";
import { GitHubYear } from "@/components/site/github-year";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { getGitHubSignal, getLatestRepositorySignal } from "@/integrations/github";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCachedHistorySignal } from "@/integrations/history-cache";
import { getFilmSignal } from "@/integrations/letterboxd";
import { asOfDate, pinStatus, type PinStatus } from "@/integrations/pin-rules";
import type { GitHubSignal, HistoryEvent, HistorySignal } from "@/integrations/types";
import { Fastener } from "@/components/site/fastener";

const copy = offTheClock;

/** A label that ends in an arrow: the arrow is decoration, so assistive technology skips it. */
function Label({ text }: { text: string }) {
  const arrow = text.match(/ ([↗↓→])$/)?.[1];
  return arrow ? (
    <>
      {text.slice(0, -2)} <span aria-hidden="true">{arrow}</span>
    </>
  ) : (
    text
  );
}

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="stretch-link stretch-mono" href={href} target="_blank" rel="noreferrer">
      <span>
        <Label text={children} />
      </span>
    </a>
  );
}

/** "as of 12 Sept" on an item whose saved data has gone stale. */
function AsOf({ status }: { status: PinStatus }) {
  if (status.kind !== "stale") return null;
  return (
    <p className="stretch-mono stretch-otc__asof">
      <time dateTime={status.asOf.iso}>
        <span aria-hidden="true">{copy.asOf(status.asOf.short)}</span>
        <span className="sr-only">{copy.asOf(status.asOf.long)}</span>
      </time>
    </p>
  );
}

/** One oddity as the clipping prints it: its picture and credit, the fact, its date and source. */
function Story({ event, day, lead = false }: { event: HistoryEvent; day: ReturnType<typeof asOfDate> | null; lead?: boolean }) {
  const { image } = event;
  const date = day ? `${day.long} ${event.year}` : String(event.year);
  return (
    <article className={lead ? "stretch-story stretch-story--lead" : "stretch-story"}>
      {image && (
        <figure className="stretch-story__figure">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 760px) 90vw, 440px" />
          <figcaption className="stretch-mono">
            {copy.curiosity.imageCredit}{" "}
            <a href={image.sourceUrl} target="_blank" rel="noreferrer">
              <Label text={`${image.creator} ↗`} />
            </a>
            {"\u00a0"}·{" "}
            <a href={image.licenseUrl ?? image.sourceUrl} target="_blank" rel="noreferrer">
              <Label text={`${image.licenseName} ↗`} />
            </a>
          </figcaption>
        </figure>
      )}
      <p className="stretch-story__fact">{event.text}</p>
      <p className="stretch-mono stretch-story__date">{event.kind === "birth" ? copy.curiosity.born(date) : date}</p>
      <ExternalLink href={event.sourceUrl}>{day ? copy.curiosity.source : copy.curiosity.readMore}</ExternalLink>
    </article>
  );
}

/**
 * The Weekly Curiosity: this week's most surprising oddity as a newspaper
 * clipping, the other two behind a disclosure. With no live week it is the
 * archive's saved examples, which say so.
 */
export function ClippingCard({ history }: { history: HistorySignal }) {
  const headingId = useId();
  const [lead, ...more] = history.events;
  const day = history.weekOf ? asOfDate(new Date(`${history.weekOf}T12:00:00Z`)) : null;
  return (
    <article className="stretch-otc__card stretch-otc__clipping" data-otc="clipping" data-state={day ? "live" : "archive"} aria-labelledby={headingId}>
      <Fastener kind="push-pin" />
      <h3 id={headingId} className="stretch-mono stretch-otc__label">
        {copy.curiosity.label}
      </h3>
      <p className="stretch-mono stretch-otc__kicker">{day ? day.long : copy.curiosity.fallback}</p>
      {lead && <Story event={lead} day={day} lead />}
      {more.length > 0 && (
        <details className="stretch-more">
          <summary className="stretch-mono">
            <span>
              <Label text={copy.curiosity.more(more.length)} />
            </span>
          </summary>
          {more.map((event) => (
            <Story key={`${event.year}-${event.kind}-${event.text}`} event={event} day={day} />
          ))}
        </details>
      )}
    </article>
  );
}

/** My GitHub year as a grid of squares. Gone when there is no full year to show. */
export function GitHubCard({ github, now }: { github: GitHubSignal; now: Date }) {
  const headingId = useId();
  const status = pinStatus("github", github, now);
  if (status.kind === "removed" || github.activity.length === 0) return null;
  return (
    <article className="stretch-otc__card stretch-otc__github" data-otc="github" data-state={status.kind === "stale" ? "stale" : "current"} aria-labelledby={headingId}>
      <h3 id={headingId} className="sr-only">
        {copy.github.heading}
      </h3>
      <GitHubYear activity={github.activity} total={github.total} />
      <AsOf status={status} />
    </article>
  );
}

/** What is still a card: this week's oddity and the GitHub year, until they become rows. */
export function OffTheClockCards({ history, github, now }: { history: HistorySignal; github: GitHubSignal; now: Date }): ReactNode {
  return (
    <div className="stretch-otc">
      <ClippingCard history={history} />
      <GitHubCard github={github} now={now} />
    </div>
  );
}

/** The live version: reads the signals, each of which falls back to written copy. */
export async function OffTheClock() {
  const now = new Date();
  const [history, reading, film, latest, github] = await Promise.all([
    getCachedHistorySignal(),
    getReadingSignal(),
    getFilmSignal(),
    getLatestRepositorySignal(),
    getGitHubSignal(),
  ]);
  return (
    <>
      <OffTheClockList entries={[trainingEntry(), bookEntry(reading, now), filmEntry(film, now), makingEntry(latest)]}>
        <h2 id="off-the-clock-heading" className="qi-title">
          {copy.heading}
        </h2>
        <p className="qi-note-line">{copy.note}</p>
      </OffTheClockList>
      <OffTheClockCards history={history} github={github} now={now} />
    </>
  );
}
