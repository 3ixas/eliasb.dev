import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/parts/panel";
import { LongForm } from "@/components/site/long-form";
import { MissingAddress } from "@/components/site/missing-address";
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
 * The 404 (docs/design/DESIGN.md "The 404", R-25): it says what didn't work, then what to try. The title and its line;
 * the address asked for, struck through, with "Not on file" and "404"; then "Try one of these" and the homepage's five
 * sections as rows with the copy deck's lines.
 */
export default function NotFound() {
  return (
    <LongForm attrs={{ "data-not-found": "" }}>
      <section className="frame not-found" aria-labelledby="not-found-title">
        <h1 id="not-found-title" className="page-head__title">
          {copy.heading}
        </h1>
        <p className="page-head__note">{copy.line}</p>
        <p className="missing" data-missing="">
          <s>
            <MissingAddress />
          </s>
          <span>{copy.missing.line}</span>
          <b>{copy.missing.meta}</b>
        </p>
        <section className="not-found__try" aria-labelledby="try-title">
          <h2 id="try-title" className="section__title">
            {copy.tryTitle}
          </h2>
          <p className="not-found__note">{copy.tryNote}</p>
          <ul className="rows">
            {siteCopy.menu.map(({ id, label }) => (
              <li key={id}>
                <Link href={`/#${id}`} className="row">
                  <span className="row__name">{label}</span>
                  <span className="row__line">{copy.tryLines[id]}</span>
                  <span className="row__meta">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </LongForm>
  );
}
