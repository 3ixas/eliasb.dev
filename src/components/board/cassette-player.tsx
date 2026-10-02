"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "@/components/board/external-link";
import { Pin } from "@/components/board/pin";
import { board } from "@/content/board";

/**
 * My playlist as a cassette player. It is a facade: nothing from Spotify
 * loads until Play is pressed, and then Spotify's own player, with its
 * controls and track list, opens in the deck's window. Focus moves into the
 * player so the next Tab reaches its controls.
 */
export function CassettePlayer({ playlistId, playlistUrl }: { playlistId: string; playlistUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const player = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) player.current?.focus();
  }, [playing]);

  const copy = board.playlist;
  const openLink = (
    <ExternalLink href={playlistUrl} className="whitespace-nowrap">
      {copy.open}
    </ExternalLink>
  );

  return (
    <div className="relative pt-32">
      <div className="absolute top-0 right-2 z-10">
        <Pin object="note" fixing="pushpin" surface="linen" looseness="loose" tilt={-3} stock="kraft" fixingAt={10} className="px-5 pt-5 pb-3">
          <p className="board-tag-ink m-0 font-mono text-label uppercase">{board.labels.playlist}</p>
          <p className="m-0 mt-1 font-display text-title">{copy.title}</p>
          <p className="board-tag-ink m-0 mt-1 text-small">{copy.line}</p>
        </Pin>
      </div>

      <Pin object="object" fixing="pushpin" surface="linen" looseness="loose" tilt={-1.5} stock="none" fixingAt={45} className="z-[1]">
        <div className="board-deck p-4 sm:px-6 sm:pt-5">
          <div aria-hidden="true" className="flex items-center justify-between gap-4">
            <span className="font-display text-lead italic">{copy.badge.brand}</span>
            <span className="font-mono text-label uppercase">{copy.badge.side}</span>
          </div>

          {playing ? (
            <>
              <div className="board-tape-label mt-3 flex items-center gap-3 rounded-b-none px-3 py-1.5">
                <span aria-hidden="true" className="board-tape-reel size-6" />
                <p className="m-0 flex-1 text-center font-display italic">{copy.heading}</p>
                <span aria-hidden="true" className="board-tape-reel size-6" />
              </div>
              <div className="board-deck-window rounded-t-none p-2">
                <iframe
                  ref={player}
                  title={copy.playerTitle}
                  src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="block rounded-[12px] border-0"
                />
              </div>
              <div className="mt-2 flex justify-end">{openLink}</div>
            </>
          ) : (
            <>
              <div className="board-deck-window mt-3 p-3">
                <div className="board-tape-label flex h-24 items-center justify-between gap-2 px-3 sm:px-5">
                  <span aria-hidden="true" className="board-tape-reel size-12 sm:size-14" />
                  <p className="m-0 text-center font-display text-lead leading-tight italic">{copy.heading}</p>
                  <span aria-hidden="true" className="board-tape-reel size-12 sm:size-14" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  aria-label={copy.playName}
                  onClick={() => setPlaying(true)}
                  className="board-deck-button board-focus inline-flex flex-1 items-center justify-center gap-2.5 px-6 text-body"
                >
                  <svg aria-hidden="true" width="12" height="14" viewBox="0 0 12 14">
                    <path d="M1 1 L11 7 L1 13 Z" fill="currentColor" />
                  </svg>
                  {copy.play}
                </button>
                {openLink}
              </div>
            </>
          )}
        </div>
      </Pin>

      {/* The cassette's paper insert, tucked under the deck. */}
      <div className={`board-j-card relative -mt-1.5 rotate-[1.2deg] px-5 pt-3.5 pb-4 ${playing ? "ml-auto w-fit mr-10" : "mx-6 sm:mx-10"}`}>
        <p className="m-0 font-display text-lead italic">{playing ? copy.jCardPlaying : copy.jCard}</p>
      </div>
    </div>
  );
}
