import Image from 'next/image';
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes = '100vw',
  fill = false,
  onLoad,
  onError,
  objectFit = 'cover'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle image loading
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Fallback for error state
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${fill ? `object-${objectFit}` : ''}`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={fill ? { objectFit } : undefined}
      />
    </div>
  );
}

// Preset configurations for common image types
export const ImagePresets = {
  hero: {
    quality: 75,
    priority: true,
    sizes: '100vw'
  },
  logo: {
    quality: 80,
    priority: true,
    sizes: '(max-width: 768px) 48px, 64px'
  },
  thumbnail: {
    quality: 60,
    priority: false,
    sizes: '(max-width: 768px) 150px, 200px'
  },
  gallery: {
    quality: 70,
    priority: false,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
  },
  blog: {
    quality: 65,
    priority: false,
    sizes: '(max-width: 768px) 100vw, 800px'
  }
};

// Helper component for responsive images with multiple sources
interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2';
  preset?: keyof typeof ImagePresets;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = '16/9',
  preset = 'gallery',
  className = '',
  objectFit = 'cover'
}: ResponsiveImageProps) {
  const aspectRatios = {
    'square': 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]'
  };

  return (
    <div className={`relative ${aspectRatios[aspectRatio]} ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        {...ImagePresets[preset]}
        objectFit={objectFit}
      />
    </div>
  );
}