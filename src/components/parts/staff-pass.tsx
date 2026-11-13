import Image from "next/image";
import type { CSSProperties } from "react";
import { roleStories } from "@/content/stretch/role-stories";
import type { RoleStorySlug } from "@/content/stretch/role-story";
import { passName } from "@/content/stretch/pass-name";
import { passHang, passRecords, passStatus } from "@/content/stretch/staff-pass";

/** The white-tux portrait, cropped as the pass prints it (DESIGN.md "The staff pass"). */
const portrait = { src: "/profile/elias-evening-pass.webp", width: 352, height: 426 } as const;

/**
 * A staff pass (DESIGN.md "The staff pass", R-12): a printed CR80 card hanging from a two-ply lanyard by a metal clip
 * whose legs pass through the slot. Top to bottom it prints the employer's band, the portrait with the name, role and
 * dates, three points and the status with a barcode. The current pass is in colour with a hologram; a returned one is
 * greyscale. It keeps its printed colours in both themes. The drawing is hidden from assistive technology; the pass's
 * name is its print. With `href` it is a link (the homepage's, to its employer in Work); without, it is an image (a Role
 * story's own pass, which has nowhere further to go). Sizes inside are in em of the card's width ÷ 14.5 (pass.css).
 */
export function StaffPass({ slug, href, lead = false, drop = 1, priority = false }: { slug: RoleStorySlug; href?: string; lead?: boolean; drop?: number; priority?: boolean }) {
  const { short, points, lanyard } = passRecords[slug];
  const { role, dates, panel } = roleStories[slug];
  const { state, tilt } = passHang[slug];
  const style = { "--field": panel.field, "--band-ink": panel.ink, "--lanyard": lanyard, "--tilt": `${tilt}deg`, "--drop-by": drop } as CSSProperties;
  const Tag = href ? "a" : "div";
  return (
    <Tag className={lead ? "pass pass--lead" : "pass"} {...(href ? { href } : { role: "img" })} style={style} data-state={state} aria-label={passName(slug)}>
      <span className="pass__lanyard" aria-hidden="true">
        <i />
        <i />
      </span>
      <svg className="pass__clip" viewBox="0 0 40 70" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`pass-metal-${slug}`} x1="0" x2="1">
            <stop offset="0" stopColor="#8d8e94" />
            <stop offset=".28" stopColor="#f6f6f7" />
            <stop offset=".55" stopColor="#b4b5ba" />
            <stop offset=".8" stopColor="#e9e9eb" />
            <stop offset="1" stopColor="#7f8086" />
          </linearGradient>
        </defs>
        <rect x="9" y=".5" width="22" height="15" rx="2.5" fill={`url(#pass-metal-${slug})`} stroke="#4e4f55" strokeWidth=".8" />
        <circle cx="20" cy="8" r="2.1" fill="#5d5e64" />
        <circle cx="19.5" cy="7.5" r=".8" fill="#e9e9eb" />
        <rect x="17.3" y="15" width="5.4" height="8" rx="2" fill={`url(#pass-metal-${slug})`} stroke="#4e4f55" strokeWidth=".6" />
        <rect x="9.5" y="22.5" width="21" height="43" rx="10.5" fill="none" stroke="#4e4f55" strokeWidth="4.6" />
        <rect x="9.5" y="22.5" width="21" height="43" rx="10.5" fill="none" stroke={`url(#pass-metal-${slug})`} strokeWidth="3.2" />
      </svg>
      <span className="pass__card" aria-hidden="true">
        <span className="pass__band">
          <span>{short}</span>
        </span>
        <i className="pass__slot" />
        <Image className="pass__photo" src={portrait.src} width={portrait.width} height={portrait.height} alt="" sizes="80px" preload={priority} />
        <span className="pass__who">
          <b>Elias Bennett</b>
          <span>{role}</span>
          <span>{dates}</span>
        </span>
        <span className="pass__points">
          {points.map(({ lead: point, detail }) => (
            <span key={point}>
              <b>{point}</b>
              <span>{detail}</span>
            </span>
          ))}
        </span>
        <span className="pass__foot">
          <span className="pass__status">
            {state === "current" && <i className="pass__holo" />}
            {passStatus(state)}
          </span>
          <i className="pass__code" />
        </span>
        <i className="pass__sheen" />
      </span>
    </Tag>
  );
}
