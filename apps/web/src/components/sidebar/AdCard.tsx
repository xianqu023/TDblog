"use client";

import React from "react";

interface AdCardProps {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  adCode?: string;
  adType?: "image" | "code" | "text";
  textContent?: string;
  className?: string;
}

/**
 * 侧边栏广告卡片组件
 * 支持图片广告、谷歌广告代码、文本广告三种类型
 */
export default function AdCard({
  title = "广告",
  imageUrl,
  linkUrl,
  adCode,
  adType = "image",
  textContent,
  className = "",
}: AdCardProps) {
  // 渲染图片广告
  const renderImageAd = () => {
    if (!imageUrl) return null;

    return (
      <div className="ad-image">
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
              loading="lazy"
            />
          </a>
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        )}
      </div>
    );
  };

  // 渲染谷歌广告代码
  const renderCodeAd = () => {
    if (!adCode) return null;

    return (
      <div
        className="ad-code"
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
    );
  };

  // 渲染文本广告
  const renderTextAd = () => {
    if (!textContent) return null;

    return (
      <div className="ad-text p-4 bg-gray-50 rounded-lg">
        {linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {textContent}
          </a>
        ) : (
          <p className="text-gray-700">{textContent}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`ad-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="ad-title px-4 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
      )}
      <div className="ad-content p-4">
        {adType === "image" && renderImageAd()}
        {adType === "code" && renderCodeAd()}
        {adType === "text" && renderTextAd()}
      </div>
    </div>
  );
}
