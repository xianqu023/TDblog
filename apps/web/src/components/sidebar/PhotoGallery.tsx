"use client";

import { motion } from "framer-motion";

interface PhotoGalleryProps {
  photos?: Array<{
    id: string;
    url: string;
    title: string;
  }>;
}

export default function PhotoGallery({ photos = [] }: PhotoGalleryProps) {
  const defaultPhotos = [
    { id: "1", url: "https://picsum.photos/200/150?random=1", title: "风景 1" },
    { id: "2", url: "https://picsum.photos/200/150?random=2", title: "风景 2" },
    { id: "3", url: "https://picsum.photos/200/150?random=3", title: "风景 3" },
    { id: "4", url: "https://picsum.photos/200/150?random=4", title: "风景 4" },
    { id: "5", url: "https://picsum.photos/200/150?random=5", title: "风景 5" },
    { id: "6", url: "https://picsum.photos/200/150?random=6", title: "风景 6" },
  ];

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--theme-surface)] rounded-[var(--theme-radius-card)] p-6 shadow-[var(--theme-card-shadow)]"
      suppressHydrationWarning
    >
      <h3 className="text-lg font-bold text-[var(--theme-text)] mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-[var(--theme-primary)] rounded-full"></span>
        图文相册
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {displayPhotos.map((photo) => (
          <div key={photo.id} className="relative group overflow-hidden rounded-lg">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {photo.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
