import { signalFallbacks } from "@/content/signal-fallbacks";
import type { ActivityDay, GitHubSignal } from "@/integrations/types";

const GITHUB_LOGIN = "3ixas";
const GITHUB_PROFILE = `https://github.com/${GITHUB_LOGIN}`;
const API_VERSION = "2026-03-10";
const ACTIVITY_DAYS = 28;

type GitHubEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
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

function datesForWindow(length = ACTIVITY_DAYS): ActivityDay[] {
  const today = new Date();

  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (length - index - 1));
    return { date: date.toISOString().slice(0, 10), count: 0 };
  });
}

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

function mapPublicActivity(events: GitHubEvent[]) {
  const activity = datesForWindow();
  const byDate = new Map(activity.map((day, index) => [day.date, index]));

  for (const event of events) {
    const index = byDate.get(event.created_at.slice(0, 10));
    if (index !== undefined) activity[index].count += 1;
  }

  return activity;
}

async function fetchContributionActivity(token: string): Promise<ActivityDay[] | null> {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - (ACTIVITY_DAYS - 1));

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
            }
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
  const days = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks
    ?.flatMap((week) => week.contributionDays ?? [])
    .filter((day): day is { date: string; contributionCount: number } =>
      typeof day.date === "string" && typeof day.contributionCount === "number"
    );

  if (!days?.length) return null;

  const requestedDates = new Set(datesForWindow().map((day) => day.date));
  return days
    .filter((day) => requestedDates.has(day.date))
    .map((day) => ({ date: day.date, count: day.contributionCount }));
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
  try {
    const events = await fetchPublicEvents();
    const latest = events[0];
    const token = process.env.GITHUB_SIGNAL_TOKEN;
    const contributions = token ? await fetchContributionActivity(token).catch(() => null) : null;
    const activity = contributions ?? mapPublicActivity(events);

    if (!latest) {
      return {
        ...signalFallbacks.github,
        state: "live",
        statusLabel: "Live · public",
        headline: "Quiet in public, building in private",
        description: "No public GitHub events appeared in the recent activity window.",
        activity,
        activityLabel: contributions
          ? "GitHub contributions over the last 28 days"
          : "Public GitHub activity over the last 28 days",
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      state: "live",
      statusLabel: contributions ? "Live · all contributions" : "Live · public",
      headline: describeEvent(latest),
      description: contributions
        ? "Recent building activity, including private contribution counts without repository details."
        : "Recent public building activity from GitHub. Private repository details stay private.",
      activity,
      activityLabel: contributions
        ? "GitHub contributions over the last 28 days"
        : "Public GitHub activity over the last 28 days",
      updatedAt: new Date().toISOString(),
      href: GITHUB_PROFILE,
    };
  } catch {
    return signalFallbacks.github;
  }
}
