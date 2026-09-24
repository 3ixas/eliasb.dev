import { signalFallbacks } from "@/content/signal-fallbacks";
import { GITHUB_ACTIVITY_DAYS, mapContributionDays, mapPublicActivity } from "@/integrations/signal-mappers";
import type { ActivityDay, GitHubSignal } from "@/integrations/types";

const GITHUB_LOGIN = "3ixas";
const GITHUB_PROFILE = `https://github.com/${GITHUB_LOGIN}`;
const API_VERSION = "2026-03-10";
const ACTIVITY_DAYS = GITHUB_ACTIVITY_DAYS;
const CONTRIBUTION_WINDOW_DAYS = 365;

type GitHubEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
};

type ContributionSnapshot = {
  activity: ActivityDay[];
  totalContributions: number;
  privateContributions: number;
};

type ContributionResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        restrictedContributionsCount?: number;
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

function isGitHubEvent(value: unknown): value is GitHubEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<GitHubEvent>;

  return (
    typeof event.type === "string" &&
    typeof event.created_at === "string" &&
    !!event.repo &&
    typeof event.repo.name === "string"
  );
}

function repositoryName(fullName: string) {
  return fullName.replace(`${GITHUB_LOGIN}/`, "");
}

function describeEvent(event: GitHubEvent) {
  const repository = repositoryName(event.repo.name);

  switch (event.type) {
    case "CreateEvent":
      return `Created ${repository}`;
    case "PullRequestEvent":
      return `Opened work in ${repository}`;
    case "ReleaseEvent":
      return `Released ${repository}`;
    default:
      return `Pushed to ${repository}`;
  }
}

async function fetchContributionActivity(token: string): Promise<ContributionSnapshot | null> {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - (CONTRIBUTION_WINDOW_DAYS - 1));

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": API_VERSION,
    },
    body: JSON.stringify({
      query: `query PortfolioContributions($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks { contributionDays { date contributionCount } }
              totalContributions
            }
            restrictedContributionsCount
          }
        }
      }`,
      variables: { login: GITHUB_LOGIN, from: from.toISOString(), to: to.toISOString() },
    }),
    next: { revalidate: 21600, tags: ["github-signal"] },
    signal: AbortSignal.timeout(3500),
  });

  if (!response.ok) return null;

  const result = (await response.json()) as ContributionResponse;
  const collection = result.data?.user?.contributionsCollection;
  const calendar = collection?.contributionCalendar;
  const days = calendar?.weeks
    ?.flatMap((week) => week.contributionDays ?? [])
    .filter((day): day is { date: string; contributionCount: number } =>
      typeof day.date === "string" && typeof day.contributionCount === "number",
    );

  if (!calendar || !days?.length || typeof calendar.totalContributions !== "number") return null;

  return {
    activity: mapContributionDays(days, ACTIVITY_DAYS),
    totalContributions: calendar.totalContributions,
    privateContributions:
      typeof collection?.restrictedContributionsCount === "number"
        ? collection.restrictedContributionsCount
        : 0,
  };
}

async function fetchPublicEvents(): Promise<GitHubEvent[]> {
  const response = await fetch(
    `https://api.github.com/users/${GITHUB_LOGIN}/events/public?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": API_VERSION,
      },
      next: { revalidate: 21600, tags: ["github-signal"] },
      signal: AbortSignal.timeout(3500),
    },
  );

  if (!response.ok) throw new Error(`GitHub public activity returned ${response.status}`);
  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) throw new Error("GitHub public activity was not a list");
  return payload.filter(isGitHubEvent);
}

export async function getGitHubSignal(): Promise<GitHubSignal> {
  const token = process.env.GITHUB_SIGNAL_TOKEN;
  const [eventsResult, contributionResult] = await Promise.allSettled([
    fetchPublicEvents(),
    token ? fetchContributionActivity(token) : Promise.resolve(null),
  ]);
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const contributions = contributionResult.status === "fulfilled" ? contributionResult.value : null;
  const latest = events[0];

  if (contributions) {
    return {
      state: "live",
      statusLabel: "Live · all contributions",
      headline: `${contributions.totalContributions} contributions in the last year`,
      description: latest
        ? `${describeEvent(latest)} · the total includes private contributions, without naming those repositories.`
        : "The total includes public and private contributions, without naming private repositories.",
      activity: contributions.activity,
      activityLabel: "GitHub contributions over the last year, including private totals",
      totalContributions: contributions.totalContributions,
      privateContributions: contributions.privateContributions,
      updatedAt: new Date().toISOString(),
      href: GITHUB_PROFILE,
    };
  }

  if (latest) {
    const activity = mapPublicActivity(events);
    return {
      state: "live",
      statusLabel: token ? "Live · public only" : "Live · public",
      headline: describeEvent(latest),
      description: "A recent event from my public GitHub profile. Private contribution totals aren’t shown here.",
      activity,
      activityLabel: "Public GitHub activity over the last year",
      updatedAt: new Date().toISOString(),
      href: GITHUB_PROFILE,
    };
  }

  if (eventsResult.status === "fulfilled") {
    return {
      ...signalFallbacks.github,
      state: "live",
      statusLabel: token ? "Live · public only" : "Live · public",
      headline: "No recent public GitHub activity",
      description: token
        ? "There are no recent public events, and I couldn’t load the private contribution total this time."
        : "This chart only shows public activity.",
      activity: mapPublicActivity(events),
      activityLabel: "Public GitHub activity over the last year",
      updatedAt: new Date().toISOString(),
    };
  }

  return signalFallbacks.github;
}
