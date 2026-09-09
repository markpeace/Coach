import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Coach", description: "Your persistent personal trainer", applicationName: "Coach", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "Coach" } };
export const viewport: Viewport = { themeColor: "#174f3d", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
