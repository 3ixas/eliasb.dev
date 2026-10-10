import type { Metadata } from "next";
import Link from "next/link";
import { SubpageHeader } from "@/components/site/subpage-header";
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
 * The 404 (docs/content/redesign-copy.md): the slim header, a short heading
 * and line, and one link home. It has no entrance and no cobalt beyond focus,
 * selection and hover.
 */
export default function NotFound() {
  return (
    <div data-stretch-shell data-not-found>
      <SubpageHeader />
      <main id="main-content" tabIndex={-1} className="stretch-wrap stretch-404">
        <h1 className="stretch-display stretch-h2">{copy.heading}</h1>
        <p className="stretch-404__line">{copy.line}</p>
        <Link className="stretch-404__home" href="/">
          {copy.button.replace(/ →$/, "")} <span aria-hidden="true">→</span>
        </Link>
      </main>
      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
    </div>
  );
}
