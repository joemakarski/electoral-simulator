'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function BuilderControls() {
  // Hook key consts into store
  const { 
    districts, addDistrict, removeDistrict, setNationLocked,
    activeBrush, setActiveBrush,
    brushMode, setBrushMode,
    demographicProfiles, activeDemographicBrush, setActiveDemographicBrush,
    addDemographicProfile, removeDemographicProfile, updateDemographicPosition, axes
  } = useSimulationStore();

  // Local consts for local forms
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictSeats, setNewDistrictSeats] = useState<number>(1);
  
  // Local consts for Demographic form
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileColor, setNewProfileColor] = useState("#10b981");
  const [newProfilePop, setNewProfilePop] = useState<number>(1000);


  // HANDLERS

  // Add new district and clean values
  const handleAddDistrict = () => {
    const name = newDistrictName.trim() || `District ${districts.length + 1}`;
    const newId = `d_${Date.now()}`;
    addDistrict({ id: newId, name: name, num_seats: newDistrictSeats });
    setNewDistrictName("");
    setNewDistrictSeats(1);
    if (!activeBrush) setActiveBrush(newId);
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    
    const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {});
    const newId = `demo_${Date.now()}`;
    
    addDemographicProfile({
      id: newId,
      name: newProfileName,
      color: newProfileColor,
      populationPerTile: newProfilePop,
      positions: defaultPositions
    });
    
    setNewProfileName("");
    if (!activeDemographicBrush) setActiveDemographicBrush(newId);
  };

  const handleLockNation = () => {
    if (districts.length === 0) {
      alert("You must create at least one district before locking the nation."); // TODO: make prettier
      return;
    }
    setNationLocked(true);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Mode Switcher Tabs */}
      <div className="flex border rounded-lg overflow-hidden font-bold shadow-sm">
        <button 
          onClick={() => setBrushMode("district")}
          className={`flex-1 py-3 text-sm transition-colors ${brushMode === "district" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          1. Draw Borders
        </button>
        <button 
          onClick={() => setBrushMode("demographic")}
          className={`flex-1 py-3 text-sm transition-colors ${brushMode === "demographic" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          2. Paint Voters
        </button>
      </div>

      {/* CONDITIONAL SUB-PANELS */}
      {brushMode === "district" ? (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Create New District</h3>
            <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded border">
              <input 
                type="text" placeholder="District name..." value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)} className="p-2 border rounded bg-white"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Seats:</span>
                <input 
                  type="number" min="1" value={newDistrictSeats}
                  onChange={(e) => setNewDistrictSeats(parseInt(e.target.value) || 1)} className="p-2 border rounded w-16 bg-white"
                />
                <button onClick={handleAddDistrict} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Add</button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Select Border Palette</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveBrush(null)}
                className={`p-3 text-left rounded border text-sm font-bold ${activeBrush === null ? "bg-red-500 text-white" : "bg-white hover:bg-gray-50"}`}
              >
                <i>Eraser</i>
              </button>
              {districts.map((d) => (
                <div key={d.id} className="flex gap-2">
                  <button 
                    onClick={() => setActiveBrush(d.id)}
                    className={`flex-1 p-3 text-left rounded border text-sm font-bold ${activeBrush === d.id ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
                  >
                    {d.name} ({d.num_seats} {d.num_seats === 1 ? 'seat' : 'seats'})
                  </button>
                  <button onClick={() => removeDistrict(d.id)} className="px-3 bg-red-50 text-red-600 border rounded hover:bg-red-100 font-bold">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Demographics Paint Sub-Panel */
        <div className="flex flex-col gap-5 animate-fade-in">
          
          {/* Create Demographic Form */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Create Voter Profile</h3>
            <div className="bg-gray-50 p-4 rounded-lg border shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input 
                  type="color" value={newProfileColor} onChange={(e) => setNewProfileColor(e.target.value)}
                  className="w-10 h-10 p-1 border border-gray-300 rounded cursor-pointer shrink-0" title="Profile Color"
                />
                <input 
                  type="text" placeholder="Profile Name (e.g. Farmers)" value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)} className="flex-1 p-2 border rounded outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 shrink-0">Pop. per tile:</span>
                <input 
                  type="number" min="100" step="100" value={newProfilePop}
                  onChange={(e) => setNewProfilePop(parseInt(e.target.value) || 1000)} className="p-2 border rounded w-24 bg-white"
                />
                <button onClick={handleAddProfile} className="flex-1 bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">Add</button>
              </div>
            </div>
          </div>

          {/* Demographic Brush Palette & Editor */}
          <div className="mt-2"> 
            
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Select & Edit Profiles</h3>
            
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 pb-4 custom-scrollbar">
              {demographicProfiles.map((p) => (
                <div
                  key={p.id}
                  className="shrink-0 rounded-lg border shadow-sm transition-all bg-white relative overflow-hidden"
                  style={{ 
                    borderLeft: activeDemographicBrush === p.id ? `8px solid ${p.color}` : `4px solid ${p.color}`,
                    borderColor: activeDemographicBrush === p.id ? p.color : '#e5e7eb'
                  }}
                >
                  <div 
                    onClick={() => setActiveDemographicBrush(p.id)}
                    className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${activeDemographicBrush === p.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <div>
                      <div className="font-bold text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-500">Pop: {p.populationPerTile.toLocaleString()} / tile</div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeDemographicProfile(p.id); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    >✕</button>
                  </div>

                  {/* Sliders for dynamic axes */}
                  <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-3">
                    {axes.map(axis => (
                      <div key={axis} className="text-xs">
                        <div className="flex justify-between font-semibold mb-1 text-gray-600">
                          <span>{axis}</span>
                          <span>{(p.positions[axis] || 0).toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" min="-1" max="1" step="0.05" 
                          value={p.positions[axis] || 0}
                          onChange={(e) => updateDemographicPosition(p.id, axis, parseFloat(e.target.value))}
                          className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Lock Action */}
      <div className="mt-6 border-t pt-4">
        <button 
          onClick={handleLockNation}
          className="w-full bg-purple-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-purple-700 shadow-md transition-colors"
        >
          Lock Nation & Proceed ➔
        </button>
      </div>
    </div>
  );
}