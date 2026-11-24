import { shareAsset, shareCard, shareMargins, shareSize } from "@/app/share-card";
import { projects } from "@/content/projects";
import { caseStudyFor, caseStudySlugs } from "@/content/stretch/case-studies";
import { caseStudyOpening } from "@/content/stretch/case-study";
import { luminance } from "@/content/stretch/story";
import { notFound } from "next/navigation";

export const alt = "Case study · Elias Bennett";
export const size = shareSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

const shotWidth = 540;

/** A case study's card: its project's panel field and ink, the name and line at the left, and its screenshot at the right. */
export default async function CaseStudyImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyFor(slug);
  if (!study) notFound();
  const { name, outcome } = caseStudyOpening(study, projects);
  const panel = projects.find((entry) => entry.slug === slug)?.panel;
  if (!panel) notFound();

  const shot = await shareAsset(`shot-${slug}.png`);
  const shotHeight = Math.round((shotWidth * shot.height) / shot.width);
  const darkField = luminance(panel.field) < 0.2;

  return shareCard({
    field: panel.field,
    ink: panel.ink,
    children: (
      <div style={{ display: "flex", flexDirection: "column", rowGap: 18 }}>
        <div style={{ display: "flex", fontSize: name.length > 10 ? 76 : 86, lineHeight: 0.98, letterSpacing: -2.4 }}>
          {name}
        </div>
        <div style={{ display: "flex", fontSize: 32, lineHeight: 1.22 }}>{outcome}</div>
      </div>
    ),
    aside: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingRight: shareMargins.side,
          paddingTop: shareMargins.top,
          paddingBottom: shareMargins.bottom,
          height: "100%",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            width: shotWidth,
            height: shotHeight,
            borderRadius: 16,
            overflow: "hidden",
            border: darkField ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(20, 20, 22, 0.16)",
            boxShadow: darkField
              ? "0 14px 36px rgba(0, 0, 0, 0.45)"
              : "0 14px 32px rgba(20, 20, 22, 0.16)",
          }}
        >
          <img src={shot.src} alt="" width={shotWidth} height={shotHeight} />
        </div>
      </div>
    ),
  });
}
