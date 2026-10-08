/**
 * My Sleeper league's ID, from the server's environment, or null when it isn't
 * set. The league page names the league and every team, so the ID stays out of
 * this public repository.
 */
export function sleeperLeagueId(env: Record<string, string | undefined> = process.env): string | null {
  const id = env.SLEEPER_LEAGUE_ID?.trim();
  return id ? id : null;
}
