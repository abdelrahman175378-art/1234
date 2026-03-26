import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useApp } from '../AppContext';
import { 
  Sparkles, Wand2, Loader2, Trash2, ArrowLeft, Scissors, AlertCircle, Zap, Camera, Film, Volume2, Play, Download, FileVideo, Search, Video, Scan, CheckCircle2, RefreshCcw
} from 'lucide-react';
import { Product } from '../types';
import { COLOR_MAP } from '../constants';

interface AIStudioProps {
  preselectedProduct?: Product | null;
  preselectedImage?: string | null;
  preselectedColor?: string | null;
  preselectedSize?: string | null;
  onClearPreselected?: () => void;
  onBack?: () => void;
}

const RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
];

const QUALITIES = [
  { label: 'Standard (1K)', value: '1K' },
  { label: 'High (2K)', value: '2K' },
  { label: 'Ultra (4K)', value: '4K' },
];

type StudioTab = 'prova' | 'generate' | 'animate' | 'edit' | 'analyze' | 'speech';

const AIStudioView: React.FC<AIStudioProps> = ({ 
  preselectedProduct, 
  preselectedColor, 
  preselectedImage, 
  preselectedSize,
  onBack 
}) => {
  const { language } = useApp();
  const isAr = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<StudioTab>(preselectedProduct ? 'prova' : 'generate');
  const [provaMode, setProvaMode] = useState<'upload' | 'live'>('upload');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{ type: 'image' | 'text' | 'video' | 'audio', data: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedQuality, setSelectedQuality] = useState('1K');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userVideo, setUserVideo] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadingSteps = isAr 
    ? ['تحليل البيانات...', 'توليد الموديل...', 'اللمسات النهائية...']
    : ['Syncing Neural Grid...', 'Processing Modality...', 'Refining Atelier Output...'];

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => setLoadingStep(prev => (prev + 1) % loadingSteps.length), 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (provaMode === 'live' && activeTab === 'prova') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [provaMode, activeTab]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setErrorMsg("Camera access denied. Live AR unavailable.");
      setProvaMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const captureFrame = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.9);
      }
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setUserVideo(file);
        setUserImage(null);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setUserImage(reader.result as string);
        reader.readAsDataURL(file);
        setUserVideo(null);
      }
    }
  };

  const getBase64 = async (imageSrc: string): Promise<{ data: string, mimeType: string }> => {
    if (imageSrc.startsWith('data:')) {
      const [header, data] = imageSrc.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      return { data, mimeType };
    }
    const response = await fetch(imageSrc);
    const blob = (await response.blob()) as any as globalThis.Blob;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ data: (reader.result as string).split(',')[1], mimeType: blob.type });
      reader.readAsDataURL(blob);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleAction = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (activeTab === 'prova') {
        const sourceImage = provaMode === 'live' ? captureFrame() : userImage;
        if (!sourceImage || !preselectedProduct) {
          setErrorMsg("Source image and product selection required.");
          setLoading(false);
          return;
        }

        const customerImg = await getBase64(sourceImage);
        const productImg = await getBase64(preselectedImage || preselectedProduct.images[0]);
        const colorHex = preselectedColor ? (COLOR_MAP[preselectedColor] || preselectedColor) : 'original color';
        
        const professionalPrompt = `
          ULTRA-PROFESSIONAL NEURAL FITTING SESSION
          Product: ${preselectedProduct.nameEn}
          Selected Color: ${preselectedColor} (${colorHex})
          Target Size: ${preselectedSize}
          COMMAND: Generate a highly realistic virtual try-on preview. Simulate the product directly on the person.
          REQUIREMENTS: Perfect alignment, realistic fabric texture, natural lighting. Preserve identity face perfectly.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [
            { inlineData: { data: customerImg.data, mimeType: customerImg.mimeType } },
            { inlineData: { data: productImg.data, mimeType: productImg.mimeType } },
            { text: professionalPrompt }
          ]}
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) setResult({ type: 'image', data: `data:image/png;base64,${part.inlineData.data}` });
      }
      else if (activeTab === 'generate') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: `Professional high-luxury fashion editorial photography of ${prompt}. Clean minimalist background, cinematic lighting, 8k resolution.` }] },
          config: { 
            imageConfig: { aspectRatio: selectedRatio as any, imageSize: selectedQuality as any } 
          }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) setResult({ type: 'image', data: `data:image/png;base64,${part.inlineData.data}` });
      }
      else if (activeTab === 'animate') {
        const imgData = userImage ? await getBase64(userImage) : null;
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt || 'Cinematic luxury fashion rotation, slow motion, high quality',
          image: imgData ? { imageBytes: imgData.data, mimeType: imgData.mimeType } : undefined,
          config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: selectedRatio === '9:16' ? '9:16' : '16:9' }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation });
        }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = (await videoResponse.blob()) as any as globalThis.Blob;
        setResult({ type: 'video', data: URL.createObjectURL(videoBlob) });
      }
      else if (activeTab === 'edit') {
        if (!userImage || !prompt) return;
        const imgData = await getBase64(userImage);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [
            { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
            { text: `Refine Request: ${prompt}. COMMAND: image_edit_auto.` }
          ]}
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) setResult({ type: 'image', data: `data:image/png;base64,${part.inlineData.data}` });
      }
      else if (activeTab === 'analyze') {
        if (!userImage && !userVideo) return;
        const parts = [];
        if (userImage) {
          const imgData = await getBase64(userImage);
          parts.push({ inlineData: { data: imgData.data, mimeType: imgData.mimeType } });
        } else if (userVideo) {
          const vidData = await fileToBase64(userVideo);
          parts.push({ inlineData: { data: vidData, mimeType: userVideo.type } });
        }
        parts.push({ text: "Detail the fashion construction and fabric quality." });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: { parts }
        });
        setResult({ type: 'text', data: response.text || "" });
      }
      else if (activeTab === 'speech') {
        if (!prompt) return;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Say with luxury tone: ${prompt}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
          const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.start();
          setResult({ type: 'audio', data: 'Vocal output generated.' });
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "AI Studio Logic Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-screen text-start overflow-x-hidden">
      <canvas ref={canvasRef} className="hidden" />
      <header className="mb-8 md:mb-12 text-center">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-all mx-auto bg-gray-50 px-5 md:px-6 py-2 rounded-full border shadow-sm active:scale-95">
          <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} /> {isAr ? 'العودة للمتجر' : 'BACK TO STORE'}
        </button>
        <h1 className="text-4xl md:text-7xl font-[1000] tracking-tighter mb-4 uppercase italic">AK Studio<span className="text-red-600">.</span></h1>
        
        {/* Navigation Tabs - Mobile Optimized */}
        <div className="flex flex-wrap justify-center bg-black/5 backdrop-blur-md p-1.5 md:p-2 rounded-2xl md:rounded-full w-full md:w-fit mx-auto mt-6 md:mt-8 border gap-1">
          {[
            { id: 'prova', label: isAr ? 'قياس (AR)' : 'Prova (AR)', icon: <Scissors size={14}/> },
            { id: 'generate', label: isAr ? 'توليد' : 'Create', icon: <Sparkles size={14}/> },
            { id: 'animate', label: isAr ? 'تحريك' : 'Veo Video', icon: <Film size={14}/> },
            { id: 'edit', label: isAr ? 'تعديل' : 'Refine', icon: <Wand2 size={14}/> },
            { id: 'analyze', label: isAr ? 'تحليل' : 'Analyze', icon: <Search size={14}/> },
            { id: 'speech', label: isAr ? 'صوت' : 'Voice', icon: <Volume2 size={14}/> }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id as StudioTab); setResult(null); }} 
              className={`flex items-center gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 ${activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {errorMsg && (
        <div className="max-w-2xl mx-auto mb-8 bg-red-50 p-5 md:p-6 rounded-2xl md:rounded-3xl text-red-600 flex items-center gap-3 border border-red-100 shadow-sm animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" /> <p className="text-xs md:text-sm font-bold leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Input Calibration Panel */}
        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[4rem] shadow-2xl border border-gray-100 space-y-8 md:space-y-10">
            {activeTab === 'prova' && preselectedProduct && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-6 border shadow-inner">
                      <img src={preselectedImage || preselectedProduct.images[0]} className="w-16 h-20 md:w-20 md:h-24 object-cover rounded-xl md:rounded-2xl shadow-md border-2 border-white shrink-0" alt="Product" />
                      <div className="min-w-0">
                          <h4 className="text-lg md:text-xl font-[1000] uppercase tracking-tighter truncate leading-none mb-2">{preselectedProduct.nameEn}</h4>
                          <div className="flex flex-wrap gap-2">
                              <span className="text-[7px] md:text-[8px] font-black bg-white px-2.5 py-1.5 rounded-full border uppercase tracking-widest shadow-sm">COLOR: {preselectedColor}</span>
                              <span className="text-[7px] md:text-[8px] font-black bg-white px-2.5 py-1.5 rounded-full border uppercase tracking-widest shadow-sm">SIZE: {preselectedSize}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex bg-gray-100 p-1 rounded-xl md:rounded-2xl">
                    <button onClick={() => setProvaMode('upload')} className={`flex-1 py-3.5 md:py-4 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${provaMode === 'upload' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}>
                      <Camera size={14}/> {isAr ? 'رفع صورة' : 'Upload Photo'}
                    </button>
                    <button onClick={() => setProvaMode('live')} className={`flex-1 py-3.5 md:py-4 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${provaMode === 'live' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}>
                      <Video size={14}/> {isAr ? 'بث حي (AR)' : 'Neural Live AR'}
                    </button>
                  </div>
                </div>
            )}

            <div className="space-y-6">
              {(activeTab === 'prova' || activeTab === 'animate' || activeTab === 'edit' || activeTab === 'analyze') && (
                <div className="relative aspect-[4/3] md:aspect-video bg-gray-50 rounded-2xl md:rounded-[2.5rem] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-black/10 shadow-inner group">
                  {activeTab === 'prova' && provaMode === 'live' ? (
                    <div className="relative w-full h-full bg-zinc-900">
                       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale brightness-110" />
                       <div className="absolute inset-0 border-t-8 border-red-600 animate-scan pointer-events-none opacity-50 shadow-[0_0_20px_#dc2626]" />
                       <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse z-10">
                         <Scan size={12} /> Neural Grid Active
                       </div>
                    </div>
                  ) : userImage ? (
                    <div className="relative w-full h-full">
                      <img src={userImage} className="w-full h-full object-cover" alt="User upload" />
                      <button onClick={() => setUserImage(null)} className="absolute top-3 right-3 md:top-4 md:right-4 bg-white p-2 rounded-lg md:rounded-xl text-red-500 shadow-xl hover:bg-red-50 transition-colors active:scale-75"><Trash2 size={18}/></button>
                    </div>
                  ) : userVideo ? (
                    <div className="flex flex-col items-center p-6 text-center">
                      <FileVideo size={36} className="text-red-600 mb-3" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-zinc-400 truncate max-w-[200px]">{userVideo.name}</p>
                      <button onClick={() => setUserVideo(null)} className="mt-3 text-[8px] font-black text-red-600 uppercase underline tracking-widest active:opacity-50">Change Video</button>
                    </div>
                  ) : (
                    <div className="text-center p-8 md:p-12 cursor-pointer relative w-full h-full flex flex-col items-center justify-center group-hover:bg-gray-100/50 transition-all">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg mb-4 text-zinc-300 group-hover:text-black transition-colors group-hover:rotate-12">
                        <Camera size={32} />
                      </div>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors">{isAr ? 'اختر الوسائط' : 'Select Media Registry'}</p>
                      <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'generate' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block italic px-1">Calibrate Quality</label>
                    <div className="grid grid-cols-3 gap-2">
                      {QUALITIES.map(q => (
                        <button key={q.value} onClick={() => setSelectedQuality(q.value)} className={`py-3 md:py-3.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black border-2 transition-all active:scale-95 ${selectedQuality === q.value ? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-gray-50 border-transparent text-zinc-400 hover:border-zinc-200'}`}>{q.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'generate' || activeTab === 'animate') && (
                <div className="animate-in slide-in-from-bottom-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block italic px-1">Aspect Ratio Matrix</label>
                  <div className="grid grid-cols-5 gap-2">
                    {RATIOS.map(r => (
                      <button key={r.value} onClick={() => setSelectedRatio(r.value)} className={`py-3 md:py-3.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black border-2 transition-all active:scale-95 ${selectedRatio === r.value ? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-gray-50 border-transparent text-zinc-400 hover:border-zinc-200'}`}>{r.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab !== 'prova' && activeTab !== 'analyze') && (
                <div className="animate-in slide-in-from-bottom-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block italic px-1">{isAr ? 'حقن الأوامر' : 'Prompt Injection'}</label>
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder={activeTab === 'speech' ? "Enter text for vocal synthesis..." : "Describe your haute couture vision in detail..."} 
                    className="w-full bg-gray-50 rounded-2xl md:rounded-[2rem] p-5 md:p-6 h-32 md:h-40 text-xs md:text-sm font-bold border-none shadow-inner resize-none focus:ring-2 focus:ring-black outline-none transition-all placeholder:opacity-30 leading-relaxed text-black" 
                  />
                </div>
              )}
            </div>

            <button disabled={loading} onClick={handleAction} className="w-full bg-black text-white py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-base md:text-xl flex items-center justify-center gap-3 md:gap-4 transition-all hover:bg-zinc-900 shadow-2xl disabled:opacity-30 active:scale-[0.98] group/initiate">
                {loading ? <Loader2 className="animate-spin md:w-6 md:h-6" /> : <Zap className="text-red-600 md:w-6 md:h-6 group-hover/initiate:scale-110 transition-transform" fill="currentColor" />}
                <span className="uppercase tracking-[0.2em] md:tracking-widest">{loading ? loadingSteps[loadingStep] : (activeTab === 'prova' && provaMode === 'live' ? 'Capture & Fit AR' : 'Initiate Neural Session')}</span>
            </button>
        </div>

        {/* Neural Output Window */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-3xl md:rounded-[4rem] shadow-inner border border-gray-100 min-h-[400px] md:min-h-[500px] flex items-center justify-center relative overflow-hidden group/output">
          {loading ? (
            <div className="text-center p-12 md:p-20 bg-white/60 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-700 relative z-10">
              <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 md:mb-8">
                <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-lg" />
                <Sparkles className="absolute inset-0 m-auto text-red-600 animate-pulse" size={24} />
              </div>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-400 mb-4">{loadingSteps[loadingStep]}</p>
              <div className="flex gap-1.5 justify-center">
                 {[0,1,2].map(i => (
                   <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-500 ${loadingStep === i ? 'bg-red-600 scale-125' : 'bg-zinc-200'}`} />
                 ))}
              </div>
            </div>
          ) : result ? (
            <div className="w-full p-4 md:p-6 flex flex-col items-center max-h-full overflow-y-auto animate-in zoom-in duration-500 relative z-10 no-scrollbar">
              <div className="relative w-full flex justify-center">
                {result.type === 'image' ? (
                  <img src={result.data} className="w-full max-w-md rounded-2xl md:rounded-[3rem] shadow-2xl border-4 md:border-8 border-white group-hover/output:scale-[1.02] transition-transform duration-700" alt="AI Output" />
                ) : result.type === 'video' ? (
                  <video src={result.data} controls className="w-full max-w-md rounded-2xl md:rounded-[3rem] shadow-2xl border-4 md:border-8 border-white" autoPlay loop playsInline />
                ) : result.type === 'audio' ? (
                  <div className="bg-white p-8 md:p-12 rounded-2xl md:rounded-[3rem] flex flex-col items-center gap-4 md:gap-6 shadow-xl border w-full max-w-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 text-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
                       <Volume2 size={32} />
                    </div>
                    <p className="font-black uppercase tracking-widest text-[8px] md:text-[10px] text-zinc-400">Neural Vocalization Complete</p>
                    <button className="px-6 py-2 bg-black text-white rounded-full font-black text-[8px] uppercase tracking-widest flex items-center gap-2 active:scale-95"><Play size={12}/> Play Preview</button>
                  </div>
                ) : (
                  <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl border w-full max-w-lg text-start leading-relaxed">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 border-b pb-2 flex items-center gap-2"><Scan size={14}/> Neural Analysis Log:</p>
                      <pre className="whitespace-pre-wrap text-xs md:text-sm text-zinc-700 font-bold font-sans italic">"{result.data}"</pre>
                  </div>
                )}
                
                {/* Fidelity Badge */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-2xl opacity-0 group-hover/output:opacity-100 transition-opacity z-20">
                   <CheckCircle2 size={10} className="md:w-3 md:h-3"/> AI Fidelity Output
                </div>
              </div>

              {/* Action Protocols */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8 w-full max-w-sm">
                <button onClick={() => setResult(null)} className="flex-1 px-6 md:px-8 py-3.5 md:py-5 bg-white border-2 border-zinc-100 rounded-xl md:rounded-3xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:text-red-600 hover:border-red-100 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95">
                  <RefreshCcw size={14}/> Reset Protocol
                </button>
                {result.type !== 'text' && result.type !== 'audio' && (
                  <a href={result.data} download={`ak_studio_v8_${activeTab}.png`} className="flex-1 px-6 md:px-8 py-3.5 md:py-5 bg-black text-white rounded-xl md:rounded-3xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:bg-red-600 active:scale-95">
                    <Download size={14}/> Export Node
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center opacity-[0.03] select-none pointer-events-none animate-pulse">
              <Sparkles size={200} className="mx-auto md:w-[250px]" />
              <p className="text-2xl md:text-4xl font-black uppercase tracking-[0.4em] mt-6 md:mt-8 italic">Atelier Neural Studio</p>
            </div>
          )}
          
          {/* Subtle Background Text Decoration */}
          <div className="absolute bottom-6 right-8 opacity-[0.05] pointer-events-none hidden md:block">
             <p className="text-[120px] font-black leading-none uppercase select-none italic">GENESIS</p>
          </div>
        </div>
      </div>

      {/* Global CSS Injectors for Animation & Scaling */}
      <style>{`
        @keyframes scan { 0% { top: 0% } 100% { top: 100% } }
        .animate-scan { animation: scan 3s ease-in-out infinite alternate; }
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .arabic { font-family: 'Noto Sans Arabic', sans-serif; }
        .italic { font-style: italic; }
      `}</style>
    </div>
  );
};

export default AIStudioView;