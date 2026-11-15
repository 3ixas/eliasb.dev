import { shareCard, shareSize } from "@/app/share-card";
import { roleStoryFor, roleStorySlugs } from "@/content/stretch/role-stories";
import { hasLongEmployer } from "@/content/stretch/role-story";
import { notFound } from "next/navigation";

export const alt = "Elias Bennett: a role story, in the employer’s colour";
export const size = shareSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return roleStorySlugs.map((slug) => ({ slug }));
}

/** The Role story's card: its employer's panel field and ink, the name large, the role beneath. No dates and no logo. */
export default async function RoleStoryImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) notFound();
  const { field, ink } = story.panel;
  // A long employer wraps onto a second line rather than running off the card.
  const employerSize = hasLongEmployer(story) ? 88 : story.employer.length > 12 ? 128 : 168;

  return shareCard({
    field,
    ink,
    children: (
      <div style={{ display: "flex", flexDirection: "column", rowGap: 12 }}>
        <div style={{ display: "flex", fontSize: employerSize, lineHeight: 0.95, letterSpacing: -4 }}>
          {story.employer}
        </div>
        <div style={{ display: "flex", fontSize: 56 }}>{story.role}</div>
      </div>
    ),
  });
}
