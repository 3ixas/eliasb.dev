import { fantasySourceUnavailable, fantasyWeekUnavailable, signalFallbacks } from "@/content/signal-fallbacks";
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

export async function getFantasySignal(): Promise<FantasySignal> {
  const { username, leagueId } = integrationConfig.sleeper;
  const leagueUrl = `https://sleeper.com/leagues/${leagueId}`;
  let currentWeek: number | undefined;

  try {
    const [user, state, rosters] = await Promise.all([
      sleeperJson<SleeperUser>(`/user/${encodeURIComponent(username)}`),
      sleeperJson<SleeperState>("/state/nfl"),
      sleeperJson<SleeperRoster[]>(`/league/${encodeURIComponent(leagueId)}/rosters`),
    ]);

    if (!user.user_id) return signalFallbacks.fantasy;
    const roster = rosters.find((candidate) => candidate.owner_id === user.user_id);
    if (!roster?.roster_id) return signalFallbacks.fantasy;

    const week = state.week;
    if (typeof week !== "number" || !Number.isSafeInteger(week) || week < 1) {
      return fantasyWeekUnavailable(leagueUrl);
    }
    currentWeek = week;
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
      statusLabel: "Live",
      headline: `${record} this season`,
      description: "I share my score here; the other managers’ names stay private.",
      matchupLabel: `Week ${week}`,
      teamScore: ownMatchup?.points,
      opponentScore: opponent?.points,
      updatedAt: new Date().toISOString(),
      href: leagueUrl,
    };
  } catch {
    return fantasySourceUnavailable(leagueUrl, currentWeek);
  }
}
