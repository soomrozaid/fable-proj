import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scanstone",
    short_name: "Scanstone",
    description:
      "QR codes that keep working — free static codes and editable dynamic codes with scan analytics.",
    start_url: "/",
    display: "browser",
    background_color: "#f7f3ea",
    theme_color: "#1c1917",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
