import { shareCard, shareSize } from "@/app/share-card";
import { projects } from "@/content/projects";
import { caseStudyFor, caseStudySlugs } from "@/content/stretch/case-studies";
import { caseStudyOpening } from "@/content/stretch/case-study";
import { notFound } from "next/navigation";

export const alt = "Elias Bennett: a case study, in the project’s colour";
export const size = shareSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

/** A case study's card: the project's colours, its name large and the one line it does for someone beneath. */
export default async function CaseStudyImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyFor(slug);
  if (!study) notFound();
  const { name, outcome, colours } = caseStudyOpening(study, projects);

  return shareCard({
    field: colours.field,
    ink: colours.ink,
    children: (
      <div style={{ display: "flex", flexDirection: "column", rowGap: 16 }}>
        <div style={{ display: "flex", fontSize: name.length > 12 ? 120 : 168, lineHeight: 0.95, letterSpacing: -2, textTransform: "uppercase" }}>{name}</div>
        <div style={{ display: "flex", fontSize: 48, lineHeight: 1.1 }}>{outcome}</div>
      </div>
    ),
  });
}
