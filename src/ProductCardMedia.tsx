import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCw, Loader2, AlertTriangle } from 'lucide-react';

interface ProductCardMediaProps {
  imageUrl: string;
  videoUrl?: string;
  alt: string;
  className?: string;
}

const ProductCardMedia: React.FC<ProductCardMediaProps> = ({ imageUrl, videoUrl, alt, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const hoverTimeout = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoError) return;
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current);
    setIsHovered(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (isHovered && videoUrl && videoRef.current && !videoError) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Silently handle browser play prevention
          setIsPlaying(false);
        });
      }
    }
  }, [isHovered, videoUrl, videoError]);

  const handleVideoError = () => {
    // Silent fallback to static image without spamming console as requested
    setVideoError(true);
    setIsPlaying(false);
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden bg-zinc-900 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static Image - Stays visible until video is actually playing */}
      <img 
        src={imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
        alt={alt} 
        className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'opacity-0 scale-110 blur-sm' : 'opacity-100 scale-100'}`} 
      />

      {/* Video Layer */}
      {videoUrl && !videoError && (
        <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-cover scale-105"
          />
          
          {/* Live Preview Indicator */}
          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-2xl">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">360° Preview</span>
          </div>
        </div>
      )}

      {/* Luxury Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
};

export default ProductCardMedia;
