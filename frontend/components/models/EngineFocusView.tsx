"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ZoomIn, ZoomOut, RefreshCcw, Crosshair } from "lucide-react";

type PartStatus = "green" | "amber" | "red";

export default function EngineFocusView({ status, highlightedParts = [] }: { status: PartStatus, highlightedParts?: string[] }) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 200 };
  const dx = useSpring(x, springConfig);
  const dy = useSpring(y, springConfig);

  const handleWheel = (e: React.WheelEvent) => {
    // Only Zoom if hovering the component
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    setScale(newScale);
    
    // Reset position if zooming out to 1
    if (newScale <= 1) {
      x.set(0);
      y.set(0);
    }
  };

  const reset = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
    >
        {/* Technical HUD Overlay */}
        <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                    status === 'red' ? 'bg-rose-500 shadow-rose-500/50' : 
                    status === 'amber' ? 'bg-amber-500 shadow-amber-500/50' : 
                    'bg-emerald-500 shadow-emerald-500/50'
                }`} />
                <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
                    Live Engine Diagnostic Feed
                </span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded px-2 py-1 w-fit">
                <Crosshair size={10} className="text-blue-400" />
                <span className="text-[9px] text-blue-300 font-mono">RESOLVING: 4K FORENSIC MACRO</span>
            </div>
            {highlightedParts.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                    {highlightedParts.slice(0, 3).map(p => (
                        <span key={p} className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 rounded text-[8px] text-rose-300 font-bold uppercase tracking-wider">
                            {p}
                        </span>
                    ))}
                </div>
            )}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-5 right-5 z-30 flex flex-col gap-2">
            <div className="flex flex-col gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
                <button 
                    onClick={() => setScale(s => Math.min(s + 1, 5))}
                    className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors rounded-lg"
                    title="Zoom In"
                >
                    <ZoomIn size={18} />
                </button>
                <button 
                    onClick={() => setScale(s => Math.max(s - 1, 1))}
                    className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors rounded-lg"
                    title="Zoom Out"
                >
                    <ZoomOut size={18} />
                </button>
                <div className="h-px bg-white/10 mx-2" />
                <button 
                    onClick={reset}
                    className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors rounded-lg"
                    title="Reset View"
                >
                    <RefreshCcw size={18} />
                </button>
            </div>
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-1.5 text-center">
                <span className="text-[10px] font-mono text-blue-400 font-bold">{(scale * 100).toFixed(0)}%</span>
            </div>
        </div>

        {/* Viewport Hint */}
        <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
            <div className="text-[9px] text-white/40 font-medium tracking-tight bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                SCROLL TO ZOOM • DRAG TO EXPLORE
            </div>
        </div>

        <motion.div
            drag={scale > 1}
            dragConstraints={containerRef}
            dragElastic={0.1}
            style={{ x: dx, y: dy, scale }}
            className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
        >
            <img 
                src="/images/engine-demo.jpg" 
                alt="Engine 4K Forensic" 
                className="w-full h-full object-cover pointer-events-none"
            />
            
            {/* Subtle Vignette on the image itself */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.4)] pointer-events-none" />
        </motion.div>
        
        {/* Scanning Tech Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
            <div className="w-full h-[2px] bg-blue-500/40 absolute top-0 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_6s_linear_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_parent,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        {/* Grid lines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />

        <style jsx global>{`
            @keyframes scan {
                0% { top: -10%; }
                100% { top: 110%; }
            }
        `}</style>
    </div>
  );
}
