"use client";

import { useState, useEffect } from "react";
import { ArticleCardView, ArticleListView } from "@/components/main";
import { ChevronRight } from "lucide-react";

interface MinimalLayoutProps {
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
    isTwoColumn: false,
    sidebarPosition: 'right' as const,
    isStickySidebar: false,
    articleViewMode: 'list' as 'list' | 'card',
    enableAnimations: false,
  },
};

export default function MinimalLayout({ 
  children, 
  articles, 
  categories, 
  tags, 
  hotArticles = [], 
  authorInfo, 
  friendLinks = [], 
  archives = [],
  siteSettings 
}: MinimalLayoutProps) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isArticlePage, setIsArticlePage] = useState(false);
  const [allArticles, setAllArticles] = useState<any[]>(articles);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [articlesPerPage] = useState(10);

  useEffect(() => {
    if (articles && articles.length > 0) {
      const uniqueArticles = Array.from(new Map(articles.map((article: any) => [article.id, article])).values());
      setAllArticles(uniqueArticles);
      setCurrentPage(1);
    }
  }, [articles]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'minimal');
    document.body.classList.add('theme-minimal');
    
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
          });
        }
      } catch (error) {
        console.error('Failed to load theme config:', error);
      }
    };
    
    loadConfig();
    
    return () => {
      document.body.classList.remove('theme-minimal');
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

  const { layout } = config;

  return (
    <div className="min-h-screen bg-white flex flex-col theme-minimal" suppressHydrationWarning>
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        {!isArticlePage && (
          <div className="mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-light text-gray-900 mb-2">文章</h1>
            <p className="text-sm text-gray-500">{siteSettings?.siteDescription}</p>
          </div>
        )}

        {!isArticlePage && (
          <>
            {layout.articleViewMode === 'card' ? (
              <div className="flex flex-col gap-8">
                <ArticleCardView articles={allArticles} />
              </div>
            ) : (
              <div className="space-y-6">
                {allArticles.map((article) => (
                  <article key={article.id} className="pb-6 border-b border-gray-100">
                    <a href={`/articles/${article.slug}`} className="block group">
                      <h2 className="text-xl font-normal text-gray-900 group-hover:text-gray-600 transition-colors mb-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{article.date}</span>
                        <span>{article.views} 阅读</span>
                        {article.category && <span>{article.category}</span>}
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-12 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  className={`px-4 py-2 text-sm border ${
                    currentPage === page 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
            
            {loading && (
              <div className="mt-4 text-center">
                <p className="text-gray-500">加载中...</p>
              </div>
            )}
          </>
        )}

        {isArticlePage && children}
      </main>

      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {siteSettings?.siteName || '博客'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
