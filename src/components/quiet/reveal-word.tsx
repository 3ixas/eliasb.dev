import type { ReactNode } from "react";
import type { RevealId } from "@/content/stretch/opening";

/**
 * A reveal word (GLOSSARY.md): words in a sentence that name something real and can show it. It is a button, as a
 * span so it can wrap with its line. The controller (closer-look-root.tsx) shows its look in the margin when the
 * pointer or focus arrives, and inline, in the slot after the paragraph, when it is tapped. The page renders the
 * hidden description it points to with `aria-describedby`, and the slot.
 */
export function RevealWord({ id, children }: { id: RevealId; children: ReactNode }) {
  return (
    <span className="qi-word" role="button" tabIndex={0} data-look={id} data-look-tap={id} aria-describedby={`${id}-description`} aria-expanded="false">
      {children}
    </span>
  );
}
