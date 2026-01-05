
import React, { useEffect, useRef } from 'react';
import { TerminalLine } from '../types';

interface TerminalProps {
  lines: TerminalLine[];
}

const Terminal: React.FC<TerminalProps> = ({ lines }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="bg-[#050505] border border-red-900/20 rounded-2xl p-6 h-72 overflow-y-auto mono text-xs shadow-2xl relative">
      <div className="sticky top-0 bg-[#050505]/95 backdrop-blur-sm z-10 flex items-center justify-between mb-6 border-b border-red-900/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-900/20"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-900/20"></div>
          </div>
          <span className="text-red-900 font-black uppercase tracking-[0.3em] text-[10px]">Neural_Uplink_Monitor</span>
        </div>
        <div className="text-[9px] text-neutral-800 font-bold uppercase tracking-widest">Buffer_Mode: Sequential</div>
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-left-1">
            <span className="text-neutral-800 font-bold select-none">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
            <div className="flex-1">
              {line.type === 'cmd' && <span className="text-red-600 mr-2 font-black">❯</span>}
              {line.type === 'info' && <span className="text-neutral-500 mr-2 uppercase font-black tracking-tighter text-[9px]">INTEL</span>}
              {line.type === 'error' && <span className="text-red-700 mr-2 uppercase font-black tracking-tighter text-[9px]">CRITICAL</span>}
              {line.type === 'success' && <span className="text-red-500 mr-2 uppercase font-black tracking-tighter text-[9px]">READY</span>}
              <span className={
                line.type === 'error' ? 'text-red-700 font-bold' : 
                line.type === 'success' ? 'text-neutral-200' : 
                line.type === 'cmd' ? 'text-red-400 font-mono italic' :
                'text-neutral-500'
              }>
                {line.text}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;
