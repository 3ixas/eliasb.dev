import { GitHubSheet } from "@/components/board/github-sheet";
import { Pin } from "@/components/board/pin";
import { PinSlot } from "@/components/board/pin-states";
import { pinStatus } from "@/integrations/pin-rules";
import type { GitHubSignal } from "@/integrations/types";

/** The GitHub year, taped across the Board on graph paper. */
export function GitHubPin({ github, now }: { github: GitHubSignal; now: Date }) {
  return (
    <PinSlot status={pinStatus("github", github, now)} data-board-pin="github" className="board:col-span-12">
      <Pin object="sheet" fixing="tape" surface="linen" looseness="loose" tilt={0.4} stock="graph" className="px-5 pt-7 pb-6 sm:px-8">
        <GitHubSheet activity={github.activity} total={github.total} href={github.href} />
      </Pin>
    </PinSlot>
  );
}
