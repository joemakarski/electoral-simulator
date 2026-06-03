'use client';

import { useSimulationStore } from "@/store/simulationStore";
import { CandidateResult } from "@/types";
import RoundViewer from "@/components/simulator/RoundViewer"

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

  const stvRounds = results?.results?.rounds?.[districtKey] || null;

  const hasResults = !!(
    results && 
    results.results && 
    results.results.local_votes && 
    results.results.local_votes[districtKey]
  );

  // If there are results, get the candidate performances and winners
  let candidatePerformance: CandidateResult[] = [];

  if (hasResults && !stvRounds) {
    const districtData = results.results.local_votes[districtKey] as Record<string, number>;
    const values = Object.values(districtData) as number[];
    const totalVotes = values.reduce((sum, v) => sum + v, 0) || 1;
    
    const districtWinners = results.winners?.[districtKey] || [];

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

  // Calculate maximum local votes for non-STV relative scaling
  const maxLocalVotes = candidatePerformance.length > 0 
    ? Math.max(...candidatePerformance.map(c => c.votes)) 
    : 1;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200 animate-fade-in ring-2 ring-indigo-50 flex flex-col">
  
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-5 mb-5 shrink-0">
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
      <div className="mb-6 shrink-0">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block shrink-0">
          {!hasResults ? "Candidates on Ballot" : (stvRounds ? "Transfer Timeline" : "Election Results")}
        </label>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {!hasResults ? (
            /* Pre-election view */
            localCandidates.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 font-medium">
                No candidates generated yet. Run the simulation to spawn candidates.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {localCandidates.map(cand => {
                  const party = parties.find(p => p.id === cand.party_id);
                  return (
                    <div key={cand.id} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1.5 text-sm">
                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: party?.color || "#ccc" }} />
                        <span className="font-bold text-gray-800">{cand.name}</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase">{party?.name || "Independent"}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 shadow-inner" />
                    </div>
                  );
                })}
              </div>
            )
          ) : stvRounds && stvRounds.length > 0 ? (
            /* Rounds if STV */
            <RoundViewer 
              rounds={stvRounds} 
              candidates={localCandidates} 
              parties={parties} 
            />
          ) : (
            /* Compact in-line mode */
            <div className="flex flex-col gap-4">
              {candidatePerformance.map((cand) => {
                const barWidth = maxLocalVotes > 0 ? (cand.votes / maxLocalVotes) * 100 : 0;
                
                return (
                  <div key={cand.id} className="flex flex-col">
                    {/* Header Data Row */}
                    <div className="flex justify-between items-end mb-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        {cand.isWinner && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black shadow-sm">
                            Elected
                          </span>
                        )}
                        <span className="font-bold text-gray-800">{cand.name}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase">{cand.partyName}</span>
                      </div>
                      
                      {/* Metric Layout Alignment */}
                      <div className="flex items-center gap-2 font-bold text-gray-700 text-xs">
                        <span>{cand.percentage.toFixed(1)}%</span>
                        <span className="text-gray-400 font-normal">({cand.votes.toLocaleString()} votes)</span>
                      </div>
                    </div>
                    
                    {/* Compact Bar Construction */}
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className="h-full transition-all duration-1000 ease-out" 
                        style={{ width: `${barWidth}%`, backgroundColor: cand.color }} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}