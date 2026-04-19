import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale, defaultLocale } from "@/lib/i18n/config";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { getSiteSettings } from "@/lib/site-settings";
import SiteSettingsInjector from "@/components/SiteSettingsInjector";
import { AuthProvider } from "@/components/providers/AuthProvider";

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

  return {
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
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering with the correct locale
  setRequestLocale(locale);

  const messages = await getMessagesForLocale(locale as Locale);
  const siteSettings = await getSiteSettings();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <SiteSettingsInjector settings={siteSettings} />
        <Header currentLocale={locale as Locale} siteSettings={siteSettings} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
