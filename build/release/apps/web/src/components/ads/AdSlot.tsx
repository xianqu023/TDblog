"use client";

import { motion } from "framer-motion";

interface AdSlotProps {
  position: string;
  config: {
    enabled: boolean;
    type: 'adsense' | 'image' | 'custom';
    adCode?: string;
    imageUrl?: string;
    linkUrl?: string;
    altText?: string;
    size: string;
  };
}

export default function AdSlot({ position, config }: AdSlotProps) {
  if (!config.enabled) return null;

  const renderAdContent = () => {
    switch (config.type) {
      case 'adsense':
        // AdSense 代码渲染
        if (config.adCode) {
          return (
            <div 
              className="ad-code"
              dangerouslySetInnerHTML={{ __html: config.adCode }}
            />
          );
        }
        // AdSense 占位符
        return (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">Google AdSense</div>
              <div className="text-xs text-gray-400">广告位：{position}</div>
            </div>
          </div>
        );
      
      case 'image':
        if (config.imageUrl) {
          return (
            <a href={config.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
              <img
                src={config.imageUrl}
                alt={config.altText || 'Advertisement'}
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
          );
        }
        return null;
      
      case 'custom':
        if (config.adCode) {
          return (
            <div 
              dangerouslySetInnerHTML={{ __html: config.adCode }}
            />
          );
        }
        return null;
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="ad-slot my-6"
      data-ad-position={position}
      suppressHydrationWarning
    >
      <div className="w-full overflow-hidden rounded-lg bg-gray-50">
        {renderAdContent()}
      </div>
    </motion.div>
  );
}
