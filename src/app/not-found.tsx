import type { Metadata } from "next";
import Link from "next/link";
import { LostPropertyTag } from "@/components/site/lost-property-tag";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { pageTitle } from "@/content/site";
import { notFound as copy, siteCopy } from "@/content/stretch/site-copy";

export const metadata: Metadata = {
  title: { absolute: pageTitle(copy.title) },
  description: null,
  alternates: { canonical: null },
  // Not the home page's share card.
  openGraph: null,
  twitter: null,
  // Next.js adds its own noindex to a 404; this overrides the layout's robots,
  // so the two agree.
  robots: { index: false, follow: true },
};

/**
 * The 404 (docs/content/redesign-copy.md): the header, a short heading
 * and line, one link home, a lost-property tag naming the address asked for
 * (beside them, below on phones) and a row for each homepage section. It has
 * no cobalt beyond focus, selection and hover.
 */
export default function NotFound() {
  return (
    <div data-stretch-shell data-not-found>
      <SiteHeader home />
      <main id="main-content" tabIndex={-1} className="stretch-wrap stretch-404">
        <div className="stretch-404__copy">
          <h1 className="stretch-display stretch-h2">{copy.heading}</h1>
          <p className="stretch-404__line">{copy.line}</p>
          <Link className="stretch-404__home" href="/">
            {copy.button.replace(/ →$/, "")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <LostPropertyTag />
        <nav aria-label={copy.orTry} className="stretch-404__rows">
          <p className="stretch-mono stretch-404__or-try">{copy.orTry}</p>
          <ol className="stretch-index__list">
            {siteCopy.menu.map(({ id, label }, index) => (
              <li key={id} className="stretch-index__row">
                <Link href={`/#${id}`} className="stretch-index__link">
                  <span className="stretch-index__number stretch-mono">{String(index + 1).padStart(2, "0")}</span>
                  <span className="stretch-index__text">
                    <span className="stretch-index__name">{label}</span>
                  </span>
                  <span className="stretch-index__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
