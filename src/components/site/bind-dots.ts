/**
 * A " · "-separated metadata line with each dot kept to the item before it (a
 * no-break space), so a wrapped line can end with a dot but never starts with one.
 */
export const bindDots = (line: string) => line.replaceAll(" · ", "\u00a0· ");
