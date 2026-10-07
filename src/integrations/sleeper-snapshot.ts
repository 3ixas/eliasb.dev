import type { FantasyScores, FantasySnapshot } from "@/integrations/fantasy";

const SLEEPER_API = "https://api.sleeper.app/v1";

type SleeperUser = { user_id?: string; display_name?: string; metadata?: { team_name?: string } | null };
type SleeperState = { season?: string; season_type?: string };
type SleeperLeague = { season?: string; settings?: { playoff_week_start?: number } };
type SleeperRoster = {
  roster_id?: number;
  owner_id?: string;
  settings?: { wins?: number; losses?: number; ties?: number };
};
type SleeperMatchup = { roster_id?: number; matchup_id?: number | null; points?: number };

async function sleeperJson<T>(path: string): Promise<T> {
  const response = await fetch(`${SLEEPER_API}${path}`, { signal: AbortSignal.timeout(3500) });
  if (!response.ok) throw new Error(`Sleeper returned ${response.status}`);
  return response.json() as Promise<T>;
}

/** My scores and my opponent's, or null without a matchup (a bye, or knocked out). */
function matchupFor(matchups: SleeperMatchup[], rosterId: number): FantasyScores | null {
  const mine = matchups.find((entry) => entry.roster_id === rosterId);
  if (mine?.matchup_id == null) return null;
  const theirs = matchups.find((entry) => entry.matchup_id === mine.matchup_id && entry.roster_id !== rosterId);
  const score = (points: number | undefined) => (typeof points === "number" && Number.isFinite(points) && points >= 0 ? points : null);
  const team = score(mine.points);
  const opponent = score(theirs?.points);
  return team === null || opponent === null ? null : { team, opponent };
}

/**
 * This week's and last week's matchups from Sleeper, with my team name and
 * record. Only my team is named: the league's other users are read to find
 * mine, and their names go no further. Throws when Sleeper can't be read.
 */
export async function readSleeperSnapshot(
  { username, leagueId }: { username: string; leagueId: string },
  season: number,
  week: number,
): Promise<FantasySnapshot> {
  const league = `/league/${encodeURIComponent(leagueId)}`;
  const [user, state, details, users, rosters, thisWeek, lastWeek] = await Promise.all([
    sleeperJson<SleeperUser>(`/user/${encodeURIComponent(username)}`),
    sleeperJson<SleeperState>("/state/nfl"),
    sleeperJson<SleeperLeague>(league),
    sleeperJson<SleeperUser[]>(`${league}/users`),
    sleeperJson<SleeperRoster[]>(`${league}/rosters`),
    sleeperJson<SleeperMatchup[]>(`${league}/matchups/${week}`),
    week > 1 ? sleeperJson<SleeperMatchup[]>(`${league}/matchups/${week - 1}`) : Promise.resolve([]),
  ]);

  const roster = rosters.find((candidate) => candidate.owner_id === user.user_id);
  if (!user.user_id || !roster?.roster_id) throw new Error("Sleeper has no roster for me in the league");
  const member = users.find((candidate) => candidate.user_id === user.user_id);
  const teamName = member?.metadata?.team_name?.trim() || member?.display_name || user.display_name;
  if (!teamName) throw new Error("Sleeper has no team name for me");

  // A league from another season, or Sleeper between seasons, has no matchups to show.
  const inSeason = state.season === String(season) && details.season === String(season)
    && (state.season_type === "regular" || state.season_type === "post");
  const playoffStart = details.settings?.playoff_week_start;

  return {
    fetchedAt: new Date().toISOString(),
    season,
    week,
    teamName,
    record: {
      wins: roster.settings?.wins ?? 0,
      losses: roster.settings?.losses ?? 0,
      ties: roster.settings?.ties ?? 0,
    },
    regularSeasonWeeks: typeof playoffStart === "number" && playoffStart > 1 ? playoffStart - 1 : 18,
    thisWeek: inSeason ? matchupFor(thisWeek, roster.roster_id) : null,
    lastWeek: inSeason ? matchupFor(lastWeek, roster.roster_id) : null,
  };
}
