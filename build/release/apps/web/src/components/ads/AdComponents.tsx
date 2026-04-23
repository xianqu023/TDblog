"use client";

import { useState, useEffect, useRef } from "react";

// 广告位置类型
type AdPosition = "header" | "sidebar-top" | "sidebar-middle" | "sidebar-bottom" | "content-top" | "content-middle" | "content-bottom" | "footer";

// 广告数据接口
interface AdItem {
  id: string;
  position: AdPosition;
  type: "adsense" | "custom" | "image";
  isActive: boolean;
  config: {
    // AdSense配置
    clientId?: string;
    slotId?: string;
    format?: string;
    // 自定义广告
    title?: string;
    description?: string;
    // 图片广告
    imageUrl?: string;
    linkUrl?: string;
    altText?: string;
  };
}

// 默认广告配置
export const DEFAULT_AD_CONFIG: AdItem[] = [
  {
    id: "ad-content-top",
    position: "content-top",
    type: "custom",
    isActive: true,
    config: {
      title: "黄金广告位",
      description: "此位置可放置 Google AdSense 或自定义广告",
    },
  },
  {
    id: "ad-sidebar-top",
    position: "sidebar-top",
    type: "custom",
    isActive: true,
    config: {
      title: "侧边栏广告",
      description: "优质流量位",
    },
  },
  {
    id: "ad-content-middle",
    position: "content-middle",
    type: "adsense",
    isActive: false,
    config: {
      clientId: "ca-pub-xxxxxxxxxx",
      slotId: "1234567890",
      format: "auto",
    },
  },
];

// AdSense 广告组件
export const AdSenseUnit = ({
  clientId = "ca-pub-xxxxxxxxxx",
  slotId = "1234567890",
  format = "auto",
  className = "",
}: {
  clientId?: string;
  slotId?: string;
  format?: string;
  className?: string;
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (adRef.current && !initializedRef.current) {
      initializedRef.current = true;
      
      try {
        if (typeof window !== "undefined" && (window as any).adsbygoogle) {
          (window as any).adsbygoogle.push({});
        }
      } catch (e: any) {
        if (e?.message?.includes("already have ads")) {
          console.warn("AdSense: Ad already loaded for this slot, skipping duplicate push");
        } else {
          console.error("AdSense push error:", e);
        }
      }
    }

    return () => {
      initializedRef.current = false;
    };
  }, []);

  return (
    <div className={`ad-unit ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// 自定义广告组件
export const CustomAdUnit = ({
  title = "广告位招租",
  description = "联系我们投放广告",
  imageUrl,
  linkUrl,
  className = "",
}: {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  className?: string;
}) => {
  const content = (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100 text-center ${className}`}>
      <div className="text-3xl mb-2">📢</div>
      <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {imageUrl && (
        <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center overflow-hidden mb-3">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">广告图片</span>
          )}
        </div>
      )}
    </div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
};

// 图片广告组件
export const ImageAdUnit = ({
  imageUrl,
  linkUrl,
  altText = "广告",
  className = "",
}: {
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  className?: string;
}) => {
  if (!imageUrl) {
    return <CustomAdUnit className={className} />;
  }

  const content = (
    <div className={`rounded-xl overflow-hidden shadow-md ${className}`}>
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto"
        loading="lazy"
      />
    </div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
};

// 通用广告渲染器
export const AdRenderer = ({ ad, className = "" }: { ad: AdItem; className?: string }) => {
  if (!ad.isActive) return null;

  switch (ad.type) {
    case "adsense":
      return (
        <AdSenseUnit
          clientId={ad.config.clientId}
          slotId={ad.config.slotId}
          format={ad.config.format}
          className={className}
        />
      );
    case "custom":
      return (
        <CustomAdUnit
          title={ad.config.title}
          description={ad.config.description}
          className={className}
        />
      );
    case "image":
      return (
        <ImageAdUnit
          imageUrl={ad.config.imageUrl}
          linkUrl={ad.config.linkUrl}
          altText={ad.config.altText}
          className={className}
        />
      );
    default:
      return null;
  }
};

// 广告管理面板（管理员用）
export const AdManagerPanel = ({
  ads = DEFAULT_AD_CONFIG,
  onUpdate,
}: {
  ads?: AdItem[];
  onUpdate?: (ads: AdItem[]) => void;
}) => {
  const [adList, setAdList] = useState<AdItem[]>(ads);

  const handleToggle = (id: string) => {
    const updated = adList.map((ad) =>
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    );
    setAdList(updated);
    onUpdate?.(updated);
  };

  const positions: { key: AdPosition; label: string }[] = [
    { key: "header", label: "页头广告" },
    { key: "sidebar-top", label: "侧边栏顶部" },
    { key: "sidebar-middle", label: "侧边栏中部" },
    { key: "sidebar-bottom", label: "侧边栏底部" },
    { key: "content-top", label: "内容顶部" },
    { key: "content-middle", label: "内容中部" },
    { key: "content-bottom", label: "内容底部" },
    { key: "footer", label: "页脚广告" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-3">📢</span>
        广告位管理
      </h3>

      <div className="space-y-4">
        {positions.map((pos) => {
          const ad = adList.find((a) => a.position === pos.key);
          return (
            <div key={pos.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">{pos.label}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    类型: {ad?.type === "adsense" ? "Google AdSense" : ad?.type === "image" ? "图片广告" : "自定义广告"}
                  </span>
                  <button
                    onClick={() => handleToggle(ad?.id || "")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      ad?.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ad?.isActive ? "已启用" : "已禁用"}
                  </button>
                </div>
              </div>
              {ad?.config.title && (
                <p className="text-sm text-gray-600">
                  {ad.config.title}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 便捷广告渲染器 - 根据位置自动渲染
export const AdByPosition = ({
  position,
  ads = DEFAULT_AD_CONFIG,
  className = "",
}: {
  position: AdPosition;
  ads?: AdItem[];
  className?: string;
}) => {
  const ad = ads.find((a) => a.position === position);
  if (!ad || !ad.isActive) return null;
  return <AdRenderer ad={ad} className={className} />;
};

// 预定义广告组合 - 用于文章页面
export const ArticleAdUnits = ({
  ads = DEFAULT_AD_CONFIG,
  className = "",
}: {
  ads?: AdItem[];
  className?: string;
}) => (
  <div className={`article-ad-units ${className}`}>
    <AdByPosition position="content-top" ads={ads} className="mb-6" />
    <AdByPosition position="content-middle" ads={ads} className="my-8" />
    <AdByPosition position="content-bottom" ads={ads} className="mt-6" />
  </div>
);

// 预定义广告组合 - 用于首页
export const HomeAdUnits = ({
  ads = DEFAULT_AD_CONFIG,
  className = "",
}: {
  ads?: AdItem[];
  className?: string;
}) => (
  <div className={`home-ad-units ${className}`}>
    <AdByPosition position="content-top" ads={ads} className="mb-8" />
    <AdByPosition position="content-middle" ads={ads} className="my-10" />
  </div>
);

// 预定义广告组合 - 用于侧边栏
export const SidebarAdUnits = ({
  ads = DEFAULT_AD_CONFIG,
  className = "",
}: {
  ads?: AdItem[];
  className?: string;
}) => (
  <div className={`sidebar-ad-units ${className} space-y-6`}>
    <AdByPosition position="sidebar-top" ads={ads} />
    <AdByPosition position="sidebar-middle" ads={ads} />
    <AdByPosition position="sidebar-bottom" ads={ads} />
  </div>
);
