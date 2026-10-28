/** A desk-calendar tile: a band with two binding holes and a number on paper. The band is cobalt for today. */
export function CalendarTile({ number, today = false }: { number: string; today?: boolean }) {
  return (
    <span className="qi-tile" data-today={today ? "" : undefined}>
      <span className="qi-tile__band" />
      <span className="qi-tile__number">{number}</span>
    </span>
  );
}
