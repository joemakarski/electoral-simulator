'use client';

import { useSimulationStore } from "@/store/simulationStore";
import { CandidateResult } from "@/types";

export default function DistrictResults() {
  const { 
    grid, 
    selectedDistrictId, 
    setSelectedDistrictId,
    demographicProfiles,
    candidates,
    parties,
    results
  } = useSimulationStore();

  // Get the relevant district to inspect using the store
  const district = grid.find(t => t.id === selectedDistrictId);
  if (!district || !district.isActive) return null;

  const districtKey = `d${district.id}`;
  const localCandidates = candidates.filter(c => c.district_id === districtKey);

  const hasResults = !!(
    results && 
    results.results && 
    results.results.local_votes && 
    results.results.local_votes[districtKey]
  );

  // If there are results, get the candidate performances and winners
  let candidatePerformance: CandidateResult[] = [];
  let districtWinners: string[] = [];

  if (hasResults) {
    const districtData = results.results.local_votes[districtKey] as Record<string, number>;
    const values = Object.values(districtData) as number[];

    const totalVotes = values.reduce((sum, v) => sum + v, 0) || 1;
    
    districtWinners = results.winners?.[districtKey] || [];

    // Map the candidates to their performance data and sort them descending by votes
    candidatePerformance = localCandidates.map(cand => {
      const votes = districtData?.[cand.id] || 0;
      const percentage = (votes / totalVotes) * 100;

      const party = parties.find(p => p.id === cand.party_id);
      
      return {
        ...cand,
        votes,
        percentage,
        partyName: party?.name || "Independent",
        color: party?.color || "#9ca3af",
        isWinner: districtWinners.includes(cand.id)
      };
    }).sort((a, b) => b.votes - a.votes);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200 animate-fade-in ring-2 ring-indigo-50">
  
    {/* Header */}
    <div className="flex justify-between items-start border-b border-gray-100 pb-5 mb-5">
      <div>
        <h2 className="text-2xl font-black text-gray-800 break-words max-w-[250px] leading-tight mb-1">{district.name}</h2>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          {district.num_seats} Seat{district.num_seats > 1 ? 's' : ''}
        </span>
      </div>
      <button 
        onClick={() => setSelectedDistrictId(null)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-sm font-bold transition-colors"
      >
        Close
      </button>
    </div>

    {/* Demographic Editor */}
    <div className="mb-6">
      <label className="text-xs font-bold text-gray-500 uppercase mb-2.5 block">Voter Makeup</label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(district.demographics || {}).map(([pId, pct]) => {
          const profile = demographicProfiles.find(p => p.id === pId);
          if (!profile || pct === 0) return null;
          return (
            <span 
              key={pId} 
              className="text-xs font-bold px-2.5 py-1.5 rounded-md border shadow-sm" 
              style={{ 
                backgroundColor: `${profile.color}15`, 
                color: profile.color, 
                borderColor: `${profile.color}40` 
              }}
            >
              {profile.name}: {pct}%
            </span>
          )
        })}
      </div>
    </div>

    {/* Render list or chart based on whether there are results */}
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">
        {hasResults ? "Election Results" : "Candidates on Ballot"}
      </label>
      
      {!hasResults ? (
        // Pre-election view
        localCandidates.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 font-medium">
            No candidates generated yet. Run the simulation to spawn candidates.
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {localCandidates.map(cand => {
              const party = parties.find(p => p.id === cand.party_id);
              return (
                <div key={cand.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                  <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: party?.color || "#ccc" }} />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{cand.name}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{party?.name || "Independent"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // Post-election view
        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {candidatePerformance.map((cand) => {
            const party = parties.find(p => p.id === cand.party_id);
            return (
              <div 
                key={cand.id} 
                className={`p-4 border rounded-lg shadow-sm transition-all ${
                  cand.isWinner ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-gray-200'
                }`}
                style={{ borderLeft: "6px solid", borderLeftColor: party?.color || "#ccc" }}
              >
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col">
                    <div className="font-bold text-gray-800 flex items-center gap-2 mb-0.5">
                      {cand.name}
                      {cand.isWinner && (
                        <span className="text-[12px] text-amber-700 py-0.5 rounded-md uppercase tracking-wider font-bold">
                          ✅
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-semibold break-words max-w-[400px]">{cand.partyName}</span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-gray-800 text-sm">{cand.percentage.toFixed(1)}%</span>
                    <span className="text-xs text-gray-500 font-medium">{cand.votes.toLocaleString()} votes</span>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${cand.percentage}%`, backgroundColor: cand.color }} 
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  </div>
  );
}