import { rightPaddingFor, shareAsset, shareCard, shareSize } from "@/app/share-card";
import { roleStoryFor, roleStorySlugs } from "@/content/stretch/role-stories";
import { hasLongEmployer } from "@/content/stretch/role-story";
import { notFound } from "next/navigation";

export const alt = "Elias Bennett: a role story, in the employer’s colour";
export const size = shareSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return roleStorySlugs.map((slug) => ({ slug }));
}

const passWidth = 334;

/** The Role story's card: its employer's panel field and ink, the name and role at the left, and its hanging pass at the right. */
export default async function RoleStoryImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) notFound();
  const { field, ink } = story.panel;
  const pass = await shareAsset(`pass-${slug}.png`);
  const passHeight = Math.round((passWidth * pass.height) / pass.width);
  const paddingRight = rightPaddingFor(pass, passWidth);

  // A long employer wraps cleanly inside the left column rather than colliding with the pass or clipping.
  const employerSize = hasLongEmployer(story) ? 62 : story.employer.length > 10 ? 104 : 124;

  return shareCard({
    field,
    ink,
    children: (
      <div style={{ display: "flex", flexDirection: "column", rowGap: 18 }}>
        <div style={{ display: "flex", fontSize: employerSize, lineHeight: 0.98, letterSpacing: -2.6 }}>
          {story.employer}
        </div>
        <div style={{ display: "flex", fontSize: 42, lineHeight: 1.15 }}>{story.role}</div>
      </div>
    ),
    aside: (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          paddingRight,
          height: "100%",
          flexShrink: 0,
        }}
      >
        <img
          src={pass.src}
          alt=""
          width={passWidth}
          height={passHeight}
          style={{ marginTop: -38 }}
        />
      </div>
    ),
  });
}
