'use client';

import { useSimulationStore } from "@/store/simulationStore";
import { ElectoralSystem } from "@/types";
import { useState } from "react";


import { API_URL } from "@/utils/constants";
import { buildSimulationPayload } from "@/utils/buildPayload";


export default function ElectionConfig() {

  const { 
    grid, axes, parties,
    generateCandidates, 
    activeSystem, setActiveSystem,
    setResults, setNationLocked, demographicProfiles,
    voterFuzzLevel, setVoterFuzzLevel,
    candidateFuzzLevel, setCandidateFuzzLevel,
  } = useSimulationStore();

  const [loading, setLoading] = useState(false);

  const systemDescriptions: Record<string, string> = {
    "plurality": "Voters vote for one candidate. Candidates with the N most votes in each district win, where N is the number of seats.",
    "listpr": "Individual candidate votes determine who within the parties get elected, but seats are split based on the parties' proportions of the vote. ",
    "mmp": "Voters vote for a candidate and party. Party list candidates are added onto the plurality-based district results in a way that can compensate for disproportionality.",
    "stv": "Voters rank the candidates, and the vote is transferred to their next choice if their preferred choice surpasses the quota or is eliminated, until all seats are filled.",
  }

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
      // console.log(payload)
      // console.log(data)
      setResults(data);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
            
      {/* Electoral System Selection */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2.5 block">Electoral System</h2>
        <select
          value={activeSystem}
          onChange={(e) => setActiveSystem((e.target.value) as ElectoralSystem)}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
        >
          <option value="plurality">Plurality (SNTV/FPTP)</option>
          <option value="listpr">Regional PR (open list)</option>
          <option value="mmp">Mixed-Member Proportional (MMP)</option>
          <option value="stv">Single Transferable Vote (STV)</option>
          <option value="2rs" disabled>To-do: Two Round System/Runoff</option>
          <option value="block" disabled>To-do: Plurality (Block/FPTP)</option>
          <option value="approval" disabled>To-do: Approval</option>
          <option value="lottery" disabled>To-do: Lottery</option>

        </select>
        <p className="text-xs text-gray-500 mt-2 leading-snug mt-2">
          {systemDescriptions[activeSystem] || "An electoral system can affect the way voters vote, and how ballots are counted."}
        </p>
      </div>

      {/* Simulation Variance Controls */}
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Deviations</h3>
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
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Controls how much individual candidates within the same party can deviate from the party's base positions. <br></br>
              Higher values introduce a wider uniform spread.
            </p>
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
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Controls random variation in voter ideology. <br></br>
              Higher values apply a wider normal-distribution deviation to each voter block.
            </p>
          </div>
        </div>
      </div>

      {/* Key Buttons (Pinned Bottom) */}
      <div className="flex gap-3 shrink-0">
        <button 
          onClick={() => { setNationLocked(false); setResults(null); }}
          className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold 
                    hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
        >
          Unlock Map
        </button>

        <button 
          onClick={runSimulation}
          disabled={loading || parties.length === 0}
          className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg 
                    hover:bg-green-700 disabled:bg-gray-300 shadow-md transition-colors"
        >
          {loading ? "Calculating..." : "Run Election"}
        </button>

      </div>

    </div>
  )
}