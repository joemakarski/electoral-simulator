'use client';

import { useSimulationStore } from "@/store/simulationStore";

export default function LocalDistrictSandbox() {
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
  let candidatePerformance: any[] = [];
  let districtWinners: string[] = [];

  if (hasResults) {
    const districtData = results.results.local_votes[districtKey];
    const totalVotes = demographicProfiles.find(p => p.id === district.demographicProfileId)?.populationPerTile ?? 1
    
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
    <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-200 animate-fade-in ring-4 ring-indigo-50">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800">{district.name}</h2>
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            {district.num_seats} Seat{district.num_seats > 1 ? 's' : ''}
          </span>
        </div>
        <button 
          onClick={() => setSelectedDistrictId(null)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm font-bold transition-colors"
        >
          Close
        </button>
      </div>

      {/* Demographic Editor */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
          Demographic type: {
      demographicProfiles.find(p => p.id === district.demographicProfileId)?.name 
      ?? "None"
    }
        </label>
      </div>

      {/* Render list or chart based on whether there are results */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">
          {hasResults ? "Election Results" : "Candidates on Ballot"}
        </label>
        {!hasResults ? (
          // Pre-election view
          localCandidates.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No candidates generated yet. Run the simulation to spawn candidates.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {localCandidates.map(cand => {
                const party = parties.find(p => p.id === cand.party_id);
                return (
                  <div key={cand.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm">
                    <div className="w-4 h-4 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: party?.color || "#ccc" }} />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{cand.name}</span>
                      <span className="text-xs text-gray-500 uppercase">{party?.name || "Independent"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // Post-election view
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {candidatePerformance.map((cand) => {
              const party = parties.find(p => p.id === cand.party_id);
              return (
                <div 
                  key={cand.id} 
                  className={`p-3 border rounded-lg shadow-sm transition-all ${
                    cand.isWinner ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300' : 'bg-white border-gray-200'
                  }`}
                  style={{ borderLeft: "6px solid", color: party?.color || "#ccc" }}
                >
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        {cand.name}
                        {cand.isWinner && (
                          <span className="text-[13px] text-amber-800 py-0.5 rounded uppercase tracking-wider font-bold">
                            ✅
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 uppercase font-semibold">{cand.partyName}</span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-gray-800">{cand.percentage.toFixed(1)}%</span>
                      <span className="text-xs text-gray-500">{cand.votes.toLocaleString()} votes</span>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${cand.percentage}%`, 
                        backgroundColor: cand.color 
                      }} 
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