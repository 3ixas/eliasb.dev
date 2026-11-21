import { ViewTransition, type ReactNode } from "react";
import type { CaseStudySlug } from "@/content/projects";
import { caseStudies } from "@/content/stretch/case-studies";
import { roleStories } from "@/content/stretch/role-stories";
import type { RoleStorySlug } from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";

export type TitleTransitionStyle = "route-title" | "route-title-swap";
export type EmployerTitleName = `route-title-employer-${RoleStorySlug}`;
export type ProjectTitleName = `route-title-project-${CaseStudySlug}`;
export type TitleTransitionName = EmployerTitleName | ProjectTitleName;
export type TitleTransitionShare = TitleTransitionStyle | Record<"default" | (string & {}), TitleTransitionStyle | "none">;
export type PanelTitleTransition = { name: TitleTransitionName; share: TitleTransitionShare };

/** Shared view-transition name for a project's title across the homepage, archive, case study and next-project panel (#472). */
export const projectTitleTransition = (slug: CaseStudySlug): ProjectTitleName => `route-title-project-${slug}`;

/** Shared view-transition name for an employer's title across Work, Role story and next-role panel (#472). */
export const employerTitleTransition = (slug: RoleStorySlug): EmployerTitleName => `route-title-employer-${slug}`;

/** Uses a non-stretching box crossfade when the panel's short name differs from the Role story's full h1 (Optegra). */
export const employerTitleStyle = (slug: RoleStorySlug): TitleTransitionStyle =>
  roleStories[slug].employer === passRecords[slug].short ? "route-title" : "route-title-swap";

/** Link transition types identifying which title this navigation is following so sibling panels stay inert. */
export const titleLinkTypes = (name: TitleTransitionName): [TitleTransitionName] => [name];

const employerNames = (Object.keys(roleStories) as RoleStorySlug[]).map(employerTitleTransition);
const projectNames = (Object.keys(caseStudies) as CaseStudySlug[]).map(projectTitleTransition);

function isCaseStudySlug(slug: string): slug is CaseStudySlug {
  return Object.hasOwn(caseStudies, slug);
}

/**
 * Lets a panel title (Work, ProjectPanel, or NextPanel) pair on its own link navigation or on an untyped browser Back,
 * while suppressing it whenever a sibling panel's link is followed so no bystander title leaves a ghost snapshot.
 */
function panelShare(name: TitleTransitionName, siblings: readonly TitleTransitionName[], style: TitleTransitionStyle): TitleTransitionShare {
  const share: Record<"default" | (string & {}), TitleTransitionStyle | "none"> = { default: style };
  for (const sibling of siblings) {
    share[sibling] = sibling === name ? style : "none";
  }
  return share;
}

export const employerPanelTransition = (slug: RoleStorySlug): PanelTitleTransition => {
  const name = employerTitleTransition(slug);
  return { name, share: panelShare(name, employerNames, employerTitleStyle(slug)) };
};

export const projectPanelTransition = (slug: string): PanelTitleTransition | undefined => {
  if (!isCaseStudySlug(slug)) return undefined;
  const name = projectTitleTransition(slug);
  return { name, share: panelShare(name, projectNames, "route-title") };
};

/**
 * Marks a heading element as a shared route-transition title (#472, re-scoped by #493).
 * Renders its child directly with no wrapper DOM node; only the named pair participates in a route transition.
 */
export function TitleTransition({
  name,
  share = "route-title",
  children,
}: {
  name?: TitleTransitionName;
  share?: TitleTransitionShare;
  children: ReactNode;
}) {
  if (!name) return children;
  return (
    <ViewTransition name={name} share={share} default="none">
      {children}
    </ViewTransition>
  );
}
