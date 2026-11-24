import { hangingPassAside, shareCard, shareSize } from "@/app/share-card";
import { roleStoryFor, roleStorySlugs } from "@/content/stretch/role-stories";
import { hasLongEmployer } from "@/content/stretch/role-story";
import { notFound } from "next/navigation";

export const alt = "Role story · Elias Bennett";
export const size = shareSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return roleStorySlugs.map((slug) => ({ slug }));
}

/** The Role story's card: its employer's panel field and ink, the name and role at the left, and its hanging pass at the right. */
export default async function RoleStoryImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) notFound();
  const { field, ink } = story.panel;

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
    aside: await hangingPassAside(`pass-${slug}.png`),
  });
}
