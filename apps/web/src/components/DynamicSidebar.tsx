"use client";

import { useMemo, useState, useEffect } from "react";
import { WidgetConfig, PageType, mergeWidgetSettings } from "@/lib/sidebar-config";
import BloggerCard from "@/components/sidebar/BloggerCard";
import PopularArticles from "@/components/sidebar/PopularArticles";
import TagCloud from "@/components/sidebar/TagCloud";
import AdCard from "@/components/sidebar/AdCard";
import CountdownCard from "@/components/sidebar/CountdownCard";
import WeatherCard from "@/components/sidebar/WeatherCard";

interface ArticleData {
  authorName?: string;
  authorAvatar?: string;
  relatedArticles?: Array<{
    id: string;
    slug: string;
    title: string;
    viewCount: number;
    coverImage?: string;
  }>;
}

interface BloggerInfo {
  name: string;
  avatar: string;
  bio: string;
}

interface DynamicSidebarProps {
  widgets: WidgetConfig[];
  pageType: PageType;
  articleData?: ArticleData;
}

export default function DynamicSidebar({ widgets, pageType, articleData }: DynamicSidebarProps) {
  const [bloggerInfo, setBloggerInfo] = useState<BloggerInfo | null>(null);

  // 从 API 获取博主信息
  useEffect(() => {
    const fetchBloggerInfo = async () => {
      try {
        const response = await fetch("/api/blogger-info");
        const data = await response.json();
        if (data.success) {
          setBloggerInfo(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch blogger info:", error);
      }
    };

    fetchBloggerInfo();
  }, []);

  // Filter enabled widgets and sort by order - use useMemo to prevent infinite re-renders
  const enabledWidgets = useMemo(
    () => widgets
      .filter((w) => w.enabled)
      .sort((a, b) => a.order - b.order),
    [widgets]
  );

  return (
    <div className="space-y-6">
      {enabledWidgets.map((widget) => {
        const settings = mergeWidgetSettings(widget.id, widget.settings);

        switch (widget.id) {
          case "blogger":
            return (
              <BloggerCard
                key={widget.id}
                name={
                  articleData?.authorName ||
                  bloggerInfo?.name ||
                  settings.name
                }
                avatar={
                  articleData?.authorAvatar ||
                  bloggerInfo?.avatar ||
                  settings.avatar
                }
                bio={bloggerInfo?.bio || settings.bio}
                articleCount={settings.articleCount}
                viewCount={settings.viewCount}
                followerCount={settings.followerCount}
              />
            );

          case "popular":
            return (
              <PopularArticles
                key={widget.id}
                articles={articleData?.relatedArticles}
                limit={settings.limit || 5}
              />
            );

          case "tags":
            return <TagCloud key={widget.id} />;

          case "ad":
            return (
              <AdCard
                key={widget.id}
                title={settings.title}
                description={settings.description}
                imageUrl={settings.imageUrl}
                linkUrl={settings.linkUrl}
              />
            );

          case "countdown": {
            // Stabilize targetDate to prevent infinite re-renders
            const stableTargetDate = useMemo(
              () => settings.targetDate ? new Date(settings.targetDate) : undefined,
              [settings.targetDate]
            );
            return (
              <CountdownCard
                key={widget.id}
                title={settings.title}
                description={settings.description}
                targetDate={stableTargetDate}
              />
            );
          }

          case "weather":
            return <WeatherCard key={widget.id} city={settings.city} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
