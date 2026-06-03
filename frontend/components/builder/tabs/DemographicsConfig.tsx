'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import PositionSliders from "@/components/PositionSliders";

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
    <div>
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2.5">
        <h2 className="text-lg font-bold text-gray-800">Voter Profiles</h2>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Demographics</span>
      </div>

      {/* Add Profile Form (Converted to a single inline row) */}
      <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 mb-4 shadow-sm flex items-center gap-2.5">
        <input 
          type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
          className="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer shrink-0 hover:ring-2 hover:ring-emerald-400" 
        />
        <input 
          type="text" placeholder="e.g. Traditionalists..." value={newName}
          onChange={(e) => setNewName(e.target.value)} 
          className="flex-1 py-1.5 px-3 min-w-0 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
        <button 
          onClick={handleAdd} disabled={!newName.trim()}
          className="bg-emerald-600 text-white px-4 py-1.5 rounded hover:bg-emerald-700 font-bold text-sm transition-colors disabled:bg-gray-300 shadow-sm whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {/* Profiles List */}
      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {demographicProfiles.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm shrink-0" style={{ borderLeft: `4px solid ${p.color}` }}>
            
            {/* Compact Header (No Border) */}
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-gray-800 text-base truncate pr-4">{p.name}</div>
              <button 
                onClick={() => removeDemographicProfile(p.id)} 
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-sm shrink-0"
                title="Delete Profile"
              >
                ✕
              </button>
            </div>
            
            <PositionSliders
              axes={axes}
              positions={p.positions}
              id={p.id}
              colorClass="accent-emerald-600"
              onPositionChange={updateDemographicPosition}
            />
            
          </div>
        ))}
      </div>
    </div>
  );
}