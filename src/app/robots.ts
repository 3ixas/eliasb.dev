import type { MetadataRoute } from "next";

const siteUrl = "https://www.eliasb.dev";

export default function robots(): MetadataRoute.Robots {
  const isIndexable = process.env.SITE_INDEXABLE === "true";

  return {
    rules: isIndexable
      ? { userAgent: "*", allow: "/", disallow: "/concepts/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
