import type { MetadataRoute } from "next";
import { roleStorySlugs } from "@/content/stretch/role-stories";

const siteUrl = "https://www.eliasb.dev";
// Role stories come from the catalogue, so a new one cannot be left out of discovery.
const routes = [
  "",
  "/things-i-make",
  "/things-i-make/threshold",
  "/things-i-make/argus-risk",
  "/things-i-make/flowtime",
  ...roleStorySlugs.map((slug) => `/work/${slug}`),
  "/resume",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route === "/things-i-make" ? 0.9 : 0.8,
  }));
}
