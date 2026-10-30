/** Where an external link goes, as a person would say it: "GitHub", else the host without "www.". */
export const hostLabel = (href: string) => {
  const { hostname } = new URL(href);
  return hostname === "github.com" ? "GitHub" : hostname.replace(/^www\./, "");
};
