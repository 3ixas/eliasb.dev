"use client";
/*
 * PROTOTYPE, throwaway (#197, An identity for the 404 page). Lives only on the
 * prototype/404-identity branch. Three variants of the 404's main content,
 * switched by ?variant= on any missing URL (today's page when absent):
 *
 *   A  Scale      – axis: type. "404" at display size in outline numerals; the 0 lands tilted, like a dropped tile.
 *   B  Object     – axis: a physical thing. A lost-property tag on a string, stamped "Not on file", carrying the address asked for.
 *   C  Directory  – axis: wayfinding (stretch). A "you are here" sign with every real destination on the site, case studies in their colours.
 *
 * The approved heading, line and link stay in every variant; anything else is
 * prototype copy. No Cobalt beyond focus and hover, except Say hello in C.
 */
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { featuredProjects, featuredSlugs, projects } from "@/content/projects";
import { notFound as copy, siteCopy } from "@/content/stretch/site-copy";
import { PrototypeSwitcher } from "./prototype-switcher.prototype";
import "../../app/not-found.prototype.css";

export const NOT_FOUND_VARIANTS = ["A", "B", "C"] as const;
type Variant = (typeof NOT_FOUND_VARIANTS)[number];
const names: Record<Variant, string> = { A: "Scale", B: "Object", C: "Directory" };

const pad = (n: number) => String(n).padStart(2, "0");

/** The address asked for, shortened in the middle when it would run on. */
function shortPath(path: string, max = 48) {
  const decoded = (() => {
    try {
      return decodeURI(path);
    } catch {
      return path;
    }
  })();
  if (decoded.length <= max) return decoded;
  const half = Math.floor((max - 1) / 2);
  return `${decoded.slice(0, half)}…${decoded.slice(-half)}`;
}

function Basics() {
  return (
    <>
      <h1 className="stretch-display stretch-h2">{copy.heading}</h1>
      <p className="stretch-404__line">{copy.line}</p>
      <Link className="stretch-404__home" href="/">
        {copy.button.replace(/ →$/, "")} <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}

function SectionRows({ className = "" }: { className?: string }) {
  return (
    <ol className={`nf-rows ${className}`}>
      {siteCopy.menu.map(({ id, label }, i) => (
        <li key={id}>
          <Link href={`/#${id}`} className="nf-row">
            <span className="stretch-mono nf-row__num">{pad(i + 1)}</span>
            <span className="nf-row__label">{label}</span>
            <span className="nf-row__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function Scale() {
  return (
    <div className="nf-a">
      <p className="nf-a__digits stretch-display" aria-hidden="true">
        <span>4</span>
        <span className="nf-a__zero">0</span>
        <span>4</span>
      </p>
      <div className="nf-a__body">
        <div>
          <Basics />
        </div>
        <nav aria-label="Somewhere else">
          <p className="stretch-mono nf-kicker">Or try</p>
          <SectionRows />
        </nav>
      </div>
    </div>
  );
}

function Tag({ path }: { path: string }) {
  return (
    <div className="nf-b">
      <div className="nf-b__copy">
        <Basics />
      </div>
      <div className="nf-b__hang">
        <svg className="nf-b__string" viewBox="0 0 120 90" aria-hidden="true">
          <path d="M60 0 C 58 30, 30 50, 22 88" fill="none" />
        </svg>
        <div className="nf-b__tag" role="img" aria-label={`Lost property tag: ${path}, not on file`}>
          <span className="nf-b__hole" aria-hidden="true" />
          <p className="stretch-mono nf-b__title">Lost property</p>
          <dl className="nf-b__fields">
            <div>
              <dt className="stretch-mono">Item</dt>
              <dd className="nf-b__path">{path}</dd>
            </div>
            <div>
              <dt className="stretch-mono">Found at</dt>
              <dd>eliasb.dev</dd>
            </div>
            <div>
              <dt className="stretch-mono">Return to</dt>
              <dd>The homepage</dd>
            </div>
          </dl>
          <span className="nf-b__stamp stretch-display" aria-hidden="true">
            Not on file
          </span>
        </div>
      </div>
    </div>
  );
}

function Directory({ path }: { path: string }) {
  const featured = featuredProjects(projects, featuredSlugs).filter((p) => p.links.caseStudy);
  return (
    <div className="nf-c">
      <p className="stretch-mono nf-c__here">
        <span className="nf-c__dot" aria-hidden="true" />
        You are here · <span className="nf-c__path">{path}</span> · nothing at this address
      </p>
      <Basics />
      <nav className="nf-c__board" aria-label="Everywhere on this site">
        <div>
          <p className="stretch-mono nf-kicker">On the homepage</p>
          <ol className="nf-c__list">
            {siteCopy.menu.map(({ id, label }) => (
              <li key={id}>
                <Link href={`/#${id}`} className={`nf-c__item${id === "say-hello" ? " nf-c__item--hello" : ""}`}>
                  <span className="stretch-display">{label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="stretch-mono nf-kicker">Case studies</p>
          <ol className="nf-c__list">
            {featured.map((p) => (
              <li key={p.slug}>
                <Link href={p.links.caseStudy!} className="nf-c__item">
                  <span className="nf-c__swatch" style={{ background: p.colours?.swatch }} aria-hidden="true" />
                  <span className="stretch-display">{p.name}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/things-i-make" className="nf-c__item nf-c__item--quiet">
                <span className="stretch-display">Everything I’ve made</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ol>
        </div>
      </nav>
    </div>
  );
}

export function NotFoundPrototype({ today }: { today: ReactNode }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const v = params.get("variant")?.toUpperCase();
  const variant = NOT_FOUND_VARIANTS.find((key) => key === v) ?? null;
  const path = shortPath(pathname);

  let body: ReactNode = today;
  if (variant === "A") body = <Scale />;
  if (variant === "B") body = <Tag path={path} />;
  if (variant === "C") body = <Directory path={path} />;

  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className={`stretch-wrap stretch-404${variant ? ` nf nf--${variant}` : ""}`}
        data-variant={variant ?? "today"}
      >
        {body}
      </main>
      <PrototypeSwitcher current={variant} variants={NOT_FOUND_VARIANTS} names={names} anchor="main-content" />
    </>
  );
}
