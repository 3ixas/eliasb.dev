import { createElement } from "react";
import type { FantasySignal } from "@/integrations/types";

type MatchupScores = Pick<FantasySignal, "matchupLabel" | "teamScore" | "opponentScore">;

function isScore(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function scoreWidths(teamScore: number, opponentScore: number) {
  const total = teamScore + opponentScore;
  const teamShare = total > 0 ? (teamScore / total) * 100 : 50;
  const teamPercent = Math.max(12, Math.min(88, Math.round(teamShare)));

  return { team: `${teamPercent}%`, opponent: `${100 - teamPercent}%` };
}

function formatScore(value: number | undefined) {
  return isScore(value) ? value.toFixed(1) : "—";
}

export function FantasyMatchup({ signal }: { signal: MatchupScores }) {
  const teamScore = signal.teamScore;
  const opponentScore = signal.opponentScore;
  const widths = isScore(teamScore) && isScore(opponentScore)
    ? scoreWidths(teamScore, opponentScore)
    : null;

  return createElement(
    "div",
    {
      className: "fantasy-scoreboard",
      role: "group",
      "aria-label": `${signal.matchupLabel} fantasy football matchup`,
    },
    createElement(
      "div",
      { className: "fantasy-matchup-heading" },
      createElement("span", null, "Weekly matchup"),
      createElement("span", null, signal.matchupLabel),
    ),
    createElement(
      "div",
      { className: "matchup" },
      createElement(
        "div",
        { className: "matchup-side" },
        createElement("span", null, "My team"),
        createElement("strong", null, formatScore(teamScore)),
        createElement("small", null, "points"),
      ),
      createElement("span", { className: "matchup-versus", "aria-hidden": "true" }, "vs"),
      createElement(
        "div",
        { className: "matchup-side" },
        createElement("span", null, "Opponent"),
        createElement("strong", null, formatScore(opponentScore)),
        createElement("small", null, "points"),
      ),
    ),
    widths && createElement(
      "div",
      { className: "matchup-bars", "aria-hidden": "true" },
      createElement("span", { style: { width: widths.team } }),
      createElement("span", { style: { width: widths.opponent } }),
    ),
  );
}
