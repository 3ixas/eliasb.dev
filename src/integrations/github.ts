import { unstable_cache } from "next/cache";
import { integrationConfig } from "@/content/integration-config";
import { GITHUB_ACTIVITY_DAYS, latestRepository, mapContributionDays } from "@/integrations/signal-mappers";
import type { GitHubSignal, LatestRepositorySignal } from "@/integrations/types";

const { username, profileUrl } = integrationConfig.github;
const API_VERSION = "2026-03-10";

type ContributionResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: Array<{
            contributionDays?: Array<{ date?: string; contributionCount?: number }>;
          }>;
        };
      };
    };
  };
};

function headers(token?: string) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// The full year needs the token: GitHub's contribution calendar is GraphQL only.
// Throwing keeps Next's last good year during a refresh.
const fetchYear = unstable_cache(
  async (): Promise<GitHubSignal> => {
    const token = process.env.GITHUB_SIGNAL_TOKEN;
    if (!token) throw new Error("GITHUB_SIGNAL_TOKEN is not set");
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(to.getUTCDate() - (GITHUB_ACTIVITY_DAYS - 1));

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query PortfolioContributions($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                weeks { contributionDays { date contributionCount } }
                totalContributions
              }
            }
          }
        }`,
        variables: { login: username, from: from.toISOString(), to: to.toISOString() },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`GitHub contributions returned ${response.status}`);

    const calendar = ((await response.json()) as ContributionResponse).data?.user?.contributionsCollection?.contributionCalendar;
    const days = calendar?.weeks
      ?.flatMap((week) => week.contributionDays ?? [])
      .filter((day): day is { date: string; contributionCount: number } =>
        typeof day.date === "string" && typeof day.contributionCount === "number",
      );
    if (!calendar || !days?.length || typeof calendar.totalContributions !== "number") {
      throw new Error("GitHub returned no contribution calendar");
    }

    return {
      state: "live",
      activity: mapContributionDays(days, GITHUB_ACTIVITY_DAYS, to),
      total: calendar.totalContributions,
      updatedAt: to.toISOString(),
      href: profileUrl,
    };
  },
  ["github-year-v1"],
  { revalidate: 21600, tags: ["github-signal"] },
);

/** The past year of contributions, or no pin when there isn't a full year to show. */
export async function getGitHubSignal(): Promise<GitHubSignal> {
  try {
    return await fetchYear();
  } catch (error) {
    // Nothing fetched successfully yet: no pin, rather than a partial year.
    console.warn("[github] contribution year unavailable", error instanceof Error ? error.message : error);
    return { state: "unavailable", activity: [], total: 0, updatedAt: null, href: profileUrl };
  }
}

const fetchLatestRepository = unstable_cache(
  async (): Promise<LatestRepositorySignal> => {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`, {
      headers: headers(process.env.GITHUB_SIGNAL_TOKEN),
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`GitHub repositories returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("GitHub repositories was not a list");
    return { state: "live", repository: latestRepository(payload, username), updatedAt: new Date().toISOString() };
  },
  ["github-latest-repository-v1"],
  { revalidate: 21600, tags: ["github-signal"] },
);

/** My most recently pushed public repository, for the Making pin's fallback. */
export async function getLatestRepositorySignal(): Promise<LatestRepositorySignal> {
  try {
    return await fetchLatestRepository();
  } catch (error) {
    console.warn("[github] latest repository unavailable", error instanceof Error ? error.message : error);
    return { state: "unavailable", repository: null, updatedAt: null };
  }
}
