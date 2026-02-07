import React, { useState, useRef } from 'react';
import { Play } from 'lucide-react';

const ProductCardMedia: React.FC<{ imageUrl: string, videoUrl?: string, alt: string }> = ({ imageUrl, videoUrl, alt }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-900">
      <img 
        src={imageUrl} 
        alt={alt} 
        className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`} 
      />
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted loop playsInline
          className={`absolute inset-0 w-full h-full object-cover ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          onCanPlay={() => setIsPlaying(true)}
        />
      )}
    </div>
  );
};
export default ProductCardMedia;
