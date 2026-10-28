/** Half stars as the film card shows them: 4.5 is ★★★★½. */
function stars(rating: number) {
  return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
}

/**
 * The film's line, shown and spoken: "Watched 14 Sept · ★★★★", heard as
 * "Watched 14 September, rated 4 out of 5". Either half can be missing. The
 * separator is non-breaking so the rating never wraps alone after the dot.
 * The row leads with "Last watched" where the ticket says "Watched".
 */
export function filmLine(watched: { short: string; long: string } | null, rating: number | null, lead = "Watched") {
  const shown = [watched && `${lead} ${watched.short}`, rating && stars(rating)].filter(Boolean);
  if (!shown.length) return null;
  const rated = rating && `rated ${rating} out of 5`;
  const spoken = watched ? [`${lead} ${watched.long}`, rated].filter(Boolean).join(", ") : `Rated ${rating} out of 5`;
  return { shown: shown.join("\u00a0·\u00a0"), spoken };
}
