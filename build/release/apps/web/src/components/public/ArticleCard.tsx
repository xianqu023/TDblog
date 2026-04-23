import Link from "next/link";
import { Calendar, Eye, Tag } from "lucide-react";
import { getCoverImageUrl } from "@/lib/markdown";

interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  viewCount?: number;
  tags?: { name: string; color?: string }[];
  isPremium?: boolean;
  price?: number;
}

export default function ArticleCard({
  id,
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
  viewCount,
  tags = [],
  isPremium = false,
  price = 0,
}: ArticleCardProps) {
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
      <Link href={`/articles/${slug}`} className="block">
        {/* Cover Image */}
        {coverImage ? (
          <div className="relative h-52 overflow-hidden">
            <img
              src={getCoverImageUrl(coverImage, { width: 800, height: 450, fit: 'crop' })}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            {isPremium && (
              <div className="absolute top-4 right-4 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                付费 ¥{price}
              </div>
            )}
          </div>
        ) : (
          <div className="h-52 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
            <span className="text-6xl opacity-50">📝</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6">
        <Link href={`/articles/${slug}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {title}
          </h3>
        </Link>

        {excerpt && (
          <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{excerpt}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
              <span>{formatDate(publishedAt)}</span>
            </span>
          </div>
          <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
            <Eye className="h-4 w-4 mr-1.5 text-gray-400" />
            <span>{(viewCount ?? 0).toLocaleString()}</span>
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:opacity-80"
                style={{
                  backgroundColor: tag.color ? `${tag.color}15` : "#f3f4f6",
                  color: tag.color || "#6b7280",
                }}
              >
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
