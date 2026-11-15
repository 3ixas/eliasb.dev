import { PassLight } from "@/components/parts/pass-light";
import { StaffPass } from "@/components/parts/staff-pass";
import { LongForm } from "@/components/site/long-form";
import { RoleStoryFigureBlock } from "@/components/site/role-story-figures";
import { EvidenceFigures, NextPanel, StoryBack, StorySection, StoryText } from "@/components/site/story-parts";
import { roleStories } from "@/content/stretch/role-stories";
import { hasLongEmployer, roleStoryBack, roleStoryCopy, roleStorySectionKeys, roleStorySectionLabels, type RoleStory } from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";

/** Every section after the summary, which is the opening's lede rather than a section of its own. */
const sectionKeys = roleStorySectionKeys.filter((key) => key !== "summary");

/**
 * A Role story (GLOSSARY.md; DESIGN.md "Long-form pages", R-21): "← Work"; the employer as the title with its role,
 * dates and setting on one line, the summary as the lede and the story's evidence figures, beside that employer's staff
 * pass; then its sections, each heading at the left and its text at the right with the figure it argues from; then the
 * next role as a panel in that employer's colour, and Say hello. The last story ends on "← Work" instead. The server
 * renders all of it.
 */
export function RoleStoryPage({ story }: { story: RoleStory }) {
  const next = story.next ? roleStories[story.next] : null;
  const meta = [story.role, story.dates, story.setting].filter((part): part is string => !!part);

  return (
    <LongForm attrs={{ "data-role-story": story.slug }}>
      <article className="frame story" aria-labelledby="role-story-title">
        <header className="story-open">
          <div className="story-open__text">
            <StoryBack href={roleStoryBack.href} label={roleStoryBack.label} />
            <h1 id="role-story-title" className="story-open__title" data-long={hasLongEmployer(story) ? "" : undefined}>
              {story.employer}
            </h1>
            <p className="story-open__meta">
              {meta.map((part) => (
                <span key={part} className="story-open__part">
                  {part}
                </span>
              ))}
            </p>
            <p className="story-open__lede">{story.sections.summary.paragraphs[0]}</p>
            <EvidenceFigures evidence={story.evidence} />
          </div>
          <PassLight className="story-open__rail">
            <StaffPass slug={story.slug} lead priority />
          </PassLight>
        </header>
        {sectionKeys.map((key) => (
          <StorySection key={key} id={key} title={roleStorySectionLabels[key]}>
            <StoryText body={story.sections[key]} />
            {story.figures?.[key] && <RoleStoryFigureBlock figure={story.figures[key]} panel={story.panel} />}
          </StorySection>
        ))}
      </article>
      {next ? (
        <NextPanel label={roleStoryCopy.nextRole} href={`/work/${next.slug}`} name={passRecords[next.slug].short} line={`${next.role} · ${next.dates}`} colours={next.panel} />
      ) : (
        <nav className="frame story-next" aria-label="Back to Work">
          <StoryBack href={roleStoryBack.href} label={roleStoryBack.label} />
        </nav>
      )}
    </LongForm>
  );
}
