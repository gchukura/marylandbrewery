"use client";

import { useState } from 'react';
import Image from 'next/image';

interface BreweryPhotoGalleryProps {
  photos: string[];
  breweryName: string;
  className?: string;
}

export default function BreweryPhotoGallery({ 
  photos, 
  breweryName,
  className = '' 
}: BreweryPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  // Check if photo is external URL or local path
  const isExternalUrl = (path: string) => path.startsWith('http://') || path.startsWith('https://');

  const openLightbox = (photo: string, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  // Limit to 9 photos total (all same size)
  const displayPhotos = photos.slice(0, 9);

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (selectedIndex - 1 + displayPhotos.length) % displayPhotos.length
      : (selectedIndex + 1) % displayPhotos.length;
    setSelectedIndex(newIndex);
    setSelectedPhoto(displayPhotos[newIndex]);
  };

  return (
    <>
      <div className={`${className}`}>
        {/* Layout: 3x3 grid with smaller photos */}
        <div className="grid grid-cols-3 gap-2 max-w-xl">
          {displayPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative cursor-pointer group overflow-hidden shadow-sm hover:shadow-md transition-shadow aspect-square"
              onClick={() => openLightbox(photo, index)}
            >
              {isExternalUrl(photo) ? (
                <img
                  src={photo}
                  alt={`${breweryName} photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <Image
                  src={photo}
                  alt={`${breweryName} photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 33vw, 200px"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close"
          >
            ×
          </button>

          {/* Navigation buttons */}
          {displayPhotos.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-gray-300 z-10 w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto('prev');
                }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold hover:text-gray-300 z-10 w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto('next');
                }}
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}

          {/* Photo counter */}
          {displayPhotos.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm z-10 bg-black/50 px-3 py-1 rounded">
              {selectedIndex + 1} / {displayPhotos.length}
            </div>
          )}

          {/* Photo */}
          <div className="max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {isExternalUrl(selectedPhoto) ? (
              <img
                src={selectedPhoto}
                alt={`${breweryName} photo ${selectedIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <Image
                src={selectedPhoto}
                alt={`${breweryName} photo ${selectedIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain"
                unoptimized
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

