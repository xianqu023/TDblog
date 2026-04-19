"use client";

import Link from "next/link";
import { TrendingUp, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface Article {
  id: string;
  slug: string;
  title: string;
  coverImage?: string;
  viewCount: number;
}

interface PopularArticlesProps {
  articles?: Article[];
  limit?: number;
}

export default function PopularArticles({
  articles = [],
  limit = 5,
}: PopularArticlesProps) {
  const t = useTranslations("sidebar");
  
  const displayArticles = articles.slice(0, limit);

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
        {t("popularArticles")}
      </h3>

      {displayArticles.length > 0 ? (
        <div className="space-y-4">
          {displayArticles.map((article, index) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group flex items-start space-x-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
            >
              {/* Rank Number */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-400 to-gray-500"
                    : index === 2
                    ? "bg-gradient-to-br from-orange-400 to-orange-600"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{article.viewCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Thumbnail */}
              {article.coverImage && (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">{t("noArticles")}</p>
      )}
    </div>
  );
}
