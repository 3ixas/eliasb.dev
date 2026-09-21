export function trustedHttpsUrl(value: string | undefined, allowedHosts: readonly string[]) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !allowedHosts.includes(url.hostname)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
