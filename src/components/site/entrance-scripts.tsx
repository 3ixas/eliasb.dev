import { entranceGuardScript, entranceScript } from "@/components/site/entrance";

/**
 * The two inline scripts of the signature entrance (entrance.ts). The guard
 * goes before the hero so the page is held before it is first painted; the
 * player goes after the page's HTML so everything it reads is there.
 * Both are plain scripts rather than client components, so a client-side
 * return to the homepage never replays the entrance.
 */
export function EntranceGuard() {
  return <script dangerouslySetInnerHTML={{ __html: entranceGuardScript }} />;
}

export function EntrancePlayer() {
  return <script id="entrance-player" dangerouslySetInnerHTML={{ __html: entranceScript }} />;
}
