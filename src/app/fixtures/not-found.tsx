import "../pass.css";
import "../story.css";
import { NotFoundView, notFoundMetadata } from "@/components/site/not-found-view";

export const metadata = notFoundMetadata;

/** The 404 a switched-off fixture shows: its `notFound()` stops at this boundary, inside the root layout. */
export default function FixturesNotFound() {
  return <NotFoundView />;
}
