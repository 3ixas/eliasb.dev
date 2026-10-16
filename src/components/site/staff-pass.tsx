import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PassHang } from "@/components/site/staff-pass-hang";
import { passLean } from "@/components/site/signature-springs";
import { passPhoto } from "@/content/stretch/media";
import { roleStories } from "@/content/stretch/role-stories";
import { roleStoryColours, type RoleStorySlug } from "@/content/stretch/role-story";
import { passLinkLabel, passRecords, passStatus, type PassState } from "@/content/stretch/staff-pass";

/**
 * An employer's Staff pass (GLOSSARY.md): the current one, or a returned one.
 * It links to the employer's Role story when `linked`, and is the opening
 * object of that story when it is not. `lean` hangs it on the lanyard that
 * leans away from the pointer (a pendulum on touch); `pins` wears the awards.
 */
export type EmployerPassProps = {
  slug: RoleStorySlug;
  state: PassState;
  size: "lg" | "sm";
  /** The pass's resting tilt, in degrees; it holds this under reduced motion. */
  tilt: number;
  linked: boolean;
  pins: boolean;
  lean: boolean;
  /** Extra lines under the headline number, such as the current role's proofs. */
  children?: ReactNode;
};

/**
 * The self-issued pass: Where I'm headed, issued by Elias to himself. It has no
 * employer, so no employer colour, status, dates or pins, and it never links or
 * leans: the type says so, and holds still at every width.
 */
export type SelfIssuedPassProps = {
  state: "self-issued";
  /** The pass's heading, in the employer's place. */
  title: string;
  children?: ReactNode;
};

export function StaffPass(props: EmployerPassProps | SelfIssuedPassProps) {
  return props.state === "self-issued" ? <SelfIssuedPass {...props} /> : <EmployerPass {...props} />;
}

/** The lanyard's easing is the same spring the lean plays, so focus straightens the pass the same way. */
const springStyle = { "--pass-ease": passLean.easing, "--pass-ease-ms": `${passLean.duration}ms` };

function EmployerPass({ slug, state, size, tilt, linked, pins, lean, children }: EmployerPassProps) {
  const story = roleStories[slug];
  const record = passRecords[slug];
  const { field, ink, swatch } = roleStoryColours(story.colours);
  const style = { ...springStyle, "--pass-field": field, "--pass-ink": ink, "--pass-swatch": swatch, "--pass-rest": `${tilt}deg` } as CSSProperties;
  const className = `stretch-pass stretch-pass--${size}`;

  const card = (
    <>
      <span className="stretch-pass__slot" aria-hidden="true" />
      <span className="stretch-pass__top stretch-mono">
        <span>Staff · {story.number}</span>
        <span className="stretch-pass__status" data-current={state === "current" || undefined}>
          {passStatus(story, state)}
        </span>
      </span>
      {state === "returned" && <span className="stretch-pass__stamp stretch-mono">Returned</span>}
      <span className="stretch-pass__id">
        <PassPhoto />
        <span className="stretch-pass__who">
          <span className="stretch-pass__title stretch-display">{record.short}</span>
          <span className="stretch-pass__role">{story.role}</span>
          <span className="stretch-pass__dates stretch-mono">{story.dates}</span>
        </span>
      </span>
      <span className="stretch-pass__stat">
        <span className="stretch-pass__value stretch-display">{record.headline.value}</span>
        <span className="stretch-pass__label">{record.headline.label}</span>
      </span>
      {children}
      <span className="stretch-pass__foot stretch-mono">
        <span className="stretch-pass__barcode" aria-hidden="true" />
        {linked && <span>{passLinkLabel(record)}</span>}
      </span>
    </>
  );

  const body = (
    <>
      <span className="stretch-pass__strap" aria-hidden="true" />
      <span className="stretch-pass__clip" aria-hidden="true" />
      {pins && record.pins && (
        <ul className="stretch-pass__pins" aria-label="Awards">
          {record.pins.map((pin) => (
            <li key={pin.label} className="stretch-pass__pin">
              <span className="stretch-pass__pin-label">{pin.label}</span>
              <span className="stretch-pass__pin-detail stretch-mono">{pin.detail}</span>
            </li>
          ))}
        </ul>
      )}
      {linked ? (
        <Link href={`/work/${slug}`} className="stretch-pass__card">
          {card}
        </Link>
      ) : (
        <div className="stretch-pass__card">{card}</div>
      )}
    </>
  );

  return lean ? (
    <PassHang className={className} style={style} pass={state}>
      {body}
    </PassHang>
  ) : (
    <div className={className} style={style} data-pass={state}>
      {body}
    </div>
  );
}

function SelfIssuedPass({ title, children }: SelfIssuedPassProps) {
  return (
    <div className="stretch-pass stretch-pass--lg" data-pass="self-issued" style={springStyle as CSSProperties}>
      <span className="stretch-pass__strap" aria-hidden="true" />
      <span className="stretch-pass__clip" aria-hidden="true" />
      <div className="stretch-pass__card">
        <span className="stretch-pass__slot" aria-hidden="true" />
        <span className="stretch-pass__top stretch-mono">
          <span>Staff pass</span>
          <span className="stretch-pass__status">Self-issued</span>
        </span>
        <span className="stretch-pass__id">
          <PassPhoto />
          <span className="stretch-pass__who">
            <span className="stretch-pass__title stretch-display">{title}</span>
          </span>
        </span>
        {children}
        <span className="stretch-pass__foot stretch-mono">
          <span className="stretch-pass__barcode" aria-hidden="true" />
          <span>Issued by: Elias Bennett</span>
        </span>
      </div>
    </div>
  );
}

function PassPhoto() {
  return <Image className="stretch-pass__photo" src={passPhoto.src} alt="" width={passPhoto.width} height={passPhoto.height} sizes="72px" />;
}
