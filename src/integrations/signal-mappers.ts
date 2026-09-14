export type ActivityDay = { date: string; count: number };

export type GitHubEventShape = {
  type: string;
  repo: { name: string };
  created_at: string;
};

export type ContributionDayShape = { date: string; contributionCount: number };

export type StravaActivityShape = {
  type?: unknown;
  sport_type?: unknown;
};

export type TrainingCategoryShape = {
  label: string;
  count: number;
};

export const TRAINING_CATEGORIES: TrainingCategoryShape[] = [
  { label: "Lift", count: 0 },
  { label: "Run", count: 0 },
  { label: "Muay Thai", count: 0 },
  { label: "Other", count: 0 },
];

export function datesForWindow(length: number, now = new Date()): ActivityDay[] {
  return Array.from({ length }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - (length - index - 1));
    return { date: date.toISOString().slice(0, 10), count: 0 };
  });
}

export function mapPublicActivity(events: GitHubEventShape[], length = 28, now = new Date()) {
  const activity = datesForWindow(length, now);
  const byDate = new Map(activity.map((day, index) => [day.date, index]));

  for (const event of events) {
    const index = byDate.get(event.created_at.slice(0, 10));
    if (index !== undefined) activity[index].count += 1;
  }

  return activity;
}

export function mapContributionDays(days: ContributionDayShape[], length = 28, now = new Date()) {
  const byDate = new Map(days.map((day) => [day.date, day.contributionCount]));

  return datesForWindow(length, now).map((day) => ({
    date: day.date,
    count: byDate.get(day.date) ?? 0,
  }));
}

export function startOfUtcWeek(now = new Date()) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return date;
}

export function classifyTrainingActivity(activity: StravaActivityShape) {
  const type = `${activity.sport_type ?? activity.type ?? ""}`.toLowerCase();

  if (["weighttraining", "workout", "crossfit", "strength", "elliptical"].some((value) => type.includes(value))) {
    return "Lift";
  }
  if (type.includes("run")) return "Run";
  if (["martial", "kickbox", "boxing", "muay"].some((value) => type.includes(value))) {
    return "Muay Thai";
  }
  return "Other";
}

export function groupTrainingActivities(activities: StravaActivityShape[]) {
  const counts = new Map(TRAINING_CATEGORIES.map((category) => [category.label, 0]));

  for (const activity of activities) {
    const label = classifyTrainingActivity(activity);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return TRAINING_CATEGORIES.map((category) => ({
    ...category,
    count: counts.get(category.label) ?? 0,
  }));
}
