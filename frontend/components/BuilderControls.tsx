'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function BuilderControls() {
  const { 
    districts, addDistrict, removeDistrict, updateDistrict, setNationLocked,
    activeBrush, setActiveBrush,
    brushMode, setBrushMode,
    demographicProfiles,
    selectedDistrictId, setSelectedDistrictId
  } = useSimulationStore();

  // Local consts for local forms
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictSeats, setNewDistrictSeats] = useState<number>(1);


  // HANDLERS

  // Add new district and clean values
  const handleAddDistrict = () => {
    const name = newDistrictName.trim() || `District ${districts.length + 1}`;
    const newId = `d_${Date.now()}`;
    
    // Default to the first demographic profile if it exists
    const defaultDemo = demographicProfiles.length > 0 ? demographicProfiles[0].id : "";

    addDistrict({ 
      id: newId, 
      name: name, 
      num_seats: newDistrictSeats,
      demographicProfileId: defaultDemo
    });
    setNewDistrictName("");
    setNewDistrictSeats(1);
    if (!activeBrush) setActiveBrush(newId);
  };

  const handleLockNation = () => {
    if (districts.length === 0) {
      alert("You must create at least one district before locking the nation.");
      return;
    }
    setNationLocked(true);
    setBrushMode("inspect"); // Auto-switch to inspect so the map dims nicely
  };

  // Find the currently selected district object for the Inspector
  const selectedDistrict = districts.find(d => d.id === selectedDistrictId);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Mode Switcher Tabs */}
      <div className="flex border rounded-lg overflow-hidden font-bold shadow-sm">
        <button 
          onClick={() => { setBrushMode("district"); setSelectedDistrictId(null); }}
          className={`flex-1 py-3 text-sm transition-colors ${brushMode === "district" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          1. Draw Borders
        </button>
        <button 
          onClick={() => setBrushMode("inspect")}
          className={`flex-1 py-3 text-sm transition-colors ${brushMode === "inspect" ? "bg-gray-800 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          2. Inspect Map
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
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Select Paintbrush</h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => setActiveBrush(null)}
                className={`p-3 text-left rounded border text-sm font-bold ${activeBrush === null ? "bg-red-500 text-white" : "bg-white hover:bg-gray-50"}`}
              >
                Eraser (Unassigned Land)
              </button>
              {districts.map((d) => (
                <div key={d.id} className="flex gap-2">
                  <button 
                    onClick={() => setActiveBrush(d.id)}
                    className={`flex-1 p-3 text-left rounded border text-sm font-bold ${activeBrush === d.id ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
                  >
                    {d.name} ({d.num_seats} {d.num_seats === 1 ? 'seat' : 'seats'})
                  </button>
                  <button 
                    onClick={() => {
                        removeDistrict(d.id);
                        if(activeBrush === d.id) setActiveBrush(null);
                    }} 
                    className="px-3 bg-red-50 text-red-600 border rounded hover:bg-red-100 font-bold"
                  >X</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* INSPECTOR SUB-PANELS */
        <div className="flex flex-col gap-5 animate-fade-in min-h-[300px]">
          {!selectedDistrict ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 p-6 text-center">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
              <p className="font-bold">Click a district on the map to inspect and edit its properties.</p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-lg border shadow-sm">
              <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-4 border-b pb-2">District Settings</h3>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">District Name</label>
                  <input 
                    type="text" 
                    value={selectedDistrict.name}
                    onChange={(e) => updateDistrict(selectedDistrict.id, { name: e.target.value })}
                    className="w-full p-2 border rounded mt-1 font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Number of Seats</label>
                  <input 
                    type="number" min="1"
                    value={selectedDistrict.num_seats}
                    onChange={(e) => updateDistrict(selectedDistrict.id, { num_seats: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border rounded mt-1 font-semibold text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Voter Demographic</label>
                  <select 
                    value={selectedDistrict.demographicProfileId}
                    onChange={(e) => updateDistrict(selectedDistrict.id, { demographicProfileId: e.target.value })}
                    className="w-full p-2 border rounded mt-1 font-semibold text-gray-800 bg-gray-50"
                  >
                    <option value="" disabled>Select a profile...</option>
                    {demographicProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
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