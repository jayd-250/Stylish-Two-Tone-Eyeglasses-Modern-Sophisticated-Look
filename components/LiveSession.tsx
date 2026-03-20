
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Product, Language } from '../types';
import { t } from '../i18n';
import { Radio, Mic, MicOff, Video, VideoOff, ShoppingCart, X, Users, Crown, Hash } from 'lucide-react';
import { BrandLogo } from '../App';

interface LiveSessionProps {
  mode: 'seller' | 'buyer';
  language: Language;
  featuredProduct?: Product;
  streamTitle: string;
  onClose: () => void;
}

// Fixed: Manual implementations for Base64 encoding/decoding and PCM audio handling as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}

const LiveSession: React.FC<LiveSessionProps> = ({ mode, language, featuredProduct, streamTitle, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const viewers = useMemo(() => Math.floor(Math.random() * 85) + 42, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            console.debug('Gemini Live session opened');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Fixed: Handling raw PCM audio stream from Gemini Live API
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Gemini Live error:', e),
          onclose: (e) => console.debug('Gemini Live session closed', e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are a helpful AI Sales Assistant for the BIG MARKET HUB. 
            The seller is broadcasting live from Rwanda. Featured: ${featuredProduct?.name || 'various items'}. 
            Be human-like and friendly.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start stream:', err);
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      for (const source of sourcesRef.current.values()) {
        source.stop();
      }
      if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl aspect-video bg-gray-900 rounded-[4rem] overflow-hidden relative shadow-2xl border-4 border-amber-500/20">
        
        {/* Video Background */}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
        <canvas ref={canvasRef} className="hidden" />

        {/* Branding Overlay */}
        <div className="absolute top-10 left-10 flex items-center gap-4">
           <div className="bg-red-600 px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse shadow-2xl">
              <Radio size={18}/> {isActive ? 'LIVE BROADCAST' : 'ESTABLISHING...'}
           </div>
           <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl text-white font-black text-xs flex items-center gap-2 border border-white/10 shadow-2xl">
              <Users size={18}/> {viewers} VIEWERS
           </div>
        </div>

        {/* D-Crown Royal Seal Watermark */}
        <div className="absolute bottom-10 right-10 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-amber-500/10 opacity-60">
           <BrandLogo size="w-8 h-8" />
           <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">#BIGMARKETHUB</span>
        </div>

        <button onClick={onClose} className="absolute top-10 right-10 w-16 h-16 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all border border-white/10 shadow-2xl">
           <X size={32}/>
        </button>

        {/* Featured Product Overlay */}
        {featuredProduct && (
          <div className="absolute top-10 right-32 bg-white/10 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 flex gap-6 items-center animate-in slide-in-from-right-12 max-w-sm shadow-2xl">
             <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-amber-500/20">
                <img src={featuredProduct.images?.[0] || 'https://picsum.photos/seed/product/200'} className="w-full h-full object-cover" alt={featuredProduct.name}/>
             </div>
             <div className="flex-grow">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                   <Crown size={12}/> FEATURED ITEM
                </p>
                <h4 className="text-white font-black text-sm leading-tight mb-2 line-clamp-1">{featuredProduct.name}</h4>
                <p className="text-green-400 font-black text-xl">{featuredProduct.price.toLocaleString()} Frw</p>
             </div>
             {mode === 'buyer' && (
               <button className="bg-green-600 w-12 h-12 rounded-2xl text-white shadow-2xl hover:bg-green-700 transition flex items-center justify-center">
                  <ShoppingCart size={24}/>
               </button>
             )}
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-2xl p-5 rounded-[3rem] border border-white/10 shadow-2xl">
          <button onClick={() => setIsMicOn(!isMicOn)} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
             {isMicOn ? <Mic size={28}/> : <MicOff size={28}/>}
          </button>
          <button onClick={() => setIsCamOn(!isCamOn)} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isCamOn ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
             {isCamOn ? <Video size={28}/> : <VideoOff size={28}/>}
          </button>
          <div className="h-12 w-px bg-white/10 mx-2" />
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Royal Cohost</span>
             <button className="px-10 py-4 bg-amber-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl">
                Gemini AI Active
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveSession;
