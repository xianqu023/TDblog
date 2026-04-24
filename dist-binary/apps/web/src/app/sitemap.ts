import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const locales = ["zh", "en", "ja"];

  // Static routes
  const staticRoutes = [
    "",
    "/articles",
    "/shop",
    "/orders",
  ];

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  return sitemapEntries;
}
