import { bricolage } from "@/app/og-font";
import { roleStoryFor, roleStorySlugs } from "@/content/stretch/role-stories";
import { siteCopy } from "@/content/stretch/site-copy";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

export const alt = "Elias Bennett: a role story, in the employer’s colour";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return roleStorySlugs.map((slug) => ({ slug }));
}

/**
 * The Role story's social card: the employer's colour, its name large, the role
 * beneath and Elias's name at the foot. No dates and no logo. Satori can't read
 * custom properties or light-dark(), so it takes the light pair as plain values.
 */
export default async function RoleStoryImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = roleStoryFor(slug);
  if (!story) notFound();
  const { field, ink } = story.colours.light;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px 68px",
        color: ink,
        fontFamily: "Bricolage",
        fontWeight: 800,
        backgroundColor: field,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", rowGap: 12 }}>
        <div style={{ display: "flex", fontSize: 168, lineHeight: 0.95, letterSpacing: -2, textTransform: "uppercase" }}>
          {story.employer}
        </div>
        <div style={{ display: "flex", fontSize: 56 }}>{story.role}</div>
      </div>
      <div style={{ display: "flex", fontSize: 40, letterSpacing: 4 }}>{siteCopy.socialImage.name}</div>
    </div>,
    { ...size, fonts: [await bricolage()] },
  );
}
