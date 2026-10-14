import type { MetadataRoute } from "next";

const siteUrl = "https://www.eliasb.dev";
const routes = [
  "",
  "/things-i-make",
  "/things-i-make/threshold",
  "/things-i-make/argus-risk",
  "/things-i-make/flowtime",
  "/work/bnp-paribas",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/things-i-make" ? 0.9 : 0.8,
  }));
}
