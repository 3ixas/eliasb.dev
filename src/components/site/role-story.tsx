import Link from "next/link";
import {
  Arrowed,
  StoryEvidence,
  StoryOpening,
  StorySection,
  StoryNext,
  StorySectionLinks,
  storyColours,
} from "@/components/site/story";
import { RoleStoryFigureBlock } from "@/components/site/role-story-figures";
import { StaffPass } from "@/components/site/staff-pass";
import { SubpageHeader } from "@/components/site/subpage-header";
import { roleStories } from "@/content/stretch/role-stories";
import {
  hasLongEmployer,
  roleStoryBack,
  roleStoryColours,
  roleStoryCopy,
  roleStoryMetadata,
  roleStorySectionKeys,
  roleStorySectionLabels,
  type RoleStory,
} from "@/content/stretch/role-story";
import { siteCopy } from "@/content/stretch/site-copy";
import { railPass } from "@/content/stretch/work";

/**
 * A Role story (GLOSSARY.md): the same shape as a case study, for an employer.
 * An opening band in the employer's colour with the employer's Staff pass hung
 * in it, the row of section links, a neutral reading column with the six
 * sections in their fixed order, and the evidence strip under What changed, and
 * it ends on the Next role tile or, on the last story, "← Work". It has no
 * entrance, the server renders all of it, and the only cobalt on the page is the
 * focus ring, selection and the pass's award pins.
 */
export function RoleStoryPage({ story }: { story: RoleStory }) {
  const colours = roleStoryColours(story.colours);
  const { state, tilt } = railPass(story.slug);

  return (
    <div data-stretch-shell data-role-story={story.slug}>
      <SubpageHeader />

      <main id="main-content" tabIndex={-1}>
        <article aria-labelledby="role-story-title">
          <StoryOpening
            colours={colours}
            back={
              <Link className="stretch-cs-back" href={roleStoryBack.href}>
                <Arrowed label={roleStoryBack.label} />
              </Link>
            }
            number={story.number}
            titleId="role-story-title"
            name={story.employer}
            nameClassName={hasLongEmployer(story) ? "stretch-role-name--long" : undefined}
            lead={story.role}
            aside={
              <div className="stretch-role-pass">
                <StaffPass slug={story.slug} state={state} size="lg" tilt={tilt} linked={false} pins lean onBand />
              </div>
            }
          >
            <p className="stretch-mono stretch-cs-open__meta">{roleStoryMetadata(story)}</p>
          </StoryOpening>
          <StorySectionLinks sections={roleStorySections} />
          <div className="stretch-cs-body stretch-wrap">
            {roleStorySectionKeys.map((key, position) => (
              <StorySection key={key} id={key} label={roleStorySectionLabels[key]} position={position} section={story.sections[key]}>
                {story.figures?.[key] && (
                  <div className="stretch-role-figures" style={storyColours(colours)}>
                    <RoleStoryFigureBlock figure={story.figures[key]} />
                  </div>
                )}
                {key === "what-changed" && (
                  <div className="stretch-role-evidence" style={storyColours(colours)}>
                    <StoryEvidence evidence={story.evidence} />
                  </div>
                )}
              </StorySection>
            ))}
          </div>
        </article>
        {story.next ? (
          <NextRole next={roleStories[story.next]} />
        ) : (
          <nav className="stretch-wrap stretch-role-end" aria-label="More">
            <Link className="stretch-cs-back" href={roleStoryBack.href}>
              <Arrowed label={roleStoryBack.label} />
            </Link>
          </nav>
        )}
      </main>

      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
    </div>
  );
}

const roleStorySections = roleStorySectionKeys.map((key) => ({ key, label: roleStorySectionLabels[key] }));

function NextRole({ next }: { next: RoleStory }) {
  return (
    <StoryNext
      label={roleStoryCopy.nextRole}
      href={`/work/${next.slug}`}
      colours={roleStoryColours(next.colours)}
      number={next.number}
      name={next.employer}
      outcome={next.role}
    />
  );
}
