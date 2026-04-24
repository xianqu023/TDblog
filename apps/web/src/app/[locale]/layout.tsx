import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale, defaultLocale } from "@/lib/i18n/config";
import PublicLayout from "@/components/PublicLayout";
import { getSiteSettings } from "@/lib/site-settings";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "@/styles/safari-optimizations.css";

async function getMessagesForLocale(locale: Locale) {
  return (await import(`@/lib/i18n/locales/${locale}.json`)).default;
}

type GenerateMetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const siteSettings = await getSiteSettings();
  const siteName = siteSettings.siteName;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const metadata: Metadata = {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteSettings.siteDescription,
    openGraph: {
      type: "website",
      locale: locale,
      url: `${siteUrl}/${locale}`,
      title: siteName,
      description: siteSettings.siteDescription,
      siteName: siteName,
      images: siteSettings.logoUrl
        ? [{ url: siteSettings.logoUrl, width: 512, height: 512, alt: siteName }]
        : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        "zh-CN": `${siteUrl}/zh`,
        "en-US": `${siteUrl}/en`,
        "ja-JP": `${siteUrl}/ja`,
      },
    },
  };

  // 设置 favicon - 优先使用数据库配置，否则使用默认 favicon.ico
  if (siteSettings.faviconUrl) {
    metadata.icons = {
      icon: siteSettings.faviconUrl,
      shortcut: siteSettings.faviconUrl,
      apple: siteSettings.faviconUrl,
    };
  } else {
    // 使用默认的 favicon.ico
    metadata.icons = {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    };
  }

  return metadata;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessagesForLocale(locale as Locale);
  const siteSettings = await getSiteSettings();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <ThemeProvider>
          <PublicLayout locale={locale as Locale} siteSettings={siteSettings}>
            {children}
          </PublicLayout>
        </ThemeProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
