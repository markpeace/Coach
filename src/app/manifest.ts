import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "Coach", short_name: "Coach", description: "Your persistent personal trainer", start_url: "/today", display: "standalone", background_color: "#f6f4ed", theme_color: "#174f3d", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }; }
