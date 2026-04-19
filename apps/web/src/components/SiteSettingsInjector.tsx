import Script from "next/script";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
}

export default function SiteSettingsInjector({
  settings,
}: {
  settings: SiteSettings;
}) {
  return (
    <Script
      id="site-settings"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `window.__SITE_SETTINGS__ = ${JSON.stringify(settings)};`,
      }}
    />
  );
}
