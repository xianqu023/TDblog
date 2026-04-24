"use client";

import { useState, useEffect } from "react";
import { ArticleCardView, ArticleListView } from "@/components/main";
import { AdSlot } from "@/components/ads";
import {
  AuthorCard,
  HotArticles,
  TagCloud,
  CalendarArchive,
  SearchBox,
  EmailSubscription,
  FriendLinks,
  Announcement,
  DailyQuote,
} from "@/components/sidebar";
import { ChevronRight } from "lucide-react";

interface ElegantTwoColumnLayoutProps {
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

const DEFAULT_CONFIG = {
  layout: {
    isTwoColumn: true,
    sidebarPosition: 'right' as const,
    isStickySidebar: true,
    articleViewMode: 'card' as const,
    enableAnimations: true,
  },
  sidebarWidgets: {
    searchBox: { enabled: true, order: 1 },
    authorCard: { enabled: true, order: 2 },
    hotArticles: { enabled: true, order: 3 },
    tagCloud: { enabled: true, order: 4 },
    calendarArchive: { enabled: true, order: 5 },
    announcement: { enabled: true, order: 6 },
    dailyQuote: { enabled: true, order: 7 },
    friendLinks: { enabled: true, order: 8 },
    emailSubscription: { enabled: true, order: 9 },
  },
  adSlots: {
    contentTop: { enabled: false, type: 'adsense' as const, size: '728x90' },
    contentMiddle: { enabled: false, type: 'adsense' as const, size: '728x90' },
    sidebarTop: { enabled: false, type: 'adsense' as const, size: '300x250' },
    sidebarMiddle: { enabled: false, type: 'adsense' as const, size: '300x600' },
    sidebarBottom: { enabled: false, type: 'adsense' as const, size: '300x250' },
  },
};

export default function ElegantTwoColumnLayout({ 
  children, 
  articles, 
  categories, 
  tags, 
  hotArticles = [], 
  authorInfo, 
  friendLinks = [], 
  archives = [],
  siteSettings 
}: ElegantTwoColumnLayoutProps) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isArticlePage, setIsArticlePage] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>(articles);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [articlesPerPage] = useState(8);

  useEffect(() => {
    if (articles && articles.length > 0) {
      const uniqueArticles = Array.from(new Map(articles.map((article: any) => [article.id, article])).values());
      setAllArticles(uniqueArticles);
      setCurrentPage(1);
    }
  }, [articles]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'elegant-two-column');
    document.body.classList.add('theme-elegant');
    
    const pathname = window.location.pathname;
    const isArticle = pathname.includes('/articles/');
    setIsArticlePage(isArticle);
    
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/theme-config');
        const data = await res.json();
        if (data.success && data.config) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data.config,
            layout: {
              ...DEFAULT_CONFIG.layout,
              ...(data.config.layout || {}),
            },
            sidebarWidgets: {
              ...DEFAULT_CONFIG.sidebarWidgets,
              ...(data.config.sidebarWidgets || {}),
            },
            adSlots: {
              ...DEFAULT_CONFIG.adSlots,
              ...(data.config.adSlots || {}),
            },
          });
        }
      } catch (error) {
        console.error('Failed to load theme config:', error);
      }
    };
    
    loadConfig();
    
    return () => {
      document.body.classList.remove('theme-elegant');
    };
  }, []);

  const loadArticles = async (page: number) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/articles?page=${page}&limit=${articlesPerPage}&locale=zh&status=PUBLISHED`);
      const data = await response.json();
      
      if (data.success && data.articles && data.articles.length > 0) {
        const transformedArticles = data.articles.map((article: any) => {
          const translation = article.translations?.[0] || {};
          
          return {
            id: article.id,
            slug: article.slug,
            title: translation.title || article.title || "",
            excerpt: translation.excerpt || article.excerpt || "",
            coverImage: article.coverImage,
            publishedAt: article.publishedAt,
            date: article.publishedAt,
            viewCount: article.viewCount || 0,
            views: article.viewCount || 0,
            category: article.categories?.[0]?.category?.name,
            tags: article.tags?.filter((at: any) => at && at.tag).map((at: any) => at.tag?.name || "") || [],
            isPremium: article.isPremium || false,
            isPinned: article.isPinned || false,
            price: article.premiumPrice,
          };
        });
        
        setAllArticles(transformedArticles);
        setCurrentPage(page);
        if (data.pagination && data.pagination.total) {
          setTotalPages(Math.ceil(data.pagination.total / articlesPerPage));
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (data.success && data.articles && data.articles.length === 0 && page > 1) {
        loadArticles(1);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadArticles(page);
    }
  };

  const { layout, sidebarWidgets, adSlots } = config;

  const renderSortedSidebarWidgets = () => {
    const enabledWidgets = Object.entries(sidebarWidgets)
      .filter(([_, config]) => (config as any)?.enabled)
      .sort((a, b) => ((a[1] as any)?.order || 0) - ((b[1] as any)?.order || 0))
      .map(([id, config]) => ({ id, config }));

    return enabledWidgets.map(({ id }) => {
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
        case 'friendLinks':
          return <FriendLinks key={id} links={friendLinks} />;
        case 'dailyQuote':
          return <DailyQuote key={id} />;
        default:
          return null;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col theme-elegant" suppressHydrationWarning>
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-1" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className={`grid gap-8 ${layout.isTwoColumn ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
          <div className={`${layout.isTwoColumn ? 'lg:col-span-3' : 'col-span-1'} min-w-0`}>
            {!isArticlePage && (
              <div className="mb-6 flex items-center text-sm text-gray-600">
                <a href="/zh" className="hover:text-blue-600">首页</a>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-gray-800">文章列表</span>
              </div>
            )}

            {!isArticlePage && (
              <>
                {adSlots.contentTop.enabled && (
                  <div className="mb-8">
                    <AdSlot position="content-top" config={adSlots.contentTop} />
                  </div>
                )}

                {layout.articleViewMode === 'card' ? (
                  <div className="flex flex-col gap-6">
                    <ArticleCardView articles={allArticles} />
                  </div>
                ) : (
                  <ArticleListView articles={allArticles} />
                )}

                {adSlots.contentMiddle.enabled && (
                  <div className="my-8">
                    <AdSlot position="content-middle" config={adSlots.contentMiddle} />
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    
                    {(() => {
                      const pages = [];
                      const maxVisible = 7;
                      
                      if (totalPages <= maxVisible) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (currentPage <= 3) {
                          for (let i = 1; i <= 5; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis-end');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(1);
                          pages.push('ellipsis-start');
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
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
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            } ${pageNum === 1 ? '' : 'border-l'} ${pageNum === totalPages ? '' : 'border-r'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
                
                {loading && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-600">加载中...</p>
                  </div>
                )}
              </>
            )}

            {isArticlePage && children}
          </div>

          {layout.isTwoColumn && (
            <aside className="lg:col-span-1">
              <div className={`flex flex-col gap-6 ${layout.isStickySidebar ? 'lg:sticky lg:top-4' : ''}`}>
                {renderSortedSidebarWidgets()}
                
                {adSlots.sidebarTop.enabled && (
                  <AdSlot position="sidebar-top" config={adSlots.sidebarTop} />
                )}
                
                {adSlots.sidebarMiddle.enabled && (
                  <AdSlot position="sidebar-middle" config={adSlots.sidebarMiddle} />
                )}
                
                {adSlots.sidebarBottom.enabled && (
                  <AdSlot position="sidebar-bottom" config={adSlots.sidebarBottom} />
                )}
              </div>
            </aside>
          )}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">关于博客</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                分享技术与生活，记录学习成长之路。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/zh" className="text-blue-100 hover:text-white transition-colors">首页</a></li>
                <li><a href="/zh/articles" className="text-blue-100 hover:text-white transition-colors">文章</a></li>
                <li><a href="/zh/categories" className="text-blue-100 hover:text-white transition-colors">分类</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">联系我们</h3>
              <p className="text-blue-100 text-sm">邮箱: contact@example.com</p>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-blue-100">
            <p>© {new Date().getFullYear()} {siteSettings?.siteName || '博客'}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-1" />
    </div>
  );
}
