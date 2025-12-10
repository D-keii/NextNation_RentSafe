import { useState } from 'react';

interface PropertyImageCarouselProps {
  photos: string[];
  title: string;
  className?: string;
}

export function PropertyImageCarousel({ photos, title, className = '' }: PropertyImageCarouselProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className={`relative aspect-video rounded-xl overflow-hidden bg-muted ${className}`}>
        <img
          src="/placeholder.svg"
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video rounded-xl overflow-hidden bg-muted ${className}`}>
      <img
        src={photos[selectedImageIndex] || photos[0]}
        alt={title}
        className="h-full w-full object-cover"
      />
      
      {/* Thumbnail Previews */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all shadow-md hover:scale-105 ${
                selectedImageIndex === index
                  ? 'border-accent ring-2 ring-accent/50'
                  : 'border-transparent hover:border-accent/50'
              }`}
            >
              <img
                src={photo || '/placeholder.svg'}
                alt={`${title} - Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {selectedImageIndex === index && (
                <div className="absolute inset-0 bg-accent/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

