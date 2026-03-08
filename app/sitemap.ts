import { MetadataRoute } from "next";
import { existsSync } from "fs";
import { join } from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hoshiyomi.xyz";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/fortune`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/compatibility`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/tokusho`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const birthdayPages: MetadataRoute.Sitemap = [];
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysInMonth[m]; d++) {
      const mmdd = `${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
      if (existsSync(join(process.cwd(), "data/birthday", `${mmdd}.json`))) {
        birthdayPages.push({
          url: `${base}/birthday/${mmdd}`,
          lastModified: new Date("2026-03-08"),
          changeFrequency: "yearly",
          priority: 0.7,
        });
      }
    }
  }

  return [...staticPages, ...birthdayPages];
}
