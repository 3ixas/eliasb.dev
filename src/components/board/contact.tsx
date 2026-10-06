import { Pin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";
import { contact } from "@/content/contact";

// Each card on its own paper, pinned a little crooked: CV, GitHub, LinkedIn.
const cardLooks = [
  { stock: "paper", tilt: 2 },
  { stock: "blueprint", tilt: -1.5 },
  { stock: "sage", tilt: 1 },
] as const;

/**
 * Contact: a neon "SAY hello" sign bolted to the wall, unlit by day and
 * glowing at night, above a postcard that is the email link, with my CV,
 * GitHub and LinkedIn pinned beside it as cards.
 */
export function Contact() {
  return (
    <BoardSurface
      kind="wall"
      as="section"
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-title"
      data-light="above"
      className="board-contact relative overflow-hidden px-4 pt-16 pb-20 sm:px-8 lg:px-16 lg:pt-24"
    >
      <div aria-hidden="true" className="board-neon-wash pointer-events-none absolute inset-0 opacity-(--is-night)" />
      <div className="relative z-10 mx-auto max-w-[1248px]">
        <p className="m-0 font-mono text-label uppercase text-wall-muted">{contact.kicker}</p>
        <h2 id="contact-title" className="sr-only">
          {contact.heading}
        </h2>
        <NeonSign />

        <div className="mt-12 grid items-start gap-12 board:mt-16 board:grid-cols-12 board:gap-8">
          <Postcard />
          <ul role="list" className="m-0 flex list-none flex-col items-center gap-6 p-0 board:col-span-3 board:col-start-10 board:items-start">
            {contact.cards.map((card, index) => (
              <li key={card.label}>
                <Pin object="card" fixing="pushpin" surface="wall" looseness="loose" tilt={cardLooks[index].tilt} stock={cardLooks[index].stock} interactive className="w-52">
                  <a href={card.href} target="_blank" rel="noreferrer" className="board-focus block min-h-11 px-4.5 py-4 no-underline">
                    <span className="block font-mono text-label uppercase">{card.label}</span>
                    <span className="mt-1 block font-display text-title">
                      {/* A no-break space keeps the arrow with the last word. */}
                      {card.line}{"\u00a0"}<span aria-hidden="true">↗</span>
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Pin>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BoardSurface>
  );
}

/**
 * The sign: "say" in small capitals, "hello" in large script. Glass tubes by
 * day; lit pink and cyan at night, with one letter that flickers now and then.
 * It's decoration: the section's heading carries the words.
 */
function NeonSign() {
  return (
    <div aria-hidden="true" className="board-neon-sign relative mt-6 w-fit max-w-full -rotate-[1.5deg] px-6 py-5 sm:px-11 sm:py-6">
      {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((corner) => (
        <span key={corner} className={`board-neon-bolt absolute size-2.5 rounded-pill ${corner}`} />
      ))}
      <p className="m-0 flex items-start gap-3 sm:gap-5">
        <span className="board-neon board-neon-cool mt-[0.6em]">{contact.sign.small}</span>
        <span className="board-neon board-neon-hot">
          {[...contact.sign.large].map((letter, index) => (
            <span key={index} className={index === 3 ? "board-neon-flicker" : undefined}>
              {letter}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}

/** The postcard is the email link: the message on the left, the address and stamp on the right. */
function Postcard() {
  const { postcard } = contact;
  const messageId = "contact-postcard-message";

  return (
    <div className="mx-auto w-full max-w-[640px] board:col-span-8 board:mx-0">
      <Pin object="card" fixing="tape" surface="wall" looseness="loose" tilt={-1} stock="postcard" interactive>
        <a
          href={postcard.href}
          aria-label={postcard.linkName}
          aria-describedby={messageId}
          className="board-focus grid gap-6 p-6 no-underline sm:grid-cols-[1fr_1px_1fr] sm:gap-7 sm:p-8"
        >
          <span className="flex flex-col justify-between gap-6">
            <span className="block font-display text-heading leading-none italic">{postcard.headline}</span>
            <span id={messageId} className="block text-body text-muted">
              {postcard.line}
            </span>
          </span>
          <span aria-hidden="true" className="board-postcard-divider hidden sm:block" />
          <span className="relative flex flex-col justify-end gap-4 pt-28 sm:pt-0 sm:pb-2">
            <span aria-hidden="true" className="board-stamp absolute top-0 right-0 p-1">
              <span className="flex size-full items-center justify-center font-display text-title">{postcard.stamp}</span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 120 40" className="board-postmark absolute top-6 right-16 w-28">
              <path d="M0 8 Q 15 2 30 8 T 60 8 T 90 8 T 120 8 M0 20 Q 15 14 30 20 T 60 20 T 90 20 T 120 20 M0 32 Q 15 26 30 32 T 60 32 T 90 32 T 120 32" fill="none" strokeWidth="1.5" />
            </svg>
            <span className="board-address-line block font-display text-lead">{postcard.name}</span>
            <span className="board-address-line board-postcard-address block font-display text-lead break-all">{postcard.email}</span>
            <span aria-hidden="true" className="board-address-line block h-2" />
          </span>
        </a>
      </Pin>
    </div>
  );
}
