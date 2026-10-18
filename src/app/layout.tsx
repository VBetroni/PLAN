import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Manrope } from "next/font/google";
import { t } from "@/lib/i18n/es-AR";
import "./globals.css";

// Fonts for both visual directions (see styles/themes.css). Once a direction is chosen,
// the fonts of the other one are removed.
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

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

// Follows the phone's light/dark setting before the first paint (no flash).
const colorSchemeScript = `document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme: dark)").matches)`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      data-theme="a"
      suppressHydrationWarning
      className={`${dmSans.variable} ${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorSchemeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
