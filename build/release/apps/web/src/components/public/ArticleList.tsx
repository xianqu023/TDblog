"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ArticleCard from "@/components/public/ArticleCard";
import { Loader2 } from "lucide-react";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  viewCount?: number;
  tags?: Array<{ name: string; color?: string }>;
  isPremium?: boolean;
  price?: number;
}

interface ArticleListProps {
  locale: string;
  initialArticles?: Article[];
}

export default function ArticleList({ locale, initialArticles = [] }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const limit = 6;

  // 加载文章
  const loadArticles = useCallback(async (pageNum: number) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/articles?locale=${locale}&status=PUBLISHED&page=${pageNum}&limit=${limit}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("加载失败");
      }

      const data = await response.json();

      if (!data.success || !data.articles) {
        setHasMore(false);
        return;
      }

      // 转换 API 返回的数据格式
      const newArticles = data.articles.map((article: any) => {
        const translation = article.translations?.[0] || {};
        
        return {
          id: article.id,
          slug: article.slug,
          title: translation.title || article.title || "",
          excerpt: translation.excerpt || article.excerpt || "",
          coverImage: article.coverImage,
          publishedAt: article.publishedAt,
          viewCount: article.viewCount || 0,
          tags: article.tags?.map((at: any) => ({
            name: at.tag?.name || "",
            color: at.tag?.color,
          })) || [],
          isPremium: article.isPremium || false,
          price: article.premiumPrice,
        };
      });

      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
        setPage(pageNum + 1);
      }

      // 检查是否还有更多文章
      const totalPages = Math.ceil(data.pagination?.total / limit);
      if (pageNum >= totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("加载失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [locale, limit, loading]);

  // Intersection Observer 回调
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      loadArticles(page);
    }
  }, [hasMore, loading, page, loadArticles]);

  // 设置 Intersection Observer
  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.current.observe(loaderRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleObserver]);

  // 手动加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      loadArticles(page);
    }
  };

  if (articles.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <p className="text-xl text-gray-600 mb-2">暂无文章</p>
        <p className="text-gray-500">
          {locale === "zh" && "请前往后台管理添加文章"}
          {locale === "en" && "Please add articles from admin panel"}
          {locale === "ja" && "管理パネルから記事を追加してください"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </div>

      {/* 加载指示器 */}
      <div 
        ref={loaderRef} 
        className="mt-12 text-center"
        style={{ minHeight: "100px" }}
      >
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        )}
        
        {!loading && hasMore && (
          <button
            onClick={loadMore}
            className="px-10 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all duration-300"
          >
            加载更多
          </button>
        )}

        {!loading && !hasMore && articles.length > 0 && (
          <div className="py-8 text-gray-500">
            已经到底了~
          </div>
        )}

        {error && (
          <div className="py-4 px-6 bg-red-50 text-red-600 rounded-lg inline-block">
            {error}
            <button 
              onClick={loadMore}
              className="ml-4 underline font-medium"
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
