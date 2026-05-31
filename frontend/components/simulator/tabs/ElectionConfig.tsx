'use client';

import { useSimulationStore } from "@/store/simulationStore";

export default function ElectionConfig() {
  
  //         {simTabs === 'options' && (

  const { 
    activeSystem, setActiveSystem,
    candidateFuzzLevel, setCandidateFuzzLevel,
    voterFuzzLevel, setVoterFuzzLevel,
  } = useSimulationStore()

  return (
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
  )
}