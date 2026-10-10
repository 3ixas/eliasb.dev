import Link from "next/link";
import { LightsPill } from "@/components/site/lights-pill";

/** The slim header on pages that aren't the homepage: a way home and Lights. */
export function SubpageHeader() {
  return (
    <header className="stretch-header">
      <a className="stretch-skip" href="#main-content">
        Skip to content
      </a>
      <div className="stretch-wrap stretch-header__inner">
        <Link className="stretch-pill stretch-cs-home" href="/" aria-label="Elias Bennett, home">
          Elias Bennett
        </Link>
        <LightsPill />
      </div>
    </header>
  );
}
