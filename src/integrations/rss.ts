function decodeEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity] ?? match;
  });
}

export function rssItems(xml: string) {
  return xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
}

export function rssValue(item: string, tag: string) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = item.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, "i"));
  if (!match) return undefined;

  return decodeEntities(
    match[1]
      .replace(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function firstImageUrl(item: string) {
  const descriptionMatch = item.match(/<description(?:\s[^>]*)?>([\s\S]*?)<\/description>/i);
  if (!descriptionMatch) return undefined;
  const imageMatch = descriptionMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch ? decodeEntities(imageMatch[1]) : undefined;
}
