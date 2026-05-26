'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function DemographicsConfig() {
  const { 
    demographicProfiles, 
    addDemographicProfile, 
    removeDemographicProfile, 
    updateDemographicPosition, 
    axes 
  } = useSimulationStore();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#10b981");

  const handleAdd = () => {
    if (!newName.trim()) return;
    const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {});
    
    addDemographicProfile({
      id: `demo_${Date.now()}`,
      name: newName,
      color: newColor,
      positions: defaultPositions
    });
    setNewName("");
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-800">Voter Profiles</h2>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demographics</span>
      </div>

      {/* Add Profile Form */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <input 
            type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer shrink-0" 
          />
          <input 
            type="text" placeholder="Demographic Name..." value={newName}
            onChange={(e) => setNewName(e.target.value)} 
            className="flex-1 p-2.5 min-w-40 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button 
          onClick={handleAdd} disabled={!newName.trim()}
          className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-md hover:bg-emerald-700 font-bold text-sm transition-colors disabled:bg-gray-300"
        >
          Add Profile
        </button>
      </div>

      {/* Profiles List */}
      <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {demographicProfiles.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm shrink-0" style={{ borderLeft: `6px solid ${p.color}` }}>
            
            {/* Header: Added padding and a subtle bottom border to anchor it */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
              <div className="font-bold text-gray-800 break-words pr-4 leading-tight">{p.name}</div>
              <button 
                onClick={() => removeDemographicProfile(p.id)} 
                className="text-gray-400 hover:text-red-500 font-bold text-lg transition-colors leading-none"
              >
                ✕
              </button>
            </div>
            
            {/* FIX: Changed from flex-col to a 2-column grid! */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {axes.map(axis => (
                <div key={axis} className="text-sm">
                  <div className="flex justify-between font-semibold mb-1.5 text-gray-600">
                    <span>{axis}</span>
                    <span>{(p.positions[axis] || 0).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" min="-1" max="1" step="0.05" value={p.positions[axis] || 0}
                    onChange={(e) => updateDemographicPosition(p.id, axis, parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}