import type { CSSProperties } from "react";
import { CassettePlayer } from "@/components/board/cassette-player";
import { ExternalLink } from "@/components/board/external-link";
import { Pin } from "@/components/board/pin";
import { PinPhoto, PinSlot } from "@/components/board/pin-states";
import { board, filmLine } from "@/content/board";
import { integrationConfig } from "@/content/integration-config";
import { asOfDate, pinStatus } from "@/integrations/pin-rules";
import type { FilmSignal, ReadingSignal } from "@/integrations/types";

const sway = (depth: number) => ({ "--sway-depth": depth }) as CSSProperties;

/**
 * The culture corner: the book I'm reading with its library card, the film I
 * last watched with its ticket, and a cassette player for my playlist. Three
 * pins across the Board's lower half on wide screens, stacked below 900 px.
 */
export function CultureCorner({ reading, film, now }: { reading: ReadingSignal; film: FilmSignal; now: Date }) {
  return (
    <>
      <div className="flex items-center justify-center gap-4 text-ink board:col-span-12 board:justify-start">
        <span aria-hidden="true" className="h-px w-15 bg-current opacity-35" />
        <h3 className="m-0 font-display text-title font-normal italic">{board.cultureCorner}</h3>
        <span aria-hidden="true" className="h-px w-15 bg-current opacity-35" />
      </div>
      <BookPin reading={reading} now={now} />
      <FilmPin film={film} now={now} />
      <PinSlot
        status={pinStatus("playlist", { state: "curated", updatedAt: null }, now)}
        data-board-pin="playlist"
        className="board-sway mx-auto w-full max-w-[400px] board:col-span-5 board:max-w-none"
        style={sway(0.5)}
      >
        <CassettePlayer playlistId={integrationConfig.spotify.playlistId} playlistUrl={integrationConfig.spotify.playlistUrl} />
      </PinSlot>
    </>
  );
}

/** The book on my currently-reading shelf: its cover, a library card tucked behind, and a tag. */
export function BookPin({ reading, now }: { reading: ReadingSignal; now: Date }) {
  const { book } = reading;
  const started = book?.startedAt ? asOfDate(new Date(book.startedAt)) : null;

  return (
    <PinSlot
      status={pinStatus("reading", reading, now)}
      data-board-pin="reading"
      className="board-sway mx-auto w-full max-w-[300px] board:col-span-4 board:max-w-none"
      style={sway(0.8)}
    >
      <div className="relative pt-4">
        {/* The library card is tucked behind the cover, which holds it in place; its writing starts clear of the cover. */}
        <div className="board-library-card absolute top-0 right-0 h-48 w-36 rotate-[1.5deg] py-3 board:rotate-[8deg] pr-3 pl-10 text-ink">
          <p className="m-0 border-b border-current pb-1 font-mono text-label uppercase text-muted">{board.book.dateStarted}</p>
          {started && (
            <time dateTime={started.iso} className="board-library-stamp mt-4">
              <span aria-hidden="true">{started.short}</span>
              <span className="sr-only">{board.book.started(started.long)}</span>
            </time>
          )}
        </div>
        <Pin object="photo" fixing="tape" surface="linen" looseness="loose" tilt={-2.5} stock="photo" fixingAt={45} className="w-[calc(100%-6.5rem)] max-w-[230px]">
          {book ? (
            <PinPhoto
              src={book.coverUrl}
              alt={board.book.coverAlt(book.title, book.author)}
              width={230}
              height={345}
              sizes="230px"
              className="rounded-paper"
            />
          ) : (
            <BlankPrint />
          )}
        </Pin>
      </div>
      <Pin object="note" fixing="pushpin" surface="linen" looseness="loose" tilt={3} stock="kraft" fixingAt={12} className="mt-6 ml-4 w-fit max-w-[260px] px-5 pt-5 pb-3">
        <p className="board-tag-ink m-0 font-mono text-label uppercase">{board.labels.reading}</p>
        {book ? (
          <>
            <p className="m-0 mt-1 font-display text-title">{book.title}</p>
            <p className="board-tag-ink m-0 mt-1 text-small">
              {book.author} · {board.book.source}
            </p>
            <ExternalLink href={reading.href} className="board-tag-ink">{board.book.link}</ExternalLink>
          </>
        ) : (
          <p className="m-0 mt-1 pb-2 font-display text-title">{board.book.empty}</p>
        )}
      </Pin>
    </PinSlot>
  );
}

/** The film I last watched: its poster, pinned, with the ticket stub taped to the linen across its corner. */
export function FilmPin({ film: signal, now }: { film: FilmSignal; now: Date }) {
  const { film } = signal;
  const line = film ? filmLine(film.watchedOn ? asOfDate(new Date(`${film.watchedOn}T12:00:00Z`)) : null, film.rating) : null;

  return (
    <PinSlot
      status={pinStatus("film", signal, now)}
      data-board-pin="film"
      className="board-sway mx-auto w-full max-w-[280px] board:col-span-3 board:max-w-none"
      style={sway(1)}
    >
      <div className="relative pb-24">
        <Pin object="photo" fixing="pushpin" surface="linen" looseness="loose" tilt={2} stock="photo" className="w-full max-w-[240px]">
          {film ? (
            <PinPhoto
              src={film.posterUrl}
              alt={board.film.posterAlt(film.title, film.year)}
              width={240}
              height={360}
              sizes="240px"
              className="rounded-paper"
            />
          ) : (
            <BlankPrint />
          )}
        </Pin>
        <div className="absolute bottom-0 -left-2 z-10 w-[236px]">
          <Pin object="ticket" fixing="tape" surface="linen" looseness="loose" tilt={-3} stock="ticket" fixingAt={70} className="board-ticket py-3 pr-4 pl-6">
            <p className="m-0 font-mono text-label uppercase">{board.film.ticket}</p>
            <p className="m-0 mt-1 font-display text-title">{film ? film.title : board.film.empty}</p>
            {line && (
              <p className="m-0 mt-1 font-mono text-label">
                <span aria-hidden="true">{line.shown}</span>
                <span className="sr-only">{line.spoken}</span>
              </p>
            )}
            {film && <ExternalLink href={film.href}>{board.film.link}</ExternalLink>}
          </Pin>
        </div>
      </div>
    </PinSlot>
  );
}

/** A blank cover or poster in the print's place, keeping its shape. */
function BlankPrint() {
  return <div data-print="blank" aria-hidden="true" className="board-blank-print aspect-[2/3] w-full rounded-paper" />;
}
