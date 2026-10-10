/** Half stars as the film card shows them: 4.5 is ★★★★½. */
function stars(rating: number) {
  return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
}

/**
 * The film card's line, shown and spoken: "Watched 14 Sept · ★★★★", heard as
 * "Watched 14 September, rated 4 out of 5". Either half can be missing.
 */
export function filmLine(watched: { short: string; long: string } | null, rating: number | null) {
  const shown = [watched && `Watched ${watched.short}`, rating && stars(rating)].filter(Boolean);
  if (!shown.length) return null;
  const rated = rating && `rated ${rating} out of 5`;
  const spoken = watched ? [`Watched ${watched.long}`, rated].filter(Boolean).join(", ") : `Rated ${rating} out of 5`;
  return { shown: shown.join(" · "), spoken };
}
