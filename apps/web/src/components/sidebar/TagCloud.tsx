"use client";

import { Tag } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  count: number;
  color: string;
}

interface TagCloudProps {
  tags?: TagItem[];
}

export default function TagCloud({ tags = [] }: TagCloudProps) {
  const t = useTranslations("sidebar");
  
  // 每行展示4个标签
  const tagsPerRow = 4;

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Tag className="h-5 w-5 mr-2 text-blue-600" />
        {t("tagCloud.title")}
        <span className="ml-2 text-sm font-normal text-gray-500">({tags.length})</span>
      </h3>

      {/* 使用 CSS Grid 布局，每行4列 */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${tagsPerRow}, 1fr)`,
        }}
      >
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="group relative px-2 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 text-center overflow-hidden"
            style={{
              backgroundColor: `${tag.color}15`,
              color: tag.color,
              border: `1px solid ${tag.color}30`,
            }}
            title={`${tag.name} (${tag.count} ${t("tagCloud.articleCount")})`}
          >
            <span className="relative z-10 truncate block">{tag.name}</span>

            {/* Hover effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: `${tag.color}25` }}
            />
          </Link>
        ))}
      </div>

      {/* 空状态 */}
      {tags.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          {t("tagCloud.noTags")}
        </div>
      )}
    </div>
  );
}
