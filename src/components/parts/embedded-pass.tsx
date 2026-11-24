import Image from "next/image";
import { siteName } from "@/content/site";
import { passName } from "@/content/stretch/pass-name";
import { roleStories } from "@/content/stretch/role-stories";
import type { RoleStorySlug } from "@/content/stretch/role-story";
import { passHang, passPortrait, passRecords, passStatus, unbrokenEnds } from "@/content/stretch/staff-pass";

/**
 * Compact embedded employer pass inside a Role story's coloured hero banner (DESIGN.md "The staff pass" and
 * "Long-form pages", R-52): not a link, seated on the hero's translucent well so full-strength panel ink stays AA on
 * bright fields (BNP Paribas) and dark fields (Joveen, Optegra). Its accessible name is the pass's whole print; visible
 * text stays un-hidden so rendered contrast checks measure every run on the well.
 */
export function EmbeddedPass({ slug, priority = false }: { slug: RoleStorySlug; priority?: boolean }) {
  const { role, dates } = roleStories[slug];
  const { short } = passRecords[slug];
  const { state } = passHang[slug];
  return (
    <div className="embedded-pass" role="img" aria-label={passName(slug)} data-state={state}>
      <Image className="embedded-pass__photo" src={passPortrait.src} width={passPortrait.width} height={passPortrait.height} alt="" sizes="72px" preload={priority} />
      <div className="embedded-pass__body">
        <span className="embedded-pass__org">{short}</span>
        <b className="embedded-pass__name">{siteName}</b>
        <span className="embedded-pass__role">{role}</span>
        <span className="embedded-pass__dates">{unbrokenEnds(dates)}</span>
        <span className="embedded-pass__status">
          {state === "current" && <i className="embedded-pass__holo" aria-hidden="true" />}
          {passStatus(state)}
        </span>
      </div>
    </div>
  );
}
