"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdByPosition, DEFAULT_AD_CONFIG } from "@/components/ads/AdComponents";

// 热门标签云
export const HotTagCloud = ({ tags }: { tags: Array<{ name: string; count: number }> }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded mr-3"></span>
      热门标签
    </h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <Link
          key={idx}
          href={`/tags/${tag.name}`}
          className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-sm hover:from-blue-100 hover:to-purple-100 transition-all duration-300 border border-blue-100"
        >
          {tag.name}
          <span className="ml-1 text-xs text-blue-400">({tag.count})</span>
        </Link>
      ))}
    </div>
  </div>
);

// 作者信息卡片
export const AuthorCard = ({
  name = "博客作者",
  bio = "热爱生活，热爱写作",
}: {
  name?: string;
  bio?: string;
}) => (
  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="w-1 h-5 bg-gradient-to-b from-green-500 to-teal-500 rounded mr-3"></span>
      关于作者
    </h3>
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-400 shadow-lg">
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          {name.charAt(0)}
        </div>
      </div>
      <h4 className="font-semibold text-gray-800">{name}</h4>
      <p className="text-sm text-gray-600 mt-2">{bio}</p>
    </div>
  </div>
);

// 热门文章
export const HotArticles = ({ articles }: { articles: Array<{ id: string; slug: string; title: string; views: number; coverImage?: string }> }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded mr-3"></span>
      🔥 热门文章
    </h3>
    <div className="space-y-3">
      {articles.map((article, idx) => (
        <Link key={article.id} href={`/articles/${article.slug}`} className="block group">
          <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl font-black text-gray-200 group-hover:text-blue-400 transition-colors">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 truncate transition-colors">{article.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                <span>👁️ {article.views} 阅读</span>
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// 统计卡片
export const SiteStatistics = ({ stats }: { stats: { articles: number; views: number; comments: number; users: number } }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-orange-500 rounded mr-3"></span>
      📊 站点统计
    </h3>
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
        <p className="text-2xl font-bold text-blue-600">{stats.articles}</p>
        <p className="text-xs text-blue-600">文章数</p>
      </div>
      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
        <p className="text-2xl font-bold text-green-600">{stats.views}</p>
        <p className="text-xs text-green-600">总浏览</p>
      </div>
      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
        <p className="text-2xl font-bold text-purple-600">{stats.comments}</p>
        <p className="text-xs text-purple-600">评论数</p>
      </div>
      <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
        <p className="text-2xl font-bold text-orange-600">{stats.users}</p>
        <p className="text-xs text-orange-600">用户数</p>
      </div>
    </div>
  </div>
);

// 友情链接
export const FriendLinks = ({ links }: { links: Array<{ name: string; url: string; icon?: string }> }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="w-1 h-5 bg-gradient-to-b from-teal-500 to-cyan-500 rounded mr-3"></span>
      🔗 友情链接
    </h3>
    <div className="flex flex-wrap gap-2">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-sm transition-all border border-gray-100 hover:border-blue-200"
        >
          {link.name}
        </a>
      ))}
    </div>
  </div>
);

// 文章卡片
export const ModernArticleCard = ({ article }: { article: { id: string; slug: string; title: string; excerpt: string; coverImage?: string; date: string; views: number; category?: string; tags?: string[] } }) => (
  <article className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100 group mb-8">
    <div className="relative">
      {article.coverImage ? (
        <div className="h-56 overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      ) : (
        <div className="h-56 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
          <span className="text-white text-4xl">📝</span>
        </div>
      )}
      {article.category && (
        <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600 shadow-sm">
          {article.category}
        </span>
      )}
    </div>
    <div className="p-6">
      <Link href={`/articles/${article.slug}`}>
        <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h2>
      </Link>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>📅 {article.date}</span>
          <span>👁️ {article.views}</span>
        </div>
        <Link href={`/articles/${article.slug}`} className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
          阅读全文 →
        </Link>
      </div>
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {article.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </article>
);

// Hero 区域轮播
export const HeroBanner = ({ banners }: { banners: Array<{ id: string; title: string; subtitle: string; image?: string; link?: string }> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative h-96 overflow-hidden rounded-2xl mb-8 shadow-lg">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIndex ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {banner.image ? (
            <Image src={banner.image} alt={banner.title} fill className="object-cover" />
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
            <p className="text-lg opacity-90">{banner.subtitle}</p>
            {banner.link && (
              <Link href={banner.link} className="inline-block mt-4 px-6 py-2 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                查看详情 →
              </Link>
            )}
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  );
};

// 分类导航
export const CategoryNav = ({ categories }: { categories: Array<{ id: string; name: string; slug: string; count: number; icon?: string }> }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm mb-8 border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded mr-3"></span>
      📂 文章分类
    </h3>
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => (
        <Link key={cat.id} href={`/categories/${cat.slug}`} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all border border-blue-100 group">
          <span className="text-2xl">{cat.icon || "📄"}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</h4>
            <p className="text-xs text-gray-500">{cat.count} 篇文章</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// 双栏主题主组件
export default function ElegantTwoColumnTheme({
  banners = [],
  featuredArticles = [],
  latestArticles = [],
  categories = [],
  hotTags = [],
  friendLinks = [],
  siteStats = { articles: 0, views: 0, comments: 0, users: 0 },
  authorInfo = { name: "博客作者", bio: "热爱生活，热爱写作" },
  adConfig = DEFAULT_AD_CONFIG,
}: {
  banners?: Array<{ id: string; title: string; subtitle: string; image?: string; link?: string }>;
  featuredArticles?: Array<any>;
  latestArticles?: Array<any>;
  categories?: Array<any>;
  hotTags?: Array<any>;
  friendLinks?: Array<any>;
  siteStats?: { articles: number; views: number; comments: number; users: number };
  authorInfo?: { name: string; bio: string };
  adConfig?: any[];
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 顶部装饰条 */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-1" />

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Banner */}
        {banners.length > 0 && <HeroBanner banners={banners} />}

        {/* 分类导航 */}
        {categories.length > 0 && <CategoryNav categories={categories} />}

        {/* 双栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 精选文章标题 */}
            {featuredArticles.length > 0 && (
              <div className="flex items-center mb-6">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded mr-4"></span>
                <h2 className="text-2xl font-bold text-gray-800">✨ 精选文章</h2>
              </div>
            )}

            {/* 精选文章 */}
            {featuredArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <ModernArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* 广告位 1 - 内容顶部 */}
            <AdByPosition position="content-top" ads={adConfig} />

            {/* 最新文章标题 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded mr-4"></span>
                <h2 className="text-2xl font-bold text-gray-800">📚 最新文章</h2>
              </div>
              <Link href="/articles" className="text-blue-600 hover:text-blue-700 font-medium">
                查看全部 →
              </Link>
            </div>

            {/* 最新文章列表 */}
            <div className="space-y-6">
              {latestArticles.map((article, idx) => (
                <ModernArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* 广告位 2 - 内容中部 */}
            <AdByPosition position="content-middle" ads={adConfig} />

            {/* 加载更多按钮 */}
            {latestArticles.length > 0 && (
              <div className="text-center">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  加载更多文章
                </button>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className={scrolled ? "sticky top-4" : ""}>
              {/* 作者信息 */}
              <AuthorCard name={authorInfo.name} bio={authorInfo.bio} />

              {/* 广告位 3 - 侧边栏顶部 */}
              <AdByPosition position="sidebar-top" ads={adConfig} />

              {/* 热门文章 */}
              {featuredArticles.length > 0 && <HotArticles articles={featuredArticles.slice(0, 5)} />}

              {/* 站点统计 */}
              <SiteStatistics stats={siteStats} />

              {/* 热门标签 */}
              {hotTags.length > 0 && <HotTagCloud tags={hotTags} />}

              {/* 广告位 4 - 侧边栏中部 */}
              <AdByPosition position="sidebar-middle" ads={adConfig} />

              {/* 友情链接 */}
              {friendLinks.length > 0 && <FriendLinks links={friendLinks} />}

              {/* 广告位 5 - 侧边栏底部 */}
              <AdByPosition position="sidebar-bottom" ads={adConfig} />
            </div>
          </div>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-1 mt-12" />
    </div>
  );
}
