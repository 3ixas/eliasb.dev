import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/content/case-studies";

export type WorkArchiveCardProps = Pick<
  CaseStudy,
  "slug" | "index" | "name" | "kind" | "headline" | "hero"
>;

export function WorkArchiveCard({ study }: { study: WorkArchiveCardProps }) {
  return (
    <li className={`work-index-card work-card-${study.slug}`}>
      <Link href={`/work/${study.slug}`}>
        <span className="work-card-number">{study.index}</span>
        <div className="work-card-copy">
          <p>{study.kind}</p>
          <h2>{study.name}</h2>
          <span>{study.headline}</span>
        </div>
        <Image
          src={study.hero.src}
          alt={study.hero.alt}
          width={study.hero.width}
          height={study.hero.height}
          sizes="(max-width: 800px) calc(100vw - 56px), 55vw"
        />
        <span className="work-card-arrow">Read case study <span className="arrow-mark" aria-hidden="true">↗︎</span></span>
      </Link>
    </li>
  );
}
