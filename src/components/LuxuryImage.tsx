import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

function isSafeImageSrc(src: string): boolean {
  if (typeof src !== 'string') return false;
  // Local static asset images
  if (src.startsWith('/images/') && !src.includes('..')) return true;
  // Safe client uploads (data:image/jpeg, png, webp, avif)
  if (
    src.startsWith('data:image/jpeg;base64,') ||
    src.startsWith('data:image/png;base64,') ||
    src.startsWith('data:image/webp;base64,') ||
    src.startsWith('data:image/avif;base64,') ||
    src.startsWith('blob:')
  ) {
    return true;
  }
  // Official Sanity CDN or safe external images (https / http)
  try {
    const url = new URL(src);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      !url.hostname.includes('javascript:')
    );
  } catch {
    return false;
  }
}

export const LuxuryImage: React.FC<LuxuryImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !isSafeImageSrc(src)) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE6] to-[#EAE0D2] text-[#8C6239] p-6 text-center ${className}`}
      >
        <Sparkles className="w-7 h-7 opacity-70 mb-2" />
        {fallbackLabel && (
          <span className="font-serif-editorial text-lg tracking-wide text-[#1E150F]">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
