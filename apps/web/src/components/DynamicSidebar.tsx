"use client";

import { useMemo } from "react";
import { WidgetConfig, PageType, mergeWidgetSettings } from "@/lib/sidebar-config";
import AdCard from "@/components/sidebar/AdCard";

interface ArticleData {}

interface DynamicSidebarProps {
  widgets: WidgetConfig[];
  pageType: PageType;
  articleData?: ArticleData;
}

export default function DynamicSidebar({ widgets, pageType, articleData }: DynamicSidebarProps) {
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
          case "ad":
            return <AdCard key={widget.id} {...settings} />;
          
          // 其他组件暂时返回 null，等待后续实现
          default:
            // 暂时不渲染其他组件
            return null;
        }
      })}
    </div>
  );
}
