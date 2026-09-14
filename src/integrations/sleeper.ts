import { signalFallbacks } from "@/content/signal-fallbacks";
import { integrationConfig } from "@/content/integration-config";
import type { FantasySignal } from "@/integrations/types";

const SLEEPER_API = "https://api.sleeper.app/v1";

type SleeperUser = { user_id?: string };
type SleeperState = { week?: number; season_type?: string };
type SleeperRoster = {
  roster_id?: number;
  owner_id?: string;
  settings?: { wins?: number; losses?: number; ties?: number };
};
type SleeperMatchup = { roster_id?: number; matchup_id?: number | null; points?: number };

async function sleeperJson<T>(path: string): Promise<T> {
  const response = await fetch(`${SLEEPER_API}${path}`, {
    next: { revalidate: 3600, tags: ["sleeper-signal"] },
    signal: AbortSignal.timeout(3500),
  });

  if (!response.ok) throw new Error(`Sleeper returned ${response.status}`);
  return response.json() as Promise<T>;
}

function score(value: number | undefined) {
  return typeof value === "number" ? value.toFixed(1) : "—";
}

export async function getFantasySignal(): Promise<FantasySignal> {
  const { username, leagueId } = integrationConfig.sleeper;

  try {
    const [user, state, rosters] = await Promise.all([
      sleeperJson<SleeperUser>(`/user/${encodeURIComponent(username)}`),
      sleeperJson<SleeperState>("/state/nfl"),
      sleeperJson<SleeperRoster[]>(`/league/${encodeURIComponent(leagueId)}/rosters`),
    ]);

    if (!user.user_id) return signalFallbacks.fantasy;
    const roster = rosters.find((candidate) => candidate.owner_id === user.user_id);
    if (!roster?.roster_id) return signalFallbacks.fantasy;

    const week = typeof state.week === "number" ? state.week : 1;
    const matchups = await sleeperJson<SleeperMatchup[]>(
      `/league/${encodeURIComponent(leagueId)}/matchups/${week}`,
    );
    const ownMatchup = matchups.find((entry) => entry.roster_id === roster.roster_id);
    const opponent = ownMatchup?.matchup_id == null
      ? undefined
      : matchups.find(
          (entry) => entry.matchup_id === ownMatchup.matchup_id && entry.roster_id !== roster.roster_id,
        );
    const wins = roster.settings?.wins ?? 0;
    const losses = roster.settings?.losses ?? 0;
    const ties = roster.settings?.ties ?? 0;
    const record = ties ? `${wins}–${losses}–${ties}` : `${wins}–${losses}`;

    return {
      state: "live",
      statusLabel: `Live · week ${week}`,
      headline: `${record} this season`,
      description: "The showcase matchup is live; every other manager remains anonymous.",
      leftLabel: `EB ${score(ownMatchup?.points)}`,
      matchupLabel: `week ${week}`,
      rightLabel: `OPP ${score(opponent?.points)}`,
      leftScore: ownMatchup?.points,
      rightScore: opponent?.points,
      href: `https://sleeper.com/leagues/${leagueId}`,
    };
  } catch {
    return signalFallbacks.fantasy;
  }
}
