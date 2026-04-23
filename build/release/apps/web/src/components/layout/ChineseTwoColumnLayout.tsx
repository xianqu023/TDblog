"use client";

import { useState, useEffect } from "react";
import { ArticleCardView, ArticleListView } from "@/components/main";
import { AdSlot } from "@/components/ads";
import SectionSlider from "@/components/main/SectionSlider";
import {
  AuthorCard,
  HotArticles,
  TagCloud,
  CalendarArchive,
  SearchBox,
  EmailSubscription,
  WeatherWidget,
  Announcement,
  FriendLinks,
  DailyQuote,
  HotComments,
  OnlineTools,
  PhotoGallery,
} from "@/components/sidebar";
import { ChevronRight } from "lucide-react";
import { detectSafari, getSafariOptimizations, applySafariFixes, type SafariFeatures } from "@/lib/safari-detect";

interface ChineseTwoColumnLayoutProps {
  children: React.ReactNode;
  articles: any[];
  categories: any[];
  tags: any[];
  hotArticles?: any[];
  authorInfo?: {
    name: string;
    bio: string;
    avatar?: string;
  };
  friendLinks?: Array<{ name: string; url: string }>;
  archives?: any[];
  siteSettings?: {
    siteName: string;
    siteDescription: string;
    logoUrl: string;
    siteKeywords: string;
  };
}

// 中式主题默认配置
const DEFAULT_CONFIG = {
  layout: {
    isTwoColumn: true,
    sidebarPosition: 'right' as const,
    isStickySidebar: true,
    articleViewMode: 'card' as const,
    enableAnimations: true,
  },
  slider: {
    sliderEnable: true,
    sliderArticleCount: 3,
    adSliderRightImgUrl: undefined as string | undefined,
    adSliderRightLink: undefined as string | undefined,
    adSliderRightEnabled: true,
  },
  sidebarWidgets: {
    authorCard: { enabled: true, order: 1 },
    hotArticles: { enabled: true, order: 2 },
    tagCloud: { enabled: true, order: 3 },
    calendarArchive: { enabled: true, order: 4 },
    searchBox: { enabled: true, order: 5 },
    emailSubscription: { enabled: true, order: 6 },
    weatherWidget: { enabled: false, order: 7 },
    announcement: { enabled: true, order: 8 },
    friendLinks: { enabled: true, order: 9 },
    hotComments: { enabled: false, order: 10 },
    dailyQuote: { enabled: true, order: 11 },
    onlineTools: { enabled: false, order: 12 },
    photoGallery: { enabled: false, order: 13 },
  },
  adSlots: {
    topBanner: { enabled: false, type: 'adsense' as const, size: '728x90' },
    sidebarTop: { enabled: false, type: 'adsense' as const, size: '300x250' },
    sidebarMiddle: { enabled: false, type: 'adsense' as const, size: '300x600' },
    articleListMiddle: { enabled: false, type: 'adsense' as const, size: '728x90' },
    articleBottom: { enabled: false, type: 'adsense' as const, size: '728x90' },
  },
};

export default function ChineseTwoColumnLayout({ 
  children, 
  articles, 
  categories, 
  tags, 
  hotArticles = [], 
  authorInfo, 
  friendLinks = [], 
  archives = [],
  siteSettings 
}: ChineseTwoColumnLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isArticlePage, setIsArticlePage] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>(articles);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [articlesPerPage, setArticlesPerPage] = useState(8);
  const [isSafari, setIsSafari] = useState(false);
  const [safariFeatures, setSafariFeatures] = useState<SafariFeatures | null>(null);

  // 检测 Safari 浏览器
  useEffect(() => {
    const features = detectSafari();
    setIsSafari(features.isSafari);
    setSafariFeatures(features);
    
    // 应用 Safari 修复
    if (features.isSafari) {
      const optimizations = getSafariOptimizations(features);
      if (optimizations.enableStickyFallback) {
        // 需要 sticky 回退方案
        console.log('Safari detected, applying sticky fallback');
      }
    }
  }, []);

  // 监听articles prop的变化，更新allArticles状态
  useEffect(() => {
    if (articles && articles.length > 0) {
      // 确保articles中没有重复的文章
      const uniqueArticles = Array.from(new Map(articles.map((article: any) => [article.id, article])).values());
      setAllArticles(uniqueArticles);
      // 重置页码
      setCurrentPage(1);
    }
  }, [articles]);

  useEffect(() => {
    // 应用主题到 document
    document.documentElement.setAttribute('data-theme', 'chinese-two-column');
    document.body.classList.add('theme-chinese');
    
    // 检查是否是文章详情页
    const pathname = window.location.pathname;
    const isArticle = pathname.includes('/articles/');
    setIsArticlePage(isArticle);
    
    // 从 API 加载主题配置（不阻塞渲染）
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/theme-config');
        const data = await res.json();
        console.log('Loaded theme config:', data);
        if (data.success && data.config) {
          const loadedConfig = data.config;
          setConfig({
            ...DEFAULT_CONFIG,
            ...loadedConfig,
            layout: {
              ...DEFAULT_CONFIG.layout,
              ...(loadedConfig.layout || {}),
            },
            slider: {
              ...DEFAULT_CONFIG.slider,
              ...(loadedConfig.slider || {}),
            },
            sidebarWidgets: {
              ...DEFAULT_CONFIG.sidebarWidgets,
              ...(loadedConfig.sidebarWidgets || {}),
            },
            adSlots: {
              ...DEFAULT_CONFIG.adSlots,
              ...(loadedConfig.adSlots || {}),
            },
          });
        }
      } catch (error) {
        console.error('Failed to load theme config:', error);
      }
    };
    
    loadConfig();
    
    return () => {
      document.body.classList.remove('theme-chinese');
    };
  }, []);

  // 加载指定页码的文章
  const loadArticles = async (page: number) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/articles?page=${page}&limit=${articlesPerPage}&locale=zh&status=PUBLISHED`);
      const data = await response.json();
      
      if (data.success && data.articles && data.articles.length > 0) {
        // 转换 API 返回的数据格式，与 getArticles 函数保持一致
        const transformedArticles = data.articles.map((article: any) => {
          // 获取当前语言的翻译
          const translation = article.translations?.[0] || {};
          
          return {
            id: article.id,
            slug: article.slug,
            title: translation.title || article.title || "",
            excerpt: translation.excerpt || article.excerpt || "",
            coverImage: article.coverImage,
            publishedAt: article.publishedAt,
            date: article.publishedAt, // 兼容 ArticleCardView
            viewCount: article.viewCount || 0,
            views: article.viewCount || 0, // 兼容 ArticleCardView
            category: article.categories?.[0]?.category?.name,
            tags: article.tags?.filter((at: any) => at && at.tag).map((at: any) => at.tag?.name || "") || [],
            isPremium: article.isPremium || false,
            isPinned: article.isPinned || false,
            price: article.premiumPrice,
          };
        });
        
        setAllArticles(transformedArticles);
        setCurrentPage(page);
        // 计算总页数
        if (data.pagination && data.pagination.total) {
          setTotalPages(Math.ceil(data.pagination.total / articlesPerPage));
        }
        
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (data.success && data.articles && data.articles.length === 0 && page > 1) {
        // 如果是空结果但不是第一页，尝试加载第一页
        loadArticles(1);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时加载总文章数
  useEffect(() => {
    const loadTotalArticles = async () => {
      try {
        const response = await fetch('/api/articles?page=1&limit=1&locale=zh&status=PUBLISHED');
        const data = await response.json();
        
        if (data.success && data.pagination && data.pagination.total) {
          setTotalPages(Math.ceil(data.pagination.total / articlesPerPage));
        }
      } catch (error) {
        console.error('Failed to load total articles:', error);
      }
    };
    
    if (!isArticlePage) {
      loadTotalArticles();
    }
  }, [articlesPerPage, isArticlePage]);

  // 分页导航函数
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadArticles(page);
    }
  };

  const { layout, slider, sidebarWidgets, adSlots } = config;

  // 渲染侧边栏组件（按 order 排序）
  const renderSortedSidebarWidgets = () => {
    // 获取所有启用的组件，按 order 排序
    const enabledWidgets = Object.entries(sidebarWidgets)
      .filter(([_, config]) => config?.enabled)
      .sort((a, b) => (a[1]?.order || 0) - (b[1]?.order || 0))
      .map(([id, config]) => ({ id, config }));

    return enabledWidgets.map(({ id, config }) => {
      switch (id) {
        case 'searchBox':
          return <SearchBox key={id} />;
        case 'authorCard':
          return (
            <AuthorCard
              key={id}
              name={authorInfo?.name || '博主'}
              bio={authorInfo?.bio || '热爱生活，热爱写作'}
              avatar={authorInfo?.avatar}
            />
          );
        case 'announcement':
          return <Announcement key={id} content="欢迎来到我的博客，分享技术与生活！" />;
        case 'hotArticles':
          return <HotArticles key={id} articles={hotArticles} />;
        case 'tagCloud':
          return <TagCloud key={id} tags={tags} />;
        case 'calendarArchive':
          return <CalendarArchive key={id} archives={archives} />;
        case 'emailSubscription':
          return <EmailSubscription key={id} />;
        case 'weatherWidget':
          return <WeatherWidget key={id} />;
        case 'friendLinks':
          return <FriendLinks key={id} links={friendLinks} />;
        case 'dailyQuote':
          return <DailyQuote key={id} />;
        case 'hotComments':
          return <HotComments key={id} />;
        case 'onlineTools':
          return <OnlineTools key={id} />;
        case 'photoGallery':
          return <PhotoGallery key={id} />;
        default:
          return null;
      }
    });
  };

  const navLinks = [
    { name: '首页', href: '/zh' },
    { name: '文章', href: '/zh/articles' },
    { name: '分类', href: '/zh/categories' },
    { name: '标签', href: '/zh/tags' },
    { name: '归档', href: '/zh/archives' },
    { name: '关于', href: '/zh/about' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col theme-chinese" suppressHydrationWarning>
      {/* 顶部导航栏由 PublicLayout 管理 */}

      {/* 分区幻灯片 - 仅在首页显示 */}
      {!isArticlePage && (
        <SectionSlider
          articles={articles}
          sliderEnable={slider.sliderEnable}
          sliderArticleCount={slider.sliderArticleCount}
          adSliderRightImgUrl={slider.adSliderRightImgUrl}
          adSliderRightLink={slider.adSliderRightLink}
          adSliderRightEnabled={slider.adSliderRightEnabled}
        />
      )}

      {/* 主内容区 */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className={`grid gap-8 ${layout.isTwoColumn ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* 左侧内容区 */}
          <div className={`${layout.isTwoColumn ? 'lg:col-span-8' : 'col-span-1'} min-w-0 overflow-hidden`}>
            {/* 面包屑导航 */}
            {!isArticlePage && (
              <div className="mb-6 flex items-center text-sm text-gray-600">
                <a href="/zh" className="hover:text-[#C41E3A]">首页</a>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-gray-800">文章列表</span>
              </div>
            )}

            {/* 文章列表（仅当不是文章详情页时渲染） */}
            {!isArticlePage && (
              <>
                {layout.articleViewMode === 'card' ? (
                  <div className="flex flex-col gap-6">
                    <ArticleCardView articles={allArticles} />
                  </div>
                ) : (
                  <ArticleListView articles={allArticles} />
                )}

                {/* 分页控件 */}
                <div className="mt-8 flex justify-center">
                  <nav className="inline-flex rounded-md shadow">
                    {/* 上一页按钮 */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    
                    {/* 页码按钮 - 智能显示 */}
                    {(() => {
                      const pages = [];
                      const maxVisible = 7; // 最多显示的页码按钮数
                      
                      if (totalPages <= maxVisible) {
                        // 总页数较少，全部显示
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // 总页数较多，智能显示
                        if (currentPage <= 3) {
                          // 当前页靠前，显示前 5 个 + 省略号 + 最后 1 个
                          for (let i = 1; i <= 5; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis-end');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          // 当前页靠后，显示第 1 个 + 省略号 + 最后 5 个
                          pages.push(1);
                          pages.push('ellipsis-start');
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // 当前页在中间，显示第 1 个 + 省略号 + 当前页前后 2 个 + 省略号 + 最后 1 个
                          pages.push(1);
                          pages.push('ellipsis-start');
                          for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis-end');
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((page, index) => {
                        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                          return (
                            <span
                              key={page}
                              className="px-4 py-2 text-sm text-gray-700 bg-white border-t border-b border-gray-300"
                            >
                              ...
                            </span>
                          );
                        }
                        
                        const pageNum = page as number;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium border-t border-b ${
                              currentPage === pageNum 
                                ? 'bg-[#C41E3A] text-white border-[#C41E3A]' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } ${pageNum === 1 ? '' : 'border-l'} ${pageNum === totalPages ? '' : 'border-r'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                    
                    {/* 下一页按钮 */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
                
                {/* 加载状态 */}
                {loading && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-600">加载中...</p>
                  </div>
                )}

                {/* 文章列表中间广告 */}
                {adSlots.articleListMiddle.enabled && (
                  <div className="my-8">
                    <AdSlot position="article-list-middle" config={adSlots.articleListMiddle} />
                  </div>
                )}

                {/* 文章底部广告 */}
                {adSlots.articleBottom.enabled && (
                  <div className="my-8">
                    <AdSlot position="article-bottom" config={adSlots.articleBottom} />
                  </div>
                )}
              </>
            )}

            {/* 文章详情页内容 */}
            {isArticlePage && children}
          </div>

          {/* 右侧侧边栏 - 顶部对齐 */}
          {layout.isTwoColumn && (
            <aside className="lg:col-span-4">
              <div 
                className={`flex flex-col gap-6 mt-8 ${layout.isStickySidebar !== false ? 'lg:sticky lg:top-8' : ''}`}
                style={{
                  ...(layout.isStickySidebar !== false && safariFeatures && !safariFeatures.supportsSticky ? {
                    position: 'fixed' as any,
                    top: '2rem',
                    width: '100%',
                    maxWidth: '33.333333%',
                    zIndex: 10,
                  } : {}),
                  ...(layout.isStickySidebar !== false && isSafari ? {
                    WebkitPosition: 'sticky' as any,
                    position: 'sticky' as any,
                    top: '2rem',
                    zIndex: 10,
                  } : {}),
                }}
              >
                {/* 动态渲染排序后的侧边栏组件 */}
                {renderSortedSidebarWidgets()}
                
                {/* 侧边顶部广告 */}
                {adSlots.sidebarTop.enabled && (
                  <AdSlot position="sidebar-top" config={adSlots.sidebarTop} />
                )}
                
                {/* 侧边中部广告 */}
                {adSlots.sidebarMiddle.enabled && (
                  <AdSlot position="sidebar-middle" config={adSlots.sidebarMiddle} />
                )}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-[var(--theme-secondary)] text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 关于 */}
            <div>
              <h3 className="text-lg font-bold mb-4">关于博客</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                分享技术与生活，记录学习成长之路。专注于前端开发、软件工程和生活感悟。
              </p>
            </div>
            
            {/* 快速链接 */}
            <div>
              <h3 className="text-lg font-bold mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/zh/articles" className="text-gray-300 hover:text-white transition-colors">
                    全部文章
                  </a>
                </li>
                <li>
                  <a href="/zh/categories" className="text-gray-300 hover:text-white transition-colors">
                    分类目录
                  </a>
                </li>
                <li>
                  <a href="/zh/tags" className="text-gray-300 hover:text-white transition-colors">
                    标签大全
                  </a>
                </li>
                <li>
                  <a href="/zh/about" className="text-gray-300 hover:text-white transition-colors">
                    关于我
                  </a>
                </li>
              </ul>
            </div>
            
            {/* 联系方式 */}
            <div>
              <h3 className="text-lg font-bold mb-4">联系我</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>邮箱：contact@example.com</li>
                <li>GitHub：@yourname</li>
                <li>微信：yourwechat</li>
              </ul>
            </div>
          </div>
          
          {/* 底部版权信息 */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 中式博客。All rights reserved.</p>
            <p className="mt-2">
              Powered by TDblog | Theme by Chinese Two-Column
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
