import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/** A path on this site, as opposed to a mailto: or an address elsewhere. */
export const isInternalHref = (href: string) => href.startsWith("/");

/**
 * A link that opens the way its address implies: a page of this site in place, an email as it is,
 * and anywhere else in a new tab with noreferrer.
 */
export function SiteLink({ href, className, style, children }: { href: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  if (isInternalHref(href)) {
    return (
      <Link className={className} style={style} href={href}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a className={className} style={style} href={href}>
        {children}
      </a>
    );
  }
  return (
    <a className={className} style={style} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
