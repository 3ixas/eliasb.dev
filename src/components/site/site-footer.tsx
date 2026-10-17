import type { CSSProperties } from "react";
import { nameFill } from "@/components/site/signature-springs";
import { siteCopy } from "@/content/stretch/site-copy";

const springStyle = { "--fill-ease": nameFill.easing, "--fill-ms": `${nameFill.duration}ms` } as CSSProperties;

const [made, name] = [siteCopy.footer.replace(/ Elias$/, ""), "Elias"];

/**
 * The footer on every page: "Made by Elias" in the name's condensed display
 * type, with "Elias" filling with cobalt on hover or while a Say hello link has
 * keyboard focus (all in CSS, on the `nameFill` spring). Say hello is always set
 * larger than this. The copy stays `siteCopy.footer`.
 */
export function SiteFooter({ entrance }: { entrance?: "rest" }) {
  return (
    <footer className="stretch-wrap stretch-footer" data-entrance={entrance} style={springStyle}>
      <p className="stretch-display">
        <span className="stretch-footer__made">{made}</span>{" "}
        <span className="stretch-footer__name" data-text={name}>
          {name}
        </span>
      </p>
    </footer>
  );
}
