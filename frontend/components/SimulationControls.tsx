'use client';

import { useState } from "react";

import { useSimulationStore } from "@/store/simulationStore";
import { API_URL, DEFAULT_PARTY_COLOR } from "@/utils/constants";
import { buildSimulationPayload } from "@/utils/buildPayload";
import PositionSliders from "@/components/PositionSliders";

export default function SimulationControls() {
  const { 
    grid, axes, parties,
    addParty, removeParty, updatePartyPosition,
    generateCandidates, 
    activeSystem, setActiveSystem, 
    setResults, setNationLocked, demographicProfiles,
    candidateFuzzLevel, setCandidateFuzzLevel,
    voterFuzzLevel, setVoterFuzzLevel
  } = useSimulationStore();

  const [loading, setLoading] = useState(false);

  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState(DEFAULT_PARTY_COLOR);

  const [simTabs, setSimTab] = useState<'options'|'parties'>('parties');


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

  // Generate candidates, then HTTP POST the simulation payload and set the results
  const runSimulation = async () => {
    setLoading(true);

    generateCandidates();
    const latestCandidates = useSimulationStore.getState().candidates;

    const payload = buildSimulationPayload(
      activeSystem, grid, latestCandidates, demographicProfiles, axes, voterFuzzLevel
    )
    try {
      const response = await fetch(`${API_URL}/api/simulate/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
  
      {/* Tab Navigation */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button 
          onClick={() => setSimTab('parties')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            simTabs === 'parties' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
        >
          4. Parties
        </button>
        <button 
          onClick={() => setSimTab('options')}
          className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
            simTabs === 'options' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
        >
          5. Election
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px] p-6">
        
        {/* Parties Tab content */}
        {simTabs === 'parties' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Add Party Form */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-800">Create New Party</label>
              
              <div className="flex items-center gap-3">
                <input 
                  type="color" value={newPartyColor} onChange={(e) => setNewPartyColor(e.target.value)}
                  className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer shrink-0 hover:ring-2 hover:ring-blue-400"
                  title="Party Color"
                />
                <input 
                  type="text" placeholder="Party Name..." value={newPartyName} onChange={(e) => setNewPartyName(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button 
                  onClick={handleAddParty} disabled={!newPartyName.trim()}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 font-bold text-sm transition-colors disabled:bg-gray-300 whitespace-nowrap"
                >
                  Add Party
                </button>
              </div>
            </div>

            {/* List of parties */}
            <div className="flex flex-col gap-4">
              {parties.length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 font-medium">
                  No parties created yet.
                </div>
              )}
              
              {parties.map((party) => (
                <div key={party.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative shrink-0" style={{ borderLeft: `6px solid ${party.color}` }}>
                  <button
                    onClick={() => removeParty(party.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 font-bold text-lg rounded-md hover:bg-gray-100 transition-colors"
                    title="Delete Party"
                  >✕</button>

                  <div className="font-bold text-lg mb-4 pb-3 border-b border-gray-100 text-gray-800 pr-8 break-words leading-tight">{party.name}</div>
                  
                  <PositionSliders
                    axes={axes}
                    positions={party.basePositions}
                    id={party.id}
                    colorClass="accent-gray-700"
                    onPositionChange={updatePartyPosition}
                  />

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options Tab content */}
        {simTabs === 'options' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Electoral System Selection */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2.5 block">Electoral System</h2>
              <select
                value={activeSystem}
                onChange={(e) => setActiveSystem(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="plurality">Plurality (SNTV/FPTP)</option>
                <option value="listpr">Regional PR (open list)</option>
                <option value="mmp">Mixed-Member Proportional (MMP)</option>
                <option disabled value="stv">To-do: Single Transferable Vote</option>
              </select>
            </div>

            {/* Simulation Variance Controls */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm mt-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Deviations</h3>
                <span className="text-xs font-semibold text-gray-500">via Normal Distribution</span>
              </div>
              
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                    <span>Local Party Division</span>
                    <span className="text-indigo-600">{Math.round(candidateFuzzLevel * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="0.5" step="0.01" 
                    value={candidateFuzzLevel} onChange={(e) => setCandidateFuzzLevel(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                    <span>Voter Stochasticity</span>
                    <span className="text-emerald-600">{Math.round(voterFuzzLevel * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="0.5" step="0.01" 
                    value={voterFuzzLevel} onChange={(e) => setVoterFuzzLevel(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Buttons (Pinned Bottom) */}
      <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3 shrink-0">
        <button 
          onClick={() => { setNationLocked(false); setResults(null); }}
          className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          Unlock Map
        </button>

        <button 
          onClick={runSimulation}
          disabled={loading || parties.length === 0}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold text-base hover:bg-green-700 disabled:bg-gray-300 shadow-sm transition-colors"
        >
          {loading ? "Calculating..." : "Run Election"}
        </button>
      </div>
    </div>
  );
}