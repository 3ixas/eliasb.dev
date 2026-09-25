import type { MetadataRoute } from "next";

const siteUrl = "https://www.eliasb.dev";
const routes = [
  "",
  "/work",
  "/work/threshold",
  "/work/argus-risk",
  "/work/flowtime",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/work" ? 0.9 : 0.8,
  }));
}
