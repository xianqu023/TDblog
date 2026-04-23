"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
}

interface SectionSliderProps {
  articles: Article[];
  sliderEnable?: boolean;
  sliderArticleCount?: number;
  adSliderRightImgUrl?: string;
  adSliderRightLink?: string;
  adSliderRightEnabled?: boolean;
}

export default function SectionSlider({
  articles = [],
  sliderEnable = true,
  sliderArticleCount = 3,
  adSliderRightImgUrl,
  adSliderRightLink,
  adSliderRightEnabled = true,
}: SectionSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // 获取轮播文章
  const sliderArticles = articles.slice(0, sliderArticleCount);

  console.log('SectionSlider props:', { 
    sliderEnable, 
    sliderArticleCount, 
    totalArticles: articles.length, 
    sliderArticles: sliderArticles.length,
    adSliderRightEnabled,
    adSliderRightImgUrl 
  });

  // 自动轮播
  const nextSlide = useCallback(() => {
    if (!isPaused && sliderArticles.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % sliderArticles.length);
    }
  }, [isPaused, sliderArticles.length]);

  useEffect(() => {
    if (!sliderEnable || sliderArticles.length <= 1) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [sliderEnable, sliderArticles.length, nextSlide]);

  // 手动切换
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderArticles.length) % sliderArticles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderArticles.length);
  };

  // 如果没有启用或没有文章，不渲染
  if (!sliderEnable || sliderArticles.length === 0) {
    console.log('SectionSlider: not rendering, sliderEnable:', sliderEnable, 'articles length:', sliderArticles.length);
    return null;
  }

  console.log('SectionSlider: rendering', sliderArticles.length, 'articles, currentIndex:', currentIndex);

  return (
    <div className="container mx-auto px-4 py-6" suppressHydrationWarning>
      <div className="relative">
        {/* 主容器 - 中式风格 */}
        <div
          className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          style={{
            boxShadow: "0 10px 40px rgba(196, 30, 58, 0.1)",
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          suppressHydrationWarning
        >
          {/* 装饰性中式边框 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C41E3A] via-[#B87333] to-[#C41E3A] opacity-80" />
          
          <div className="grid grid-cols-1 md:grid-cols-10 gap-0" style={{ display: 'grid' }}>
            {/* 左侧轮播区域 (70%) */}
            <div className="md:col-span-7 relative" style={{ display: 'block' }}>
              <div
                className="relative h-[400px] md:h-[450px] overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
              >
                {sliderArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{
                      opacity: index === currentIndex ? 1 : 0,
                      pointerEvents: index === currentIndex ? 'auto' : 'none',
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <Link href={`/zh/articles/${article.slug}`} className="block w-full h-full">
                      {/* 封面图 */}
                      <div className="relative w-full h-full">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#C41E3A] to-[#B87333]" />
                        )}
                        
                        {/* 水墨渐变遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        
                        {/* 内容区域 */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          <div
                            className="transition-all duration-500 delay-300"
                            style={{
                              opacity: index === currentIndex ? 1 : 0,
                              transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)',
                            }}
                          >
                            {/* 文章标题 */}
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 line-clamp-2">
                              {article.title}
                            </h2>
                            
                            {/* 文章摘要 */}
                            <p className="text-gray-200 text-sm md:text-base line-clamp-2 max-w-2xl">
                              {article.excerpt}
                            </p>
                            
                            {/* 阅读更多提示 */}
                            <div className="mt-4 flex items-center gap-2 text-[#C41E3A]">
                              <span className="text-white text-sm font-medium">阅读更多</span>
                              <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}

                {/* 左右箭头导航 - 悬停时显示 */}
                {sliderArticles.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-[#C41E3A] text-gray-800 hover:text-white flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isHovering ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      }`}
                      aria-label="上一张"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={goToNext}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-[#C41E3A] text-gray-800 hover:text-white flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isHovering ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                      }`}
                      aria-label="下一张"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* 指示器 */}
                {sliderArticles.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {sliderArticles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentIndex
                            ? "w-8 h-2 bg-[#C41E3A]"
                            : "w-2 h-2 bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`跳转到第 ${index + 1} 张`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧广告区域 (30%) */}
            {adSliderRightEnabled && (
              <div className="md:col-span-3 relative" style={{ display: 'block' }}>
                <div className="h-[400px] md:h-[450px] relative overflow-hidden bg-gray-50" style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}>
                  {adSliderRightImgUrl ? (
                    <Link
                      href={adSliderRightLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      <img
                        src={adSliderRightImgUrl}
                        alt="广告"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* 广告遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </Link>
                  ) : (
                    /* 默认广告占位 */
                    <div className="w-full h-full bg-gradient-to-br from-[#C41E3A]/10 to-[#B87333]/10 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#B87333] flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">AD</span>
                        </div>
                        <p className="text-gray-600 text-sm">广告位</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 中式边框装饰 */}
                  <div className="absolute inset-0 border-2 border-[#C41E3A]/20 rounded-tr-2xl pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* 底部装饰 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C41E3A] via-[#B87333] to-[#C41E3A] opacity-80" />
        </div>

        {/* 容器阴影装饰 */}
        <div
          className="absolute -inset-1 bg-gradient-to-r from-[#C41E3A]/20 via-[#B87333]/20 to-[#C41E3A]/20 rounded-2xl blur-xl -z-10 opacity-50"
          style={{ filter: "blur(20px)" }}
        />
      </div>
    </div>
  );
}
