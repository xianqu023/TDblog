import { Metadata } from "next";

type SEOConfig = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
};

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Blog";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const defaultImage = `${siteUrl}/og-image.jpg`;

export function generateSEOMetadata({
  title,
  description = "A personal blog with multi-language support",
  keywords = [],
  image = defaultImage,
  url = siteUrl,
  type = "website",
  publishedTime,
  modifiedTime,
  authors = [],
  tags = [],
  noIndex = false,
}: SEOConfig): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, "blog", "articles"].join(", "),
    openGraph: {
      type: type === 'product' ? 'website' : type as 'article' | 'website',
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || siteName,
        },
      ],
      publishedTime,
      modifiedTime,
      authors: authors as any,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
