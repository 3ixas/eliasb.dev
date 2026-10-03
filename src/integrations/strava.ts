import { unstable_cache } from "next/cache";
import { groupTrainingActivities, londonWeekStart } from "@/integrations/signal-mappers";
import type { TrainingSignal } from "@/integrations/types";

const STRAVA_API = "https://www.strava.com/api/v3";

type StravaActivity = {
  type?: unknown;
  sport_type?: unknown;
};

type StravaTokenResponse = {
  access_token?: unknown;
};

type StravaCredentials = { clientId: string; clientSecret: string; refreshToken: string } | { accessToken: string };

function stravaCredentials(): StravaCredentials | null {
  const accessToken = process.env.STRAVA_ACCESS_TOKEN?.trim();
  if (accessToken) return { accessToken };

  const clientId = process.env.STRAVA_CLIENT_ID?.trim();
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim();
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN?.trim();
  return clientId && clientSecret && refreshToken ? { clientId, clientSecret, refreshToken } : null;
}

function isStravaActivity(value: unknown): value is StravaActivity {
  if (!value || typeof value !== "object") return false;
  const activity = value as StravaActivity;
  return typeof activity.type === "string" || typeof activity.sport_type === "string";
}

async function accessToken(credentials: StravaCredentials) {
  if ("accessToken" in credentials) return credentials.accessToken;

  const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`Strava token refresh returned ${response.status}`);
  const payload = (await response.json()) as StravaTokenResponse;
  if (typeof payload.access_token !== "string") throw new Error("Strava token refresh returned no access token");
  return payload.access_token;
}

// Keyed by the week, so last week's sessions are never shown as this week's.
// Throwing keeps Next's last good fetch for the week during a refresh.
const fetchWeek = unstable_cache(
  async (weekStart: string): Promise<TrainingSignal> => {
    const credentials = stravaCredentials();
    if (!credentials) throw new Error("Strava credentials are not set");
    const token = await accessToken(credentials);
    const after = Math.floor(new Date(weekStart).getTime() / 1000);
    const response = await fetch(`${STRAVA_API}/athlete/activities?after=${after}&per_page=200`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Strava activities returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Strava returned something other than a list of activities");

    // Only the sport type of each session is kept: no names, routes, times, or places.
    return { state: "live", rows: groupTrainingActivities(payload.filter(isStravaActivity)), updatedAt: new Date().toISOString() };
  },
  ["strava-training-week-v1"],
  { revalidate: 1800, tags: ["strava-training"] },
);

/** This week's sessions from Strava, or no card at all when there are none to trust. */
export async function getTrainingSignal(now = new Date()): Promise<TrainingSignal> {
  // Without credentials (as before they're set up) the photo stands alone, quietly.
  if (!stravaCredentials()) return { state: "unavailable", rows: null, updatedAt: null };
  try {
    return await fetchWeek(londonWeekStart(now).toISOString());
  } catch (error) {
    // This week hasn't been fetched successfully yet: the photo stands alone.
    console.warn("[strava] training unavailable", error instanceof Error ? error.message : error);
    return { state: "unavailable", rows: null, updatedAt: null };
  }
}
