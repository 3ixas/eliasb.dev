import { Fragment, type ReactNode } from "react";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { FullPass, MiniPass, PassPins } from "@/components/quiet/finished-pass";
import { openingLooks } from "@/components/quiet/opening-looks";
import { RevealWord } from "@/components/quiet/reveal-word";
import { BackLink, LongForm, LongFormOpening, LongFormSectionBlock, NextRow } from "@/components/site/long-form";
import { PassHang } from "@/components/site/staff-pass-hang";
import { RoleStoryFigureBlock } from "@/components/site/role-story-figures";
import { revealDescription } from "@/content/stretch/opening";
import { roleStories } from "@/content/stretch/role-stories";
import {
  evidenceBeyondPass,
  hasLongEmployer,
  roleStoryBack,
  roleStoryCopy,
  roleStoryReveals,
  roleStorySectionKeys,
  roleStorySectionLabels,
  type RoleStory,
  type RoleStoryReveal,
  type RoleStorySectionKey,
} from "@/content/stretch/role-story";
import { passRecords } from "@/content/stretch/staff-pass";
import { work } from "@/content/stretch/work";

/**
 * A Role story (GLOSSARY.md) on the long-form template: the shared header with its six sections as links, a back
 * link, the employer as the title with its role and dates, the employer's Staff pass with its Pass pins beside
 * them, the six sections in their fixed order with the evidence beneath Summary, and one row to the next role (the
 * last story ends on "← Work"). A figure the paragraph argues from sits inline; a real thing a sentence only
 * names (the cores, the award's certificate) is a closer look on that word. The server renders all of it.
 */
export function RoleStoryPage({ story }: { story: RoleStory }) {
  const employer = work.employers.find(({ slug }) => slug === story.slug)!;
  const reveals = roleStoryReveals[story.slug] ?? [];
  const looks = openingLooks();
  const { headline } = passRecords[story.slug];
  const onPass = [headline.value, headline.label, ...employer.pins.flatMap(({ label, detail }) => [label, detail])];
  const evidence = evidenceBeyondPass(story.evidence, onPass);
  const next = story.next ? roleStories[story.next] : null;

  return (
    <LongForm
      attrs={{ "data-role-story": story.slug }}
      sections={roleStorySectionKeys.map((key) => ({ id: key, label: roleStorySectionLabels[key] }))}
    >
      <article className="stretch-wrap qi-long" aria-labelledby="role-story-title">
        <CloserLookRoot className="qi-column" looks={Object.fromEntries(reveals.map(({ id }) => [id, looks[id]]))}>
          <BackLink href={roleStoryBack.href} label={roleStoryBack.label} />
          <LongFormOpening
            titleId="role-story-title"
            title={story.employer}
            long={hasLongEmployer(story)}
            line={story.role}
            meta={[story.setting, story.dates].filter((part): part is string => !!part)}
            aside={
              <PassHang className="qi-long__pass" pass="employer">
                <FullPass slug={story.slug} countFrom={employer.countFrom} />
              </PassHang>
            }
            below={<PassPins pins={employer.pins} />}
          />
          {roleStorySectionKeys.map((key) => (
            <LongFormSectionBlock key={key} id={key} title={roleStorySectionLabels[key]}>
              <SectionText story={story} sectionKey={key} reveals={reveals.filter(({ section }) => section === key)} />
              {key === "summary" && evidence.length > 0 && (
                <ul className="qi-long__evidence" aria-label="Evidence">
                  {evidence.map(({ value, label }) => (
                    <li key={label}>
                      <strong>{value}</strong>
                      <span className="stretch-mono">{label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {story.figures?.[key] && <RoleStoryFigureBlock figure={story.figures[key]} />}
            </LongFormSectionBlock>
          ))}
          {reveals.map(({ id }) => (
            <p key={id} id={`${id}-description`} hidden>
              {revealDescription[id]}
            </p>
          ))}
        </CloserLookRoot>
        {next ? (
          <div className="qi-column">
            <NextRow
              label={roleStoryCopy.nextRole}
              href={`/work/${next.slug}`}
              object={<MiniPass slug={next.slug} />}
              title={passRecords[next.slug].short}
              line={`${next.role} · ${next.dates}`}
            />
          </div>
        ) : (
          <nav className="qi-column qi-long__end" aria-label="More">
            <BackLink href={roleStoryBack.href} label={roleStoryBack.label} />
          </nav>
        )}
      </article>
    </LongForm>
  );
}

/** A section's text: its paragraphs, each followed by the slot where a tapped word's look opens, then its points. */
function SectionText({ story, sectionKey, reveals }: { story: RoleStory; sectionKey: RoleStorySectionKey; reveals: readonly RoleStoryReveal[] }) {
  const { paragraphs, points } = story.sections[sectionKey];
  return (
    <>
      {paragraphs?.map((paragraph) => {
        const marked = reveals.filter(({ phrase }) => paragraph.includes(phrase));
        return (
          <Fragment key={paragraph}>
            <p className="qi-long__p">{withReveals(paragraph, marked)}</p>
            {marked.map(({ id }) => (
              <div key={id} className="qi-inline" data-look-slot={id} aria-hidden="true" />
            ))}
          </Fragment>
        );
      })}
      {points?.map(({ lead, text }) => (
        <p key={lead} className="qi-long__p">
          <strong>{lead}</strong> {text}
        </p>
      ))}
    </>
  );
}

/** The paragraph with each marked phrase made a reveal word. */
function withReveals(text: string, reveals: readonly RoleStoryReveal[]): ReactNode {
  const parts: ReactNode[] = [];
  let from = 0;
  for (const { phrase, id } of [...reveals].sort((a, b) => text.indexOf(a.phrase) - text.indexOf(b.phrase))) {
    const at = text.indexOf(phrase, from);
    parts.push(text.slice(from, at), <RevealWord key={id} id={id}>{phrase}</RevealWord>);
    from = at + phrase.length;
  }
  parts.push(text.slice(from));
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
