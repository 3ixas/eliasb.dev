import { unstable_cache } from "next/cache";
import { getHistorySignal, historyWeekStart, savedHistorySignal } from "@/integrations/history";

const getWeeklySnapshot = unstable_cache(
  async (week: string) => {
    const history = await getHistorySignal(new Date(week));
    // Throwing preserves Next's last successful snapshot during revalidation.
    // Saved examples must never overwrite the current week's real stories.
    if (history.state !== "live") throw new Error("Weekly history refresh unavailable");
    return history;
  },
  ["weekly-history-snapshot-v1"],
  // Cache the selected stories and their image metadata together for the week.
  { revalidate: 604800, tags: ["history-signal"] },
);

export async function getCachedHistorySignal(now = new Date()) {
  try {
    // The key changes on Monday, so last week's stories cannot be labelled as
    // this week's. Every visitor uses the same server-side snapshot.
    return await getWeeklySnapshot(historyWeekStart(now).toISOString());
  } catch {
    // Cold start with no successful snapshot: retain an honest, usable fallback.
    return savedHistorySignal();
  }
}
