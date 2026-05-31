'use client';

import { useState } from "react";

import { useSimulationStore } from "@/store/simulationStore";
import { API_URL } from "@/utils/constants";
import { buildSimulationPayload } from "@/utils/buildPayload";

import PartyConfig from "@/components/simulator/tabs/PartyConfig";
import ElectionConfig from "@/components/simulator/tabs/ElectionConfig";

export default function SimulationControls() {
  const { 
    grid, axes, parties,
    generateCandidates, 
    activeSystem, 
    setResults, setNationLocked, demographicProfiles,
    voterFuzzLevel
  } = useSimulationStore();

  const [loading, setLoading] = useState(false);

  const [simTab, setSimTab] = useState<'parties' | 'election'>('parties');


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
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
    

        {/* Tab Navigation */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button 
            onClick={() => setSimTab('parties')}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              simTab === 'parties' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            4. Parties
          </button>
          <button 
            onClick={() => setSimTab('election')}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              simTab === 'election' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            5. Election
          </button>
        </div>


        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px] p-6">
          {simTab === 'parties' && <PartyConfig /> }
          {simTab === 'election' && <ElectionConfig />}
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
    </div>
  );
}