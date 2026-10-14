import Link from "next/link";
import {
  Arrowed,
  StoryEvidence,
  StoryOpening,
  StorySection,
  StorySectionLinks,
  storyColours,
} from "@/components/site/story";
import { SubpageHeader } from "@/components/site/subpage-header";
import {
  roleStoryBack,
  roleStoryColours,
  roleStorySectionKeys,
  roleStorySectionLabels,
  type RoleStory,
} from "@/content/stretch/role-story";
import { siteCopy } from "@/content/stretch/site-copy";

/**
 * A Role story (GLOSSARY.md): the same shape as a case study, for an employer.
 * An opening band in the employer's colour, the row of section links, a neutral
 * reading column with the six sections in their fixed order, and the evidence
 * strip under What changed. It has no entrance, the server renders all of it,
 * and the only cobalt on the page is the focus ring and selection.
 */
export function RoleStoryPage({ story }: { story: RoleStory }) {
  const colours = roleStoryColours(story.colours);

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
            lead={story.role}
            aside={null}
          >
            <p className="stretch-mono stretch-cs-open__meta">{story.metadata}</p>
          </StoryOpening>
          <StorySectionLinks sections={roleStorySections} />
          <div className="stretch-cs-body stretch-wrap">
            {roleStorySectionKeys.map((key, position) => (
              <StorySection key={key} id={key} label={roleStorySectionLabels[key]} position={position} section={story.sections[key]}>
                {key === "what-changed" && (
                  <div className="stretch-role-evidence" style={storyColours(colours)}>
                    <StoryEvidence evidence={story.evidence} />
                  </div>
                )}
              </StorySection>
            ))}
          </div>
        </article>
        <nav className="stretch-wrap stretch-role-end" aria-label="More">
          <Link className="stretch-cs-back" href={roleStoryBack.href}>
            <Arrowed label={roleStoryBack.label} />
          </Link>
        </nav>
      </main>

      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
    </div>
  );
}

const roleStorySections = roleStorySectionKeys.map((key) => ({ key, label: roleStorySectionLabels[key] }));
