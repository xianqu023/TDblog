"use client";

import { useTranslations } from "next-intl";

interface AdCardProps {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  description?: string;
}

export default function AdCard({
  title,
  imageUrl = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
  linkUrl = "#",
  description,
}: AdCardProps) {
  const t = useTranslations("sidebar");
  
  const displayTitle = title || t("ad.defaultTitle");
  const displayDescription = description || t("ad.defaultDescription");

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="relative">
        <img
          src={imageUrl}
          alt={displayTitle}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
          {t("ad.label")}
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-900 mb-1">{displayTitle}</h4>
        <p className="text-sm text-gray-600 mb-3">{displayDescription}</p>

        <a
          href={linkUrl}
          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {t("ad.learnMore")}
        </a>
      </div>
    </div>
  );
}
