import type { Metadata } from "next";
import "./globals.css";
import { CDNHead } from "@/components/shared/CDNHead";
import { getSiteSettings } from "@/lib/site-settings";
import ThemeInitializer from "@/components/ThemeInitializer";
import RegisterThemes from "@/themes/RegisterThemes";

// Use system fonts only - no external font loading to avoid network issues during build
const fontVariables = {
  sans: "--font-geist-sans",
  mono: "--font-geist-mono",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const metadata: Metadata = {
    title: settings.siteName,
    description: settings.siteDescription,
  };
  
  // 如果设置了 faviconUrl，添加到 metadata
  if (settings.faviconUrl) {
    metadata.icons = {
      icon: settings.faviconUrl,
      shortcut: settings.faviconUrl,
      apple: settings.faviconUrl,
    };
  }
  
  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  
  return (
    <html
      lang="zh"
      className="h-full antialiased"
    >
      <head>
        <CDNHead />
        {/* 动态添加 favicon 链接 */}
        {settings.faviconUrl && (
          <>
            <link rel="icon" href={settings.faviconUrl} />
            <link rel="shortcut icon" href={settings.faviconUrl} />
            <link rel="apple-touch-icon" href={settings.faviconUrl} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--theme-bg, #ffffff)", color: "var(--theme-text, #171717)" }}>
        <RegisterThemes />
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
