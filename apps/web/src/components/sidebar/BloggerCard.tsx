"use client";

import { User, FileText, Eye, Users, Code2, AtSign, Send } from "lucide-react";
import { useTranslations } from "next-intl";

interface BloggerCardProps {
  name?: string;
  avatar?: string;
  bio?: string;
  articleCount?: number;
  viewCount?: number;
  followerCount?: number;
}

export default function BloggerCard({
  name,
  avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  bio,
  articleCount = 128,
  viewCount = 56800,
  followerCount = 2580,
}: BloggerCardProps) {
  const t = useTranslations("sidebar");
  
  const displayName = name || t("blogger.defaultName");
  const displayBio = bio || t("blogger.defaultBio");

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header Background */}
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600" />

      {/* Avatar */}
      <div className="px-5 -mt-12">
        <div className="w-24 h-24 rounded-xl border-4 border-white overflow-hidden shadow-lg">
          <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="p-5 pt-3">
        <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
        <p className="text-sm text-gray-600 mt-2">{displayBio}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 py-4 border-t border-b">
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">{articleCount}</div>
            <div className="text-xs text-gray-500">{t("blogger.articles")}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <Eye className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {viewCount > 9999 ? `${(viewCount / 10000).toFixed(1)}w` : viewCount}
            </div>
            <div className="text-xs text-gray-500">{t("blogger.views")}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-purple-600 mb-1">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {followerCount > 9999 ? `${(followerCount / 10000).toFixed(1)}w` : followerCount}
            </div>
            <div className="text-xs text-gray-500">{t("blogger.followers")}</div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-4 mt-4">
          <a
            href="#"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Code2 className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <AtSign className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
