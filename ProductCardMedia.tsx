import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, RotateCw, Loader2, AlertTriangle, Sparkles, Share2, 
  ZoomIn, ZoomOut, Maximize2, Download, MousePointer2 
} from 'lucide-react';

interface ProductCardMediaProps {
  imageUrl: string;
  videoUrl?: string;
  alt: string;
  className?: string;
}

const ProductCardMedia: React.FC<ProductCardMediaProps> = ({ 
  imageUrl, 
  videoUrl, 
  alt, 
  className = "" 
}) => {
  const fallbackImage = 'https://via.placeholder.com/600x800?text=AK+Modern+Boutique';
  const finalImageUrl = imageUrl && imageUrl.trim() !== "" ? imageUrl : fallbackImage;

  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  
  const [zoomScale, setZoomScale] = useState(1);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(); 

  const updateTilt = useCallback((x: number, y: number, rect: DOMRect) => {
    // تعطيل تأثير الإمالة على الموبايل لتجنب مشاكل اللمس
    if (window.innerWidth < 768) return;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(() => {
      setRotate({ x: rotateX, y: rotateY });
    });
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isZoomMode) {
      if (!isDragging) return;
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateTilt(x, y, rect);
      setIsHovered(true);
    }
  };

  const handlePointerLeave = () => {
    if (!isZoomMode) {
      setRotate({ x: 0, y: 0 });
      setIsHovered(false);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
    setIsDragging(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomMode) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      setIsZoomMode(false);
    } else {
      setZoomScale(1.8); 
      setIsZoomMode(true);
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isZoomMode) return;
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomScale(prev => Math.min(Math.max(prev + delta, 1), 4));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isZoomMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handleSecureDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(finalImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AK-Elite-Atelier-${alt.replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.open(finalImageUrl, '_blank');
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: alt, url: window.location.href });
      } catch (err) { console.log(err); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Neural Link Copied.");
    }
  };

  useEffect(() => {
    if (isHovered && videoUrl && videoRef.current && !videoError && !isZoomMode) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [isHovered, videoUrl, videoError, isZoomMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden perspective-[1500px] bg-zinc-50 cursor-crosshair select-none rounded-[2rem] md:rounded-[4rem] ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerUp={(e) => {
          setIsDragging(false);
          if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
      }}
      style={{ touchAction: isZoomMode ? 'none' : 'auto' }}
    >
      {/* طبقة المسح الرقمي لوضع الزووم */}
      {isZoomMode && (
        <div className="absolute inset-0 pointer-events-none z-50 rounded-[2rem] md:rounded-[4rem]">
          <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay" />
          <div className="w-full h-[2px] md:h-[3px] bg-red-500/60 absolute top-0 animate-scan-line shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
        </div>
      )}

      {/* أدوات التحكم العلوية - تم ضبط الأحجام للموبايل */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex flex-col gap-2 md:gap-4 z-[60] animate-in slide-in-from-right-10 duration-500">
        <button onClick={handleShare} className="p-2.5 md:p-4 bg-white/90 backdrop-blur-3xl text-black rounded-xl md:rounded-2xl shadow-2xl border border-white/20 hover:bg-red-600 hover:text-white transition-all active:scale-90">
          <Share2 size={18} className="md:w-5 md:h-5" />
        </button>
        <button onClick={handleFullscreen} className="hidden md:flex p-4 bg-white/90 backdrop-blur-3xl text-black rounded-2xl shadow-2xl border border-white/20 hover:bg-black hover:text-white transition-all active:scale-90">
          <Maximize2 size={20} />
        </button>
        <button onClick={handleSecureDownload} className="p-2.5 md:p-4 bg-white/90 backdrop-blur-3xl text-black rounded-xl md:rounded-2xl shadow-2xl border border-white/20 hover:bg-black hover:text-white transition-all active:scale-90">
          <Download size={18} className="md:w-5 md:h-5" />
        </button>
        <button onClick={toggleZoom} className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-2xl border transition-all active:scale-90 ${isZoomMode ? 'bg-red-600 text-white border-red-500' : 'bg-white/90 text-black border-white/20'}`}>
          {isZoomMode ? <ZoomOut size={18} className="md:w-5 md:h-5" /> : <ZoomIn size={18} className="md:w-5 md:h-5" />}
        </button>
      </div>

      {/* طبقة المحتوى الرئيسي المتفاعل */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out preserve-3d"
        style={{
          transform: isZoomMode 
            ? `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)` 
            : `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* الصورة الخلفية (Blur Layer) */}
        <img
          src={finalImageUrl}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover rounded-[1.5rem] md:rounded-[3rem] transition-all duration-1000 ${
            (isHovered && !isZoomMode) ? 'blur-2xl opacity-30 scale-125' : 'opacity-100 scale-100'
          }`}
          draggable={false}
        />

        {/* صورة المنتج الحادة (Main Layer) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 translate-z-[60px] ${(isHovered && !isZoomMode) ? 'scale-110' : 'scale-100'}`}>
          <img
            src={finalImageUrl}
            alt={alt}
            className="w-[85%] h-[85%] md:w-[92%] md:h-[92%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            draggable={false}
          />
        </div>

        {/* طبقة الفيديو */}
        {videoUrl && !videoError && !isZoomMode && (
          <div className={`absolute inset-0 transition-opacity duration-1000 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden translate-z-[20px] ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <video
              ref={videoRef}
              src={videoUrl}
              muted loop playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* أيقونة التشغيل المركزية */}
        {videoUrl && !isPlaying && !isZoomMode && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none translate-z-[100px]">
             <div className="bg-black/60 backdrop-blur-xl p-4 md:p-8 rounded-full text-white animate-pulse border border-white/20 shadow-3xl">
                <Play size={32} className="md:w-12 md:h-12" fill="currentColor" />
             </div>
          </div>
        )}

        {/* شارات الأرشفة - تم تعديل التموضع للموبايل */}
        {!isZoomMode && (
          <>
            <div className="absolute top-6 md:top-10 left-6 md:left-10 z-20" style={{ transform: `translateZ(120px)` }}>
              <div className="bg-red-600 text-white text-[7px] md:text-[9px] font-black uppercase px-4 md:px-8 py-2 md:py-3 rounded-full shadow-3xl border border-red-500/50 backdrop-blur-md tracking-[0.2em] md:tracking-[0.3em]">NEURAL ARCHIVE</div>
            </div>
            
            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 z-20" style={{ transform: `translateZ(150px)` }}>
               <div className="bg-white/90 backdrop-blur-2xl p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-3xl border border-white/20 animate-bounce duration-[3000ms]">
                  <Sparkles size={18} className="md:w-6 md:h-6 text-red-600 animate-pulse" />
               </div>
            </div>
          </>
        )}
      </div>

      {/* واجهة المسح الرقمي (Hint) - تم تصغير النص للموبايل */}
      {!isZoomMode && !isHovered && (
         <div className="absolute inset-x-0 bottom-6 md:bottom-12 flex justify-center pointer-events-none z-30">
            <div className="bg-black/40 backdrop-blur-2xl px-5 md:px-8 py-2 md:py-3 rounded-full text-[6px] md:text-[8px] font-black text-white/80 uppercase tracking-[0.4em] md:tracking-[0.6em] border border-white/10 shadow-3xl animate-pulse text-center mx-4">
                Neural Scan Interface Ready
            </div>
         </div>
      )}
    </div>
  );
};

export default ProductCardMedia;