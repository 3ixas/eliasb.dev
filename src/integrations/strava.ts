import { integrationConfig } from "@/content/integration-config";
import { signalFallbacks } from "@/content/signal-fallbacks";
import {
  groupTrainingActivities,
  startOfUtcWeek,
  TRAINING_CATEGORIES,
} from "@/integrations/signal-mappers";
import type { TrainingCategory, TrainingSignal } from "@/integrations/types";

const STRAVA_API = "https://www.strava.com/api/v3";
const TRAINING_CACHE_SECONDS = 1800;

type StravaActivity = {
  type?: unknown;
  sport_type?: unknown;
};

type StravaTokenResponse = {
  access_token?: unknown;
};

function trainingWindowLabel(now = new Date()) {
  const start = startOfUtcWeek(now);
  return `Week of ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(start)}`;
}

function fallbackTraining(): TrainingSignal {
  return {
    ...signalFallbacks.training,
    weekly: TRAINING_CATEGORIES,
    totalActivities: 0,
    windowLabel: "Typical week",
    updatedAt: null,
    href: undefined,
  };
}

function isStravaActivity(value: unknown): value is StravaActivity {
  if (!value || typeof value !== "object") return false;
  const activity = value as StravaActivity;
  return typeof activity.type === "string" || typeof activity.sport_type === "string";
}

async function getAccessToken() {
  const directToken = process.env.STRAVA_ACCESS_TOKEN?.trim();
  if (directToken) return directToken;

  const clientId = process.env.STRAVA_CLIENT_ID?.trim();
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim();
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as StravaTokenResponse;
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

async function fetchActivities(token: string) {
  const after = Math.floor(startOfUtcWeek().getTime() / 1000);
  const response = await fetch(`${STRAVA_API}/athlete/activities?after=${after}&per_page=200`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: TRAINING_CACHE_SECONDS, tags: ["strava-training"] },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return null;
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) return null;
  return payload.filter(isStravaActivity);
}

export async function getTrainingSignal(): Promise<TrainingSignal> {
  const token = await getAccessToken().catch(() => null);
  if (!token) return fallbackTraining();

  const activities = await fetchActivities(token).catch(() => null);
  if (!activities) return fallbackTraining();

  const weekly = groupTrainingActivities(activities) as TrainingCategory[];
  const totalActivities = activities.length;
  return {
    state: "live",
    statusLabel: "Live · this week",
    headline: totalActivities
      ? `${totalActivities} session${totalActivities === 1 ? "" : "s"} this week`
      : "No sessions logged this week",
    description: totalActivities
      ? "Strava activity grouped by type; routes and exact locations stay private."
      : "No Strava activities have been logged in the current window.",
    href: integrationConfig.strava.profileUrl,
    weekly,
    totalActivities,
    windowLabel: trainingWindowLabel(),
    updatedAt: new Date().toISOString(),
  };
}
