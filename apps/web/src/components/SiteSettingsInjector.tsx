"use client";

interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
  siteKeywords?: string;
}

interface SiteSettingsInjectorProps {
  settings?: SiteSettings;
}

export default function SiteSettingsInjector({ settings }: SiteSettingsInjectorProps) {
  // 临时占位组件
  return null;
}
