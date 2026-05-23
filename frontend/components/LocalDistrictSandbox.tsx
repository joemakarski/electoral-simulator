'use client';

import { useSimulationStore } from "@/store/simulationStore";

export default function LocalDistrictSandbox() {
  const { 
    grid, 
    selectedDistrictId, 
    setSelectedDistrictId,
    demographicProfiles,
    updateDistrictTile,
    candidates,
    parties
  } = useSimulationStore();

  const district = grid.find(t => t.id === selectedDistrictId);
  if (!district || !district.isActive) return null;

  // Find candidates explicitly assigned to this district
  const localCandidates = candidates.filter(c => c.district_id === `d${district.id}`);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-200 animate-fade-in ring-4 ring-indigo-50">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800">{district.name}</h2>
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            {district.num_seats} Seat{district.num_seats > 1 ? 's' : ''} • Local Race
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
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Assigned Voter Base</label>
        <select 
          value={district.demographicProfileId}
          onChange={(e) => updateDistrictTile(district.id, { demographicProfileId: e.target.value })}
          className="w-full p-3 border rounded-lg font-bold text-gray-800 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="" disabled>Select a demographic profile...</option>
          {demographicProfiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Local Candidates Roster */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Candidates on Ballot</label>
        
        {localCandidates.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No candidates generated yet. Run the simulation to spawn candidates.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
        )}
      </div>

    </div>
  );
}