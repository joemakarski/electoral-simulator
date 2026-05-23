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
  const [newPop, setNewPop] = useState<number>(1000);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {});
    
    addDemographicProfile({
      id: `demo_${Date.now()}`,
      name: newName,
      color: newColor,
      populationPerTile: newPop,
      positions: defaultPositions
    });
    setNewName("");
  };

  return (
    <div className="bg-white p-5 rounded-lg border shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-gray-800">Voter Profiles</h2>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Demographics</span>
      </div>

      {/* Add Profile Form */}
      <div className="flex flex-col gap-3 mb-5 bg-gray-50 p-3 rounded border">
        <div className="flex gap-2">
          <input 
            type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 p-1 border rounded cursor-pointer shrink-0" 
          />
          <input 
            type="text" placeholder="Profile Name (e.g. Populist Base)..." value={newName}
            onChange={(e) => setNewName(e.target.value)} className="flex-1 p-2 border rounded text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-bold text-gray-500 uppercase">Pop/Tile:</span>
          <input 
            type="number" step="100" min="100" value={newPop}
            onChange={(e) => setNewPop(parseInt(e.target.value) || 1000)} className="w-24 p-2 border rounded text-sm"
          />
          <button 
            onClick={handleAdd} disabled={!newName.trim()}
            className="flex-1 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 disabled:bg-gray-300"
          >
            Add
          </button>
        </div>
      </div>

      {/* Profiles List */}
      <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {demographicProfiles.map((p) => (
          <div key={p.id} className="bg-white border rounded-lg p-4 shadow-sm shrink-0" style={{ borderLeft: `6px solid ${p.color}` }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-500">Population: {p.populationPerTile.toLocaleString()}</div>
              </div>
              <button onClick={() => removeDemographicProfile(p.id)} className="text-gray-400 hover:text-red-500 font-bold">✕</button>
            </div>
            
            <div className="flex flex-col gap-2">
              {axes.map(axis => (
                <div key={axis} className="text-xs">
                  <div className="flex justify-between font-semibold mb-1 text-gray-600">
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