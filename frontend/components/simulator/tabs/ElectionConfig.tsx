'use client';

import { useSimulationStore } from "@/store/simulationStore";
import { ElectoralSystem } from "@/types";

export default function ElectionConfig() {

  const { 
    activeSystem, setActiveSystem,
    candidateFuzzLevel, setCandidateFuzzLevel,
    voterFuzzLevel, setVoterFuzzLevel,
  } = useSimulationStore()

  const systemDescriptions: Record<string, string> = {
    "plurality": "Voters vote for one candidate. Candidates with the N most votes in each district win, where N is the number of seats.",
    "listpr": "Individual candidate votes determine who within the parties get elected, but seats are split based on the parties' proportions of the vote. ",
    "mmp": "Voters vote for a candidate and party. Party list candidates are added onto the plurality-based district results in a way that can compensate for disproportionality.",
    "stv": "Voters rank the candidates, and the vote is transferred to their next choice if their preferred choice surpasses the quota or is eliminated, until all seats are filled.",
  }

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
    </div>
  )
}