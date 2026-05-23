'use client';

import { useSimulationStore } from '@/store/simulationStore';

export default function ResultsDashboard() {
  const { results, candidates, grid, parties } = useSimulationStore();

  // If there are no results yet, don't render anything
  if (!results) return null;

  // 1. Data lookups as objects
  const partyMetaLookup = Object.fromEntries(parties.map(p => [p.id, { name: p.name, color: p.color }]));
  const candidateLookup = Object.fromEntries(candidates.map(c => [c.id, { name: c.name, party_id: c.party_id }]));
  const districtLookup = Object.fromEntries(
    grid.filter(t => t.isActive).map(t => [`d${t.id}`, t.name])
  );
  districtLookup["NATIONAL_LIST"] = "National Top-Up List";

  // 2. Tally seats by party
  const seatsByParty: Record<string, number> = {};
  Object.entries(results.winners).forEach(([_, winnersList]) => {
    (winnersList as string[]).forEach((wId) => {
      const pId = candidateLookup[wId]?.party_id || "UNKNOWN";
      seatsByParty[pId] = (seatsByParty[pId] || 0) + 1;
    });
  });

  // 3. Calculate totals for percentages
  const totalSeats = results.stats.total_parliament_size;
  const nationalVotes: Record<string, number> = results.results.national_party_votes;
  const totalVotes = Object.values(nationalVotes).reduce((a, b) => a + b, 0);

  // Get a unique list of all parties that either got votes or won seats
  const allPartyIds = Array.from(new Set([...Object.keys(nationalVotes), ...Object.keys(seatsByParty)]));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Election Results</h2>

      {/* Warning Notes Section */}
      {results.stats.notes && results.stats.notes.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
          <h3 className="text-amber-800 font-bold mb-2">Notes:</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {results.stats.notes.map((note: string, idx: number) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Proportionality Comparison Section */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">National Proportionality</h3>
        <div className="flex flex-col gap-6">
          {allPartyIds.map((pId) => {
            const votes = nationalVotes[pId] || 0;
            const seats = seatsByParty[pId] || 0;
            
            const votePct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const seatPct = totalSeats > 0 ? (seats / totalSeats) * 100 : 0;
            
            // Fallback for unknown parties
            const pMeta = partyMetaLookup[pId] || { name: pId, color: "#9ca3af" };

            return (
              <div key={pId} className="flex flex-col md:flex-row gap-2 md:gap-6 md:items-center">
                <div 
                  className="md:w-1/3 lg:w-1/4 font-bold text-gray-700 truncate" 
                  title={pMeta.name}
                >
                  {pMeta.name}
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  {/* Vote Share Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Popular Vote</span>
                      <span>{votePct.toFixed(1)}% ({votes.toLocaleString()})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full opacity-70 transition-all duration-500" 
                        style={{ width: `${votePct}%`, backgroundColor: pMeta.color }}
                      ></div>
                    </div>
                  </div>

                  {/* Seat Share Bar */}
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Seats Won</span>
                      <span>{seatPct.toFixed(1)}% ({seats} seats)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${seatPct}%`, backgroundColor: pMeta.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local District Winners Section */}
      <div>
        <h3 className="text-lg font-bold mb-4 border-b pb-2">District Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(results.winners).map(([dId, winnersList]) => {
            const wList = winnersList as string[];
            if (wList.length === 0) return null;

            return (
              <div key={dId} className="p-4 border rounded bg-gray-50 shadow-sm hover:shadow transition-shadow">
                <h4 className="font-bold text-gray-700 mb-3">{districtLookup[dId] || dId}</h4>
                <div className="flex flex-col gap-2">
                  {wList.map((wId) => {
                    const cMeta = candidateLookup[wId];
                    const pMeta = partyMetaLookup[cMeta?.party_id] || { name: "Independent", color: "#9ca3af" };
                    
                    return (
                      <div key={wId} className="flex items-center gap-3 text-sm bg-white p-2 border rounded">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm shrink-0" 
                          style={{ backgroundColor: pMeta.color }}
                        ></div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{cMeta?.name || wId}</span>
                          <span className="text-gray-500 text-xs">{pMeta.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}