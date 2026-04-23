import { getSiteSettings } from "@/lib/site-settings";

export default async function SiteSettingsScript() {
  const siteSettings = await getSiteSettings();
  
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__INITIAL_SITE_SETTINGS__ = ${JSON.stringify(siteSettings)};`
      }}
    />
  );
}
