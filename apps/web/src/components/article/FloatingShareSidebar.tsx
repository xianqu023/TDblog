"use client";

import { useState } from "react";
import { Share2, X, Link as LinkIcon, QrCode, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaRedditAlien,
  FaWhatsapp,
  FaTelegramPlane,
  FaWeibo,
  FaQq,
  FaWeixin,
} from "react-icons/fa";
import { SiX, SiThreads } from "react-icons/si";

interface FloatingShareSidebarProps {
  title: string;
  url: string;
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  shareUrl: (url: string, title: string) => string;
}

export default function FloatingShareSidebar({
  title,
  url,
}: FloatingShareSidebarProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platforms: SharePlatform[] = [
    {
      name: "X (Twitter)",
      icon: <SiX size={18} />,
      color: "#fff",
      bgColor: "#000",
      shareUrl: (url, title) =>
        `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Facebook",
      icon: <FaFacebookF size={18} />,
      color: "#fff",
      bgColor: "#1877F2",
      shareUrl: (url) =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "微博",
      icon: <FaWeibo size={20} />,
      color: "#fff",
      bgColor: "#E6162D",
      shareUrl: (url, title) =>
        `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: "微信",
      icon: <FaWeixin size={20} />,
      color: "#fff",
      bgColor: "#07C160",
      shareUrl: () => {
        setShowQR(true);
        return "#";
      },
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={18} />,
      color: "#fff",
      bgColor: "#0A66C2",
      shareUrl: (url) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Reddit",
      icon: <FaRedditAlien size={20} />,
      color: "#fff",
      bgColor: "#FF4500",
      shareUrl: (url, title) =>
        `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={20} />,
      color: "#fff",
      bgColor: "#25D366",
      shareUrl: (url, title) =>
        `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: <FaTelegramPlane size={18} />,
      color: "#fff",
      bgColor: "#0088CC",
      shareUrl: (url) => `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Threads",
      icon: <SiThreads size={18} />,
      color: "#fff",
      bgColor: "#000",
      shareUrl: (url) => `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "QQ",
      icon: <FaQq size={18} />,
      color: "#fff",
      bgColor: "#12B7F5",
      shareUrl: (url, title) =>
        `https://connect.qq.com/share?url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  const mainPlatforms = platforms.slice(0, 4);
  const morePlatforms = platforms.slice(4);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: SharePlatform) => {
    const shareUrl = platform.shareUrl(url, title);
    if (shareUrl !== "#") {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;

  return (
    <>
      {/* Floating Share Bar - Sticky to article content */}
      <div className="sticky top-24 float-left -ml-[100px] z-30">
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl border border-gray-100 py-4 px-2 w-14">
          {/* Share Header */}
          <div className="mb-3 pb-3 border-b border-gray-100 w-full flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Share2 size={18} className="text-white" />
            </div>
          </div>

          {/* Main Platforms - Colored circles */}
          <div className="flex flex-col gap-3 w-full">
            {mainPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className="w-full flex justify-center group relative"
                title={platform.name}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  style={{ 
                    backgroundColor: platform.bgColor,
                    color: platform.color 
                  }}
                >
                  {platform.icon}
                </div>
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-10 mt-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
            title={expanded ? "收起" : "更多"}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* More Platforms */}
          {expanded && (
            <div className="flex flex-col gap-3 w-full mt-3">
              {morePlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className="w-full flex justify-center group relative"
                  title={platform.name}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    style={{ 
                      backgroundColor: platform.bgColor,
                      color: platform.color 
                    }}
                  >
                    {platform.icon}
                  </div>
                  <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-4 w-full border-t border-gray-100" />

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex justify-center group relative"
            title="复制链接"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              {copied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <LinkIcon size={18} className="text-gray-600" />
              )}
            </div>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {copied ? "已复制" : "复制链接"}
            </span>
          </button>

          {/* QR Code */}
          <button
            onClick={() => setShowQR(true)}
            className="w-full flex justify-center group relative mt-3"
            title="二维码"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <QrCode size={18} className="text-gray-600" />
            </div>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              二维码
            </span>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                扫码在手机查看
              </h3>
              <button
                onClick={() => setShowQR(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border mb-4 flex justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>

            <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
              {title}
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FaWeixin size={16} />
                <span>打开微信，点击右上角 "+" {"→"} "扫一扫"</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                扫描二维码后可在微信中分享文章
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
