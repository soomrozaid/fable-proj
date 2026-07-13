import type { MetadataRoute } from "next";
import { envClient } from "@/config/env.client";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/account", "/api/", "/r/"],
      },
    ],
    sitemap: `${envClient.APP_URL}/sitemap.xml`,
  };
}
