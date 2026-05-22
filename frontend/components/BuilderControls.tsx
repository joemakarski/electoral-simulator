'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function BuilderControls() {
  // Hook key consts into store
  const { 
    districts, 
    addDistrict, 
    removeDistrict, 
    setNationLocked,
    activeBrush,
    setActiveBrush,
  } = useSimulationStore();

  // Local consts for local forms
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictSeats, setNewDistrictSeats] = useState<number>(1);


  // HANDLERS

  // Add new district and clean values
  const handleAddDistrict = () => {
    const name = (newDistrictName.trim()) || 
        `District ${districts.length + 1}`; // empty string -> generate name
    
    const newId = `d_${Date.now()}`; // Generate a quick unique ID
    addDistrict({
      id: newId,
      name: name,
      num_seats: newDistrictSeats
    });
    
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
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">1. Create Districts</h2>
        
        {/* District Creation Form */}
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded border">
          <input 
            type="text" 
            placeholder="(Optional) District name"
            value={newDistrictName}
            onChange={(e) => setNewDistrictName(e.target.value)}
            className="p-2 border rounded"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Seats:</label>
            <input 
              type="number" 
              min="1"
              value={newDistrictSeats}
              onChange={(e) => setNewDistrictSeats(parseInt(e.target.value) || 1)}
              className="p-2 border rounded w-20"
            />
            <button 
              onClick={handleAddDistrict}
              className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 w-full"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* The "Paint Palette" */}
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">2. Select Brush</h2>
        {districts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Add a district to start painting.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveBrush(null)}
              className={`p-3 text-left rounded border transition-colors ${
                activeBrush === null ? "bg-red-500 text-white" : "bg-white hover:bg-gray-100"
              }`}
            >
              Eraser
            </button>
            
            {districts.map((d) => (
              <div key={d.id} className="flex gap-2">
                <button
                  onClick={() => setActiveBrush(d.id)}
                  className={`flex-1 p-3 text-left rounded border transition-colors font-semibold ${
                    activeBrush === d.id ? "bg-blue-600 text-white border-blue-700" : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {d.name} ({d.num_seats} {d.num_seats === 1 ? 'seat' : 'seats'})
                </button>
                <button 
                  onClick={() => removeDistrict(d.id)}
                  className="px-3 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proceed to Phase 2 */}
      <div className="mt-8">
        <button 
          onClick={handleLockNation}
          className="w-full bg-purple-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg"
        >
          Lock Geography & Proceed ➔
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Locking will allow you to assign candidates and run simulations.
        </p>
      </div>
    </div>
  );
}