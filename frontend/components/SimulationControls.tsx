'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function SimulationControls() {
  const { 
    grid, 
    districts, 
    candidates, 
    setCandidates, 
    activeSystem, 
    setActiveSystem, 
    setResults, 
    setNationLocked 
  } = useSimulationStore();

  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);

    // Filter out unassigned tiles
    const activeTiles = grid.filter(t => t.district_id !== null);

    // Convert Tiles into VoterBlocks
    // For now, give every tile a generic demographic based on its district index
    const generatedVoters = activeTiles.map(tile => {
        // for now, alternate left/right/center leaning based on district array index
        const dIndex = districts.findIndex(d => d.id === tile.district_id);
        const lean = dIndex % 2 === 0 ? -0.5 : 0.5; 

        return {
            population: tile.population,
            positions: { economy: lean, social: lean }, // default axes
            district_id: tile.district_id
        };
    });

    const payload = {
      system: activeSystem,
      districts: districts,
      candidates: candidates,
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
        <h2 className="text-xl font-bold border-b pb-2 mb-4">1. Electoral System</h2>
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

      {/* Candidate Tweaks */}
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">2. National Candidates</h2>
        <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-2">
          {candidates.map((c) => (
            <div key={c.id} className="bg-gray-50 p-3 rounded border text-sm">
              <div className="flex justify-between font-bold mb-2">
                <span>{c.name} ({c.party_id})</span>
                <span className="text-gray-500">{c.positions.economy.toFixed(1)}</span> {/* Hardcoded Economy axis for now  */}
              </div>
              <input 
                type="range" min="-1" max="1" step="0.1" 
                value={c.positions.economy}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCandidates(candidates.map(cand => 
                    cand.id === c.id ? { ...cand, positions: { ...cand.positions, economy: val } } : cand
                  ));
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Left</span><span>Right</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution */}
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
          disabled={loading}
          className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 shadow-md"
        >
          {loading ? "Calculating..." : "Run Election"}
        </button>
      </div>

    </div>
  );
}