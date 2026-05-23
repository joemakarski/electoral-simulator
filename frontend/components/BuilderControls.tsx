'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function BuilderControls() {
  // Hook key consts into store
  const { 
    districts, addDistrict, removeDistrict, setNationLocked,
    activeBrush, setActiveBrush,
    brushMode, setBrushMode,
    demographicProfiles, activeDemographicBrush, setActiveDemographicBrush
  } = useSimulationStore();

  // Local consts for local forms
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictSeats, setNewDistrictSeats] = useState<number>(1);


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
                  <button onClick={() => removeDistrict(d.id)} className="px-3 bg-red-50 text-red-600 border rounded hover:bg-red-100 font-bold">X</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Demographics Paint Sub-Panel */
        <div className="flex flex-col gap-5 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Select Demographic Archetype</h3>
            <div className="flex flex-col gap-2">
              {demographicProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveDemographicBrush(p.id)}
                  className="p-4 rounded-lg border text-left flex items-center justify-between font-bold shadow-sm transition-all hover:translate-x-1"
                  style={{ 
                    borderLeft: activeDemographicBrush === p.id ? `8px solid ${p.color}` : `4px solid ${p.color}`,
                    backgroundColor: activeDemographicBrush === p.id ? "#f3f4f6" : "#ffffff"
                  }}
                >
                  <div>
                    <div className="text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-400 font-normal">Base Pop: {p.populationPerTile.toLocaleString()} per tile</div>
                  </div>
                  <div className="w-4 h-4 rounded-full border shadow-inner" style={{ backgroundColor: p.color }}></div>
                </button>
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