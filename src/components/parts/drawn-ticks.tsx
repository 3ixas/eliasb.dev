/** Counted units drawn as ticks (reused by How I work and Where I'm headed, #459). */
export function DrawnTicks({ count }: { count: number }) {
  return (
    <span className="drawn__ticks" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} />
      ))}
    </span>
  );
}
