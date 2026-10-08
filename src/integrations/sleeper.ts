import { unstable_cache } from "next/cache";
import { integrationConfig } from "@/content/integration-config";
import { fantasyMoment, fantasyTicket } from "@/integrations/fantasy";
import { sleeperLeagueId } from "@/integrations/sleeper-config";
import { readSleeperSnapshot } from "@/integrations/sleeper-snapshot";
import type { FantasySignal } from "@/integrations/types";

// Throwing keeps Next's last good snapshot for the week during a refresh, so
// a Sleeper outage doesn't take the pin down while what it shows is still true.
const fetchSnapshot = unstable_cache(
  (leagueId: string, season: number, week: number) =>
    readSleeperSnapshot({ username: integrationConfig.sleeper.username, leagueId }, season, week),
  ["sleeper-fantasy-v1"],
  // Every 15 minutes, so a live score is never far behind.
  { revalidate: 900, tags: ["sleeper-signal"] },
);

/** The fantasy ticket for now, or no pin in the off-season, without a league ID, or without a trustworthy score. */
export async function getFantasySignal(now = new Date()): Promise<FantasySignal> {
  const moment = fantasyMoment(now);
  if (!moment) return { state: "unavailable", ticket: null, updatedAt: null };

  const leagueId = sleeperLeagueId();
  if (!leagueId) {
    console.warn("[sleeper] fantasy unavailable: SLEEPER_LEAGUE_ID is not set");
    return { state: "unavailable", ticket: null, updatedAt: null };
  }

  try {
    const snapshot = await fetchSnapshot(leagueId, moment.season, moment.week);
    const ticket = fantasyTicket(snapshot, now);
    return { state: ticket ? "live" : "unavailable", ticket, updatedAt: snapshot.fetchedAt };
  } catch (error) {
    // Nothing fetched successfully this week: no pin, rather than an old score.
    console.warn("[sleeper] fantasy unavailable", error instanceof Error ? error.message : error);
    return { state: "unavailable", ticket: null, updatedAt: null };
  }
}
