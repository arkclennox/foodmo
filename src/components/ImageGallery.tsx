'use client';

import React, { useState, useEffect } from 'react';

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mencegah scroll pada body saat lightbox terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 6);
  const remainingCount = images.length - 6;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {displayImages.map((src, idx) => {
          const isLast = idx === 5;
          const showOverlay = isLast && remainingCount > 0;

          return (
            <div 
              key={`${src}-${idx}`} 
              className="relative aspect-square w-full cursor-pointer group overflow-hidden rounded-lg"
              onClick={() => openLightbox(idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} - foto ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {showOverlay && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-3xl font-medium text-white">+{remainingCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 md:p-8"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-5xl flex items-center justify-center flex-1 h-full">
            {images.length > 1 && (
              <button 
                className="absolute left-0 md:left-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-10"
                onClick={prevImage}
                aria-label="Sebelumnya"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentIndex]}
              alt={`${title} - foto ${currentIndex + 1} dari ${images.length}`}
              className="max-h-full max-w-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <button 
                className="absolute right-0 md:right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-10"
                onClick={nextImage}
                aria-label="Selanjutnya"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="absolute bottom-6 text-white text-sm font-medium tracking-wide bg-black/50 px-4 py-1.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
