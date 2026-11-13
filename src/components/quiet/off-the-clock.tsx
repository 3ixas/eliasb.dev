/*
 * The quiet index's Off the clock rows, kept only for /fixtures/closer-looks: the training row and the book are the last
 * rows with closer looks, and the closer-look machinery (closer-look-root.tsx, row.tsx, scroll-hold.ts) is still used by
 * the Role stories' reveal words until #417. The homepage's Off the clock is site/off-the-clock.tsx (#416).
 */
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { Row } from "@/components/quiet/row";
import { TrainingLine, TrainingLook, TrainingTile, TrainingTitle } from "@/components/quiet/training";
import { DotLine } from "@/components/site/dot-line";
import { offTheClock as copy } from "@/content/stretch/off-the-clock";
import type { ReadingSignal } from "@/integrations/types";

/** A row with its closer look: the id they share, the `Row` for the list and what the margin and the inline slot show. */
export type Entry = { id: string; row: ReactNode; look: ReactNode };

/** A cover or poster at 44 px: the real print with a spine crease and shadow, or a blank one in its place. */
function Cover({ src }: { src: string | null | undefined }) {
  return (
    <span className="qi-cover" data-blank={src ? undefined : ""}>
      {src && <Image src={src} alt="" width={60} height={88} sizes="30px" />}
    </span>
  );
}

const week = copy.training.days.map((day) => `${day.long}: ${day.session}.`).join(" ");

/** Today's training: a calendar tile, today's session, and the week as its closer look. `now` fixes the moment for the fixtures route. */
export function trainingEntry(now?: string): Entry {
  const id = "training";
  return {
    id,
    look: <TrainingLook now={now} />,
    row: (
      <Row
        key={id}
        attrs={{ "data-otc": id }}
        object={<TrainingTile now={now} />}
        title={<TrainingTitle now={now} />}
        line={<TrainingLine now={now} />}
        look={{ id, description: `${week} ${copy.training.photoCaption}` }}
      />
    ),
  };
}

/** Spines the cover lifts out from: authored colours and heights, so the shelf is the same on every visit. */
const spines = [
  { color: "#3c3a44", height: 128 },
  { color: "#8a6f4d", height: 112 },
  { color: "#2d4a5c", height: 138 },
  { color: "#5c2f2f", height: 120, after: true },
  { color: "#b8b0a0", height: 104, after: true },
  { color: "#3a5040", height: 132, after: true },
];

function Spine({ color, height }: { color: string; height: number }) {
  return <span className="qi-spine" style={{ "--c": color, "--h": `${height}px` } as CSSProperties} />;
}

/** The book's closer look: its cover lifting off a row of spines, turning to face you, then its title and author. */
function BookLook({ title, author, cover }: { title: string; author: string; cover: string | null | undefined }) {
  return (
    <div className="qi-book">
      <div className="qi-shelf">
        {spines.filter(({ after }) => !after).map((spine) => (
          <Spine key={spine.color} {...spine} />
        ))}
        <span className="qi-pluck">
          <span className="qi-pluck__cover" data-blank={cover ? undefined : ""}>
            {cover && <Image src={cover} alt="" width={240} height={360} sizes="84px" />}
          </span>
        </span>
        {spines.filter(({ after }) => after).map((spine) => (
          <Spine key={spine.color} {...spine} />
        ))}
      </div>
      <p className="qi-look__name">{title}</p>
      <p className="qi-look__by">{author}</p>
    </div>
  );
}

/** The book on his currently-reading shelf. Between books it is a plain row with a blank cover. */
export function bookEntry(reading: ReadingSignal): Entry {
  const id = "book";
  const { book } = reading;
  const attrs = { "data-otc": "reading" };
  if (!book) {
    return { id, look: null, row: <Row key={id} attrs={attrs} object={<Cover src={null} />} title={copy.reading.fallback} line={copy.reading.label} /> };
  }
  return {
    id,
    look: <BookLook title={book.title} author={book.author} cover={book.coverUrl} />,
    row: (
      <Row
        key={id}
        attrs={attrs}
        href={reading.href}
        object={<Cover src={book.coverUrl} />}
        title={book.title}
        line={<DotLine parts={[copy.reading.label, book.author]} />}
        look={{ id, description: copy.reading.coverAlt(book.title, book.author) }}
      />
    ),
  };
}

/**
 * The list of Off the clock rows (GLOSSARY.md, Row) with the controller that shows their closer looks. `children`
 * are the section's heading and note, inside the controller's column like Work's.
 */
export function OffTheClockList({ entries, children }: { entries: (Entry | null)[]; children?: ReactNode }) {
  const shown = entries.filter((entry) => entry !== null);
  const looks = Object.fromEntries(shown.filter(({ look }) => look).map(({ id, look }) => [id, look]));
  return (
    <CloserLookRoot looks={looks} className="qi-column">
      {children}
      <ul className="qi-list" data-off-the-clock="">
        {shown.map(({ row }) => row)}
      </ul>
    </CloserLookRoot>
  );
}
