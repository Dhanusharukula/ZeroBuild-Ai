
import React, { useState } from 'react';
import { LayoutData, RoomType } from '../types';

interface LayoutVizProps {
  layout: LayoutData | null;
}

const ROOM_COLORS: Record<RoomType, string> = {
  living: 'bg-blue-50 border-blue-500 text-blue-900',
  bedroom: 'bg-purple-50 border-purple-500 text-purple-900',
  kitchen: 'bg-orange-50 border-orange-500 text-orange-900',
  bathroom: 'bg-cyan-50 border-cyan-500 text-cyan-900',
  hallway: 'bg-stone-50 border-stone-400 text-stone-900',
  outdoor: 'bg-emerald-50 border-emerald-500 text-emerald-900',
  office: 'bg-indigo-50 border-indigo-500 text-indigo-900',
  dining: 'bg-amber-50 border-amber-500 text-amber-900',
  other: 'bg-slate-50 border-slate-400 text-slate-800'
};

const LayoutViz: React.FC<LayoutVizProps> = ({ layout }) => {
  const [is3D, setIs3D] = useState(false);

  if (!layout || !layout.rooms || layout.rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 blueprint-grid rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 transition-all">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-drafting-compass text-4xl text-slate-300"></i>
        </div>
        <p className="text-xl font-bold text-slate-600">Canvas Ready</p>
        <p className="text-sm text-center max-w-xs mt-2">
          Share your space requirements in the chat to generate a schematic floor plan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold leading-none">{layout.description || "Draft Plan"}</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Architectural Schematic</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIs3D(!is3D)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${is3D ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <i className={`fas ${is3D ? 'fa-cube' : 'fa-square'}`}></i>
            {is3D ? '3D VIEW' : '2D VIEW'}
          </button>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 transition-colors" title="Export PNG">
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#f0f2f5] blueprint-grid flex items-center justify-center p-12">
        <div 
          className="relative bg-white shadow-2xl transition-all duration-700 ease-out border-[3px] border-slate-800"
          style={{
            width: '100%',
            maxWidth: '650px',
            aspectRatio: `${layout.totalWidth} / ${layout.totalHeight}`,
            transform: is3D ? 'perspective(1200px) rotateX(45deg) rotateZ(-15deg) translateY(-20px)' : 'none',
            transformStyle: 'preserve-3d'
          }}
        >
          {layout.rooms.map((room) => (
            <div
              key={room.id}
              className={`absolute border-[1.5px] flex flex-col items-center justify-center text-center p-2 transition-all duration-500 group overflow-hidden ${ROOM_COLORS[room.type] || ROOM_COLORS.other}`}
              style={{
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.width}%`,
                height: `${room.height}%`,
                transform: is3D ? 'translateZ(20px)' : 'none',
                boxShadow: is3D ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <span className="text-[11px] font-black uppercase tracking-tight block truncate w-full">
                {room.name}
              </span>
              <span className="text-[9px] font-mono opacity-60 mt-0.5">
                {Math.round(room.width)}m x {Math.round(room.height)}m
              </span>

              {/* Decorative "Architectural" details */}
              <div className="absolute top-1 left-1 w-1 h-1 border-t border-l border-slate-400 opacity-40"></div>
              <div className="absolute bottom-1 right-1 w-1 h-1 border-b border-r border-slate-400 opacity-40"></div>
            </div>
          ))}

          {/* Scale Indicator */}
          <div className="absolute -bottom-10 left-0 flex items-center gap-2">
            <div className="w-20 h-[1px] bg-slate-400 relative">
              <div className="absolute left-0 -top-1 w-[1px] h-2 bg-slate-400"></div>
              <div className="absolute right-0 -top-1 w-[1px] h-2 bg-slate-400"></div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">SCALE 1:100</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {Array.from(new Set(layout.rooms.map(r => r.type))).map(type => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm border border-slate-300 ${ROOM_COLORS[type as RoomType]?.split(' ')[0]}`}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{type}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-400 font-mono italic">
          *Draft visualization only
        </div>
      </div>
    </div>
  );
};

export default LayoutViz;
