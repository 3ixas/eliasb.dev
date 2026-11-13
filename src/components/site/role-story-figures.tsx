import type { CSSProperties } from "react";
import { OnView } from "@/components/parts/on-view";
import { Panel } from "@/components/parts/panel";
import { SiteLink } from "@/components/site/site-link";
import { columnImageSizes, StoryImage } from "@/components/site/story-parts";
import { ZoomableImage } from "@/components/site/zoomable-image";
import type { RoleStoryFigure } from "@/content/stretch/role-story";
import type { PanelColours } from "@/content/stretch/story";

/**
 * The figure a Role story argues from, in the text column with a muted caption beneath (DESIGN.md "Figures", R-21): the
 * flag and the comparisons on a panel in the employer's colour; screenshots and the certificate as they are, with a
 * hairline edge, each opening large in a dialog.
 */
export function RoleStoryFigureBlock({ figure, panel }: { figure: RoleStoryFigure; panel: PanelColours }) {
  switch (figure.kind) {
    case "flag":
      return <FlagFigure figure={figure} panel={panel} />;
    case "scale":
      return <ScaleFigure figure={figure} panel={panel} />;
    case "screens":
      return <ScreensFigure figure={figure} />;
    case "certificate":
      return <CertificateFigure figure={figure} />;
  }
}

/** Two lanes: today's path, live, and the new one behind a switch that is off. */
function FlagFigure({ figure, panel }: { figure: Extract<RoleStoryFigure, { kind: "flag" }>; panel: PanelColours }) {
  return (
    <figure className="story-fig">
      <Panel colours={panel} className="story-fig__panel">
        <div className="lanes">
          <p className="lane">
            <span>{figure.live}</span>
            <i aria-hidden="true" />
          </p>
          <p className="lane lane--new">
            <span>{figure.toggled}</span>
            <span className="lane__switch" aria-hidden="true" />
            <i aria-hidden="true" />
            <b>{figure.state}</b>
          </p>
        </div>
      </Panel>
      <figcaption>{figure.caption}</figcaption>
    </figure>
  );
}

/** Each comparison's two bars share a unit, so their lengths compare; they grow to their share once, arriving below the fold. */
function ScaleFigure({ figure, panel }: { figure: Extract<RoleStoryFigure, { kind: "scale" }>; panel: PanelColours }) {
  return (
    <figure className="story-fig">
      <Panel colours={panel} className="story-fig__panel">
        <OnView motion="grow">
          <ul className="cmps">
            {figure.rows.map(({ what, before, after }) => {
              const longest = Math.max(before.amount, after.amount);
              return (
                <li key={what}>
                  <h3>{what}</h3>
                  <p className="cmp">
                    <span>Before</span>
                    <b>{before.label}</b>
                    <i className="bar" style={{ "--share": before.amount / longest } as CSSProperties} aria-hidden="true" />
                  </p>
                  <p className="cmp cmp--after">
                    <span>After</span>
                    <b>{after.label}</b>
                    <i className="bar bar--after" style={{ "--share": after.amount / longest } as CSSProperties} aria-hidden="true" />
                  </p>
                </li>
              );
            })}
          </ul>
        </OnView>
      </Panel>
      <figcaption>{figure.caption}</figcaption>
    </figure>
  );
}

/** The award's certificate, at column width; its id lets an address name it. */
function CertificateFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "certificate" }> }) {
  return <StoryImage id={figure.id} src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} caption={figure.caption} />;
}

/** Screenshots of a public page, never edited: the link beneath says what and when they are, and goes to where they were taken. */
function ScreensFigure({ figure }: { figure: Extract<RoleStoryFigure, { kind: "screens" }> }) {
  // Without a phone screenshot beside it, a desktop screenshot takes the whole column.
  const withPhone = figure.images.some(({ device }) => device === "phone");
  const desktopSizes = withPhone ? "(min-width: 1260px) 560px, (min-width: 720px) 45vw, 72vw" : columnImageSizes;
  return (
    <figure className="story-fig">
      <div className="story-fig__shots">
        {figure.images.map(({ src, alt, width, height, device }) => (
          <div key={src} className="story-fig__shot" data-device={device} style={{ "--ar": width / height } as CSSProperties}>
            <ZoomableImage src={src} alt={alt} width={width} height={height} sizes={device === "phone" ? "(min-width: 720px) 180px, 24vw" : desktopSizes} />
          </div>
        ))}
      </div>
      <figcaption>
        <SiteLink className="story-fig__source" href={figure.source.href}>
          {figure.source.label} <span aria-hidden="true">↗</span>
        </SiteLink>
      </figcaption>
    </figure>
  );
}
