import { Suspense } from "react";
import { Search } from "lucide-react";
import ChineseTwoColumnLayout from "@/components/layout/ChineseTwoColumnLayout";
import { getWidgetConfig } from "@/app/actions/widget-config";
import DynamicSidebar from "@/components/DynamicSidebar";
import { DEFAULT_SIDEBAR_CONFIG } from "@/lib/sidebar-config";
import type { Locale } from "@/lib/i18n/config";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SearchPage({ 
  searchParams,
  params,
}: { 
  searchParams: Promise<{ q?: string }>;
  params: Promise<{ locale: Locale }>;
}) {
  const { q: query } = await searchParams;
  const { locale } = await params;
  
  // 获取侧边栏配置
  const widgetConfig = await getWidgetConfig();
  const widgets = widgetConfig?.articles || DEFAULT_SIDEBAR_CONFIG.articles;
  
  // 获取网站设置和分类、标签等数据
  const [siteSettings, categories, tags, hotArticles] = await Promise.all([
    getSiteSettings(),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`,
      { cache: "no-store" }
    ).then(res => res.ok ? res.json() : { success: false, data: [] }).then(data => data.data || []),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tags?limit=10`,
      { cache: "no-store" }
    ).then(res => res.ok ? res.json() : { success: false, data: [] }).then(data => data.data || []),
    fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/articles?locale=${locale}&status=PUBLISHED&page=1&limit=5&orderBy=views`,
      { cache: "no-store" }
    ).then(res => res.ok ? res.json() : { success: false, data: [] }).then(data => data.articles || []),
  ]);

  // friendLinks 和 archives API 可能不存在，使用空数组
  const friendLinks: Array<{ name: string; url: string }> = [];
  const authorInfo = undefined;
  const archives: any[] = [];

  return (
    <ChineseTwoColumnLayout
      articles={[]}
      categories={categories}
      tags={tags}
      hotArticles={hotArticles}
      authorInfo={authorInfo}
      friendLinks={friendLinks}
      archives={archives}
      siteSettings={siteSettings}
    >
      <div className="min-h-screen bg-[var(--theme-bg)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-[var(--theme-text)] mb-8 text-center">
              搜索结果
            </h1>

            {/* 搜索框 */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  defaultValue={query}
                  placeholder="搜索文章..."
                  className="w-full px-6 py-4 pl-14 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] text-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--theme-text-muted)]" />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  搜索
                </button>
              </div>
            </div>

            {/* 搜索结果提示 */}
            {query ? (
              <div className="text-center py-12">
                <p className="text-[var(--theme-text)] text-lg mb-4">
                  正在搜索关于 "<span className="font-bold text-[var(--theme-primary)]">{query}</span>" 的内容
                </p>
                <p className="text-[var(--theme-text-muted)]">
                  搜索功能开发中，请稍后...
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--theme-text-muted)]">
                  请输入搜索关键词
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <DynamicSidebar widgets={widgets} pageType="articles" />
          </div>
        </div>
      </div>
    </ChineseTwoColumnLayout>
  );
}
