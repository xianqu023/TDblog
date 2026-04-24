"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface AuthorCardProps {
  name?: string;
  bio?: string;
  avatar?: string;
  articles?: number;
  views?: number;
  followers?: number;
}

interface BlogAuthor {
  id: string | null;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  articleCount: number;
  totalViews: number;
  siteName: string;
  siteDescription: string;
  siteLogo: string;
}

export default function AuthorCard({ 
  name, 
  bio, 
  avatar,
  articles: propArticles,
  views: propViews,
  followers = 0 
}: AuthorCardProps) {
  const [author, setAuthor] = useState<BlogAuthor | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBlogAuthor = async () => {
    try {
      const response = await fetch('/api/site-info');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.blogAuthor) {
          setAuthor({
            id: null,
            username: 'admin',
            displayName: result.data.blogAuthor.displayName,
            bio: result.data.blogAuthor.bio,
            avatarUrl: result.data.blogAuthor.avatarUrl,
            articleCount: 0,
            totalViews: 0,
            siteName: result.data.site.name,
            siteDescription: result.data.site.description,
            siteLogo: result.data.site.logoUrl,
          });
        } else {
          // 如果没有博主信息，使用默认值
          setAuthor({
            id: null,
            username: '博主',
            displayName: name || '博主',
            bio: bio || '热爱生活，热爱写作，分享技术与生活',
            avatarUrl: avatar || '',
            articleCount: 0,
            totalViews: 0,
            siteName: result.data.site.name || '博客',
            siteDescription: result.data.site.description || '',
            siteLogo: result.data.site.logoUrl || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load blog author:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogAuthor();

    // 监听头像更新事件
    const handleAvatarUpdate = () => {
      console.log('Avatar updated, refreshing author card...');
      loadBlogAuthor();
    };

    window.addEventListener('avatar-updated', handleAvatarUpdate);

    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, []);

  // 使用 API 数据或 props 作为降级方案
  const displayName = author?.displayName || name || "博主";
  const displayBio = author?.bio || bio || "热爱生活，热爱写作，分享技术与生活";
  const displayAvatar = author?.avatarUrl || avatar;
  const articleCount = author?.articleCount || propArticles || 0;
  const totalViews = author?.totalViews || propViews || 0;
  const siteName = author?.siteName || "博客";
  const siteLogo = author?.siteLogo;
  const siteDescription = author?.siteDescription || "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div
        className="theme-card overflow-hidden p-6"
        suppressHydrationWarning
      >
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
          <div className="relative -mt-12">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="theme-card overflow-hidden"
      suppressHydrationWarning
    >
      {/* 顶部背景 - 显示网站 Logo */}
      <div className="h-24 bg-gradient-to-r from-[#C41E3A] to-[#8B0000] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {siteLogo ? (
          <img
            src={siteLogo}
            alt={siteName}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl font-bold">
            {siteName && siteName.length > 0 ? siteName.charAt(0) : "博"}
          </div>
        )}
      </div>
      
      {/* 头像 */}
      <div className="px-6 pb-6">
        <div className="relative -mt-12 mb-4">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-[#C41E3A] to-[#8B0000] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {displayName && displayName.length > 0 ? displayName.charAt(0) : "博"}
            </div>
          )}
        </div>
        
        {/* 姓名和简介 */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{displayBio}</p>
        
        {/* 网站信息 */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Globe className="h-4 w-4 mr-2" />
            <span className="font-medium">{siteName}</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{author?.siteDescription}</p>
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-[#C41E3A]">
              {mounted ? articleCount : 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">文章</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#C41E3A]">
              {mounted ? `${(totalViews / 1000).toFixed(1)}k` : '0k'}
            </div>
            <div className="text-xs text-gray-500 mt-1">阅读</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#C41E3A]">
              {mounted ? followers : 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">关注</div>
          </div>
        </div>
      </div>
    </div>
  );
}
