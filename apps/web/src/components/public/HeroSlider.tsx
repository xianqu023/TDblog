"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
}

interface HeroSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

export default function HeroSlider({
  slides,
  autoPlay = true,
  interval = 5000,
}: HeroSliderProps) {
  const t = useTranslations("home.hero");
  
  // Use provided slides or generate default slides with translations
  const defaultSlides: Slide[] = slides || [
    {
      id: "1",
      title: t("slide1Title"),
      subtitle: t("slide1Subtitle"),
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop",
      linkUrl: "/articles",
    },
    {
      id: "2",
      title: t("slide2Title"),
      subtitle: t("slide2Subtitle"),
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop",
      linkUrl: "/articles",
    },
    {
      id: "3",
      title: t("slide3Title"),
      subtitle: t("slide3Subtitle"),
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=400&fit=crop",
      linkUrl: "/articles",
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % defaultSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + defaultSlides.length) % defaultSlides.length);
  };

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {defaultSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-lg md:text-xl text-gray-200 mb-8">
                  {slide.subtitle}
                </p>
              )}
              {slide.linkUrl && (
                <a
                  href={slide.linkUrl}
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t("learnMore")}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        aria-label={t("previousSlide")}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        aria-label={t("nextSlide")}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {defaultSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={t("slideIndicator", { current: index + 1, total: defaultSlides.length })}
          />
        ))}
      </div>
    </div>
  );
}
