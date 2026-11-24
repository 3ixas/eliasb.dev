import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Arrow } from "@/components/parts/panel";
import { hostLabel } from "@/components/site/host-label";

/** A path on this site, as opposed to a mailto: or an address elsewhere. */
export const isInternalHref = (href: string) => href.startsWith("/");

/**
 * A link that opens the way its address implies: a page of this site in place, an email as it is,
 * and anywhere else in a new tab with `noopener noreferrer`.
 */
export function SiteLink({
  href,
  className,
  style,
  transitionTypes,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  transitionTypes?: string[];
  children: ReactNode;
}) {
  if (isInternalHref(href)) {
    return (
      <Link className={className} style={style} href={href} transitionTypes={transitionTypes}>
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
    <a className={className} style={style} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** An external action link (Live site, Code, Open this scenario): strips any trailing ` ↗`, draws `<Arrow out />`, and tells screen readers where it opens. */
export function OutLink({ href, label, className }: { href: string; label: string; className: string }) {
  return (
    <SiteLink href={href} className={className}>
      {label.replace(/ ↗$/, "")}
      <Arrow out />
      <span className="sr-only"> opens {hostLabel(href)} in a new tab</span>
    </SiteLink>
  );
}
