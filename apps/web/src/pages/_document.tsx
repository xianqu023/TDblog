import { Html, Head, Main, NextScript } from "next/document";
import { getSiteSettings } from "@/lib/site-settings";

export default async function Document() {
  const siteSettings = await getSiteSettings();
  
  return (
    <Html lang="zh">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__INITIAL_SITE_SETTINGS__ = ${JSON.stringify(siteSettings)};`
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
