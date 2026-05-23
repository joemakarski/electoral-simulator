'use client';

import { useState, useEffect } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function SimulationControls() {
  const { 
    grid, 
    districts, 
    axes,
    parties,
    addParty,
    removeParty,
    updatePartyPosition,
    candidates, 
    generateCandidates, 
    activeSystem, 
    setActiveSystem, 
    setResults, 
    setNationLocked,
    demographicProfiles
  } = useSimulationStore();

  const [loading, setLoading] = useState(false);

  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState("#9333ea");


  const handleAddParty = () => {
    if (!newPartyName.trim()) return;
    
    const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {}); // default value: 0

    addParty({
      id: `p_${Date.now()}`,
      name: newPartyName,
      color: newPartyColor,
      basePositions: defaultPositions
    });
    
    setNewPartyName("");
  };

  const runSimulation = async () => {
    setLoading(true);

    generateCandidates();
    const latestCandidates = useSimulationStore.getState().candidates;

    // Filter out unassigned tiles
    const activeTiles = grid.filter(t => t.district_id !== null);

    // Convert Tiles into VoterBlocks
    const generatedVoters = activeTiles.map(tile => {
        // Find the custom painted demographic archetype for this specific tile
        const profile = demographicProfiles.find(p => p.id === tile.demographicProfileId);
        
        // Safety fallback if a profile was missing
        const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {});
        const finalPositions = profile ? { ...profile.positions } : defaultPositions;
        const finalPopulation = profile ? profile.populationPerTile : 1000;

        return {
            population: finalPopulation,
            positions: finalPositions, // Pulls perfectly from whatever axes are initialized!
            district_id: tile.district_id
        };
    });

    const payload = {
      system: activeSystem,
      districts: districts,
      candidates: latestCandidates,
      voters: generatedVoters,
    };

    // Simulate on backend
    try {
      const response = await fetch("http://localhost:8000/api/simulate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(data)
      setResults(data);
    } catch (error) {
      console.error("Simulation failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Electoral System Selection */}
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Electoral System</h2>
        <select
          value={activeSystem}
          onChange={(e) => setActiveSystem(e.target.value)}
          className="w-full p-3 border rounded-lg bg-white shadow-sm"
        >
          <option value="fptp">First Past The Post (Plurality)</option>
          <option value="dhondt">Regional PR (D'Hondt)</option>
          <option value="mmp">Mixed-Member Proportional (MMP)</option>
        </select>
      </div>

      {/* Party Platforms */}
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Party Platforms</h2>
        
        {/* ADD PARTY FORM */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-4 shadow-sm flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">Create New Party</label>
          <div className="flex items-center gap-3">
            <input 
              type="color"
              value={newPartyColor}
              onChange={(e) => setNewPartyColor(e.target.value)}
              className="w-10 h-10 p-1 border border-gray-300 rounded cursor-pointer shrink-0 hover:ring-2 hover:ring-blue-400"
              title="Party Color"
            />

            <input 
              type="text" 
              placeholder="Party Name..."
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={handleAddParty}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 font-bold transition-colors"
          >
            Add Party
          </button>
        </div>


        {/* PARTY LIST */}
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
          {parties.length === 0 && <p className="text-sm text-gray-500 italic">No parties created.</p>}
          
          {parties.map((party) => (
            <div key={party.id} className="bg-gray-50 p-4 rounded-lg border shadow-sm relative" style={{ borderLeft: `6px solid ${party.color}` }}>
              
              {/* Delete Button */}
              <button
                onClick={() => removeParty(party.id)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center 
                          text-gray-400 hover:text-red-500 font-bold text-xl 
                          rounded-full hover:bg-gray-200 transition"
                title="Delete Party"
              >
                ✕
              </button>

              <div className="font-bold text-lg mb-3 text-gray-800 pr-6">{party.name}</div>
              
              <div className="flex flex-col gap-3">
                {axes.map(axis => (
                  <div key={axis} className="text-sm">
                    <div className="flex justify-between font-semibold mb-1 text-gray-700">
                      <span>{axis}</span>
                      <span className="text-gray-500">{(party.basePositions[axis] || 0).toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" min="-1" max="1" step="0.05" 
                      value={party.basePositions[axis] || 0}
                      onChange={(e) => updatePartyPosition(party.id, axis, parseFloat(e.target.value))}
                      className="w-full accent-gray-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Execution */}
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => {
            setNationLocked(false);
            setResults(null);
          }}
          className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300"
        >
          Unlock Map
        </button>

        <button 
          onClick={runSimulation}
          disabled={loading || parties.length === 0}
          className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 shadow-md"
        >
          {loading ? "Calculating..." : "Run Election"}
        </button>
      </div>

    </div>
  );
}