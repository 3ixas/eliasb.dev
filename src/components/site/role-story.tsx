import { Panel } from "@/components/parts/panel";
import { PassLight } from "@/components/parts/pass-light";
import { StaffPass } from "@/components/parts/staff-pass";
import { employerPanelTransition, employerTitleStyle, employerTitleTransition, titleLinkTypes, TitleTransition } from "@/components/parts/title-transition";
import { LongForm } from "@/components/site/long-form";
import { RoleStoryFigureBlock } from "@/components/site/role-story-figures";
import { EvidenceFigures, NextPanel, StoryBack, StoryChapters, StorySection, StoryText } from "@/components/site/story-parts";
import { roleStories } from "@/content/stretch/role-stories";
import { hasLongEmployer, roleStoryBack, roleStoryCopy, roleStorySectionKeys, roleStorySectionLabels, type RoleStory } from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";

/** Every section after the summary, which is the opening's lede rather than a section of its own. */
const sectionKeys = roleStorySectionKeys.filter((key) => key !== "summary");

/**
 * A Role story (GLOSSARY.md; DESIGN.md "Long-form pages", R-21, R-52, R-53): a coloured employer hero panel holding
 * "← Work", the employer title, role/dates/setting, summary lede, and bordered evidence strip, beside that employer's
 * hanging Staff pass (which hangs from a quiet rail hairline beneath the panel under 960 px); then a sticky left
 * chapter rail (from 960 px) beside the reading column of sections, structured Problem and Decision cards, and figures;
 * then the next role panel and Say hello. The last story ends on "← Work" instead.
 */
export function RoleStoryPage({ story }: { story: RoleStory }) {
  const next = story.next ? roleStories[story.next] : null;
  // A setting of two facts ("Risk division · London") is two parts, so the stylesheet spaces every dot alike.
  const meta = [story.role, story.dates, ...(story.setting?.split(" · ") ?? [])];
  const titleName = employerTitleTransition(story.slug);
  const chapters = sectionKeys.map((key) => ({ id: key, title: roleStorySectionLabels[key] }));

  return (
    <LongForm attrs={{ "data-role-story": story.slug }}>
      <article className="frame story" aria-labelledby="role-story-title">
        <header className="story-open">
          <Panel as="div" colours={story.panel} className="story-open__card">
            <div className="story-open__text">
              <StoryBack href={roleStoryBack.href} label={roleStoryBack.label} transitionTypes={titleLinkTypes(titleName)} />
              <TitleTransition name={titleName} share={employerTitleStyle(story.slug)}>
                <h1 id="role-story-title" className="story-open__title" data-long={hasLongEmployer(story) ? "" : undefined}>
                  {story.employer}
                </h1>
              </TitleTransition>
              <p className="story-open__meta">
                {meta.map((part) => (
                  <span key={part} className="story-open__part">
                    {part}
                  </span>
                ))}
              </p>
              <p className="story-open__lede">{story.sections.summary.paragraphs[0]}</p>
            </div>
            <EvidenceFigures evidence={story.evidence} />
          </Panel>
          <PassLight className="story-open__rail">
            <StaffPass slug={story.slug} lead priority />
          </PassLight>
        </header>
        <StoryChapters items={chapters} label="Story sections">
          {sectionKeys.map((key) => (
            <StorySection key={key} id={key} title={roleStorySectionLabels[key]}>
              <StoryText body={story.sections[key]} />
              {story.figures?.[key] && <RoleStoryFigureBlock figure={story.figures[key]} panel={story.panel} />}
            </StorySection>
          ))}
        </StoryChapters>
      </article>
      {next ? (
        <NextPanel label={roleStoryCopy.nextRole} href={`/work/${next.slug}`} name={passRecords[next.slug].short} line={`${next.role} · ${next.dates}`} colours={next.panel} transition={employerPanelTransition(next.slug)} />
      ) : (
        <nav className="frame story-next" aria-label="Back to Work">
          <StoryBack href={roleStoryBack.href} label={roleStoryBack.label} transitionTypes={titleLinkTypes(titleName)} />
        </nav>
      )}
    </LongForm>
  );
}
