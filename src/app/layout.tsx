import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { t } from "@/lib/i18n/es-AR";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: t.app.name,
  description: t.app.tagline,
  icons: { icon: "/icons/192", apple: "/icons/180" },
  // iPhone: open as a standalone app when added to the Home Screen.
  appleWebApp: { capable: true, title: t.app.name, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
