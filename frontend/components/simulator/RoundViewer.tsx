'use client';

import { useState } from 'react';
import { DistrictRound, Candidate, Party } from '@/types';

type RoundViewerProps = {
  rounds: DistrictRound[];
  candidates: Candidate[];
  parties: Party[];
};

export default function RoundViewer({ rounds, candidates, parties }: RoundViewerProps) {
  const [roundIndex, setRoundIndex] = useState(0);

  if (!rounds || rounds.length === 0) return null;

  const safeIndex = Math.min(roundIndex, rounds.length - 1);
  if (roundIndex > rounds.length - 1 && roundIndex !== 0) {
    setRoundIndex(0);
  }

  const currentRound = rounds[safeIndex];
  const isFirstRound = safeIndex === 0;
  const isLastRound = safeIndex === rounds.length - 1;

  const getCandidateMeta = (cId: string) => {
    const cand = candidates.find(c => c.id === cId);
    const party = parties.find(p => p.id === cand?.party_id);
    return {
      name: cand?.name || cId,
      partyName: party?.name || "Independent",
      color: party?.color || "#9ca3af"
    };
  };

  const globalMaxVotes = Math.max(
    ...rounds.flatMap(r =>
        Object.entries(r.tally).map(([cId, v]) => v + (r.transfers[cId] || 0))
    ),
    rounds[0]?.quota || 0
);

  // Time-machine logic to track candidates after they are removed from the active tally
  const getCandidateState = (cId: string) => {
    // Check if they are active in the current round
    if (currentRound.tally[cId] !== undefined) {
      return {
        votes: currentRound.tally[cId],
        status: currentRound.candidate_id === cId ? currentRound.action : 'active',
        transfers: currentRound.transfers[cId] || 0
      };
    }
    
    // If missing, look backward through time to find their final fate
    for (let i = safeIndex; i >= 0; i--) {
      if (rounds[i].candidate_id === cId) {
        return {
          // If eliminated, drop to 0. If elected, drop to the EXACT Quota!
          votes: rounds[i].action === 'eliminated' ? 0 : (rounds[i].action === 'elected' ? (rounds[i].quota || 0) : (rounds[i].tally[cId] || 0)),
          status: rounds[i].action,
          transfers: 0
        };
      }
    }
    
    return { votes: 0, status: 'active', transfers: 0 }; 
  };
  

  return (
    <div className="flex flex-col gap-5">
      {/* Navigation Controls */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm sticky top-0 z-20">
        <button 
          onClick={() => setRoundIndex(prev => Math.max(0, prev - 1))}
          disabled={isFirstRound}
          className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors font-bold text-gray-700"
        >
          ← Prev
        </button>
        
        <div className="text-center flex flex-col">
          <span className="font-bold text-indigo-700 tracking-wide">Round {currentRound.round}</span>
          <div className="text-xs font-bold h-4 flex items-center justify-center mt-0.5">
            {currentRound.action === 'elected' && <span className="text-emerald-600">Elect "{getCandidateMeta(currentRound.candidate_id!).name}"</span>}
            {currentRound.action === 'eliminated' && <span className="text-red-600">Eliminate "{getCandidateMeta(currentRound.candidate_id!).name}"</span>}
          </div>
        </div>

        <button 
          onClick={() => setRoundIndex(prev => Math.min(rounds.length - 1, prev + 1))}
          disabled={isLastRound}
          className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors font-bold text-gray-700"
        >
          Next →
        </button>
      </div>

      {/* Chart Div */}
      <div className="flex flex-col gap-3 relative pt-2">
        {/* Fixed Quota Line */}
        {currentRound.quota && (
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-neutral-300 z-0 flex flex-col items-center pointer-events-none"
            style={{ left: `${(currentRound.quota / globalMaxVotes) * 100}%` }}
          >
            <div className="bg-neutral-300 text-neutral-600 text-[10px] font-bold px-1.5 py-0.5 rounded -mt-3 whitespace-nowrap shadow-sm">
              Quota: {currentRound.quota.toLocaleString()}
            </div>
          </div>
        )}

        {/* Candidate Tally Bars */}
        <div className="z-10 flex flex-col gap-3">
          {candidates.map((cand) => {
            const meta = getCandidateMeta(cand.id);
            const state = getCandidateState(cand.id);
            
            const baseVotes = Math.max(0, state.votes);
            const baseWidth = globalMaxVotes > 0 ? (baseVotes / globalMaxVotes) * 100 : 0;
            const transferWidth = globalMaxVotes > 0 ? (state.transfers / globalMaxVotes) * 100 : 0;
            
            const isEliminated = state.status === 'eliminated';
            const isElected = state.status === 'elected';
            const isTarget = currentRound.candidate_id === cand.id;
            
            const barColor = isEliminated && !isTarget ? '#d1d5db' : meta.color;

            return (
              <div key={cand.id} className={`flex flex-col transition-all duration-500 ${isEliminated && !isTarget ? 'opacity-40 grayscale-[50%]' : 'opacity-100'}`}>
                
                {/* Header Data */}
                <div className="flex justify-between items-end mb-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    {isElected && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black shadow-sm">Elected</span>}
                    {isEliminated && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black shadow-sm">Eliminated</span>}
                    <span className="font-bold text-gray-800">{meta.name}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{meta.partyName || "Independent"}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-gray-700 text-xs">
                    {state.votes.toLocaleString()}
                    {state.transfers > 0 && (
                      <span className="text-emerald-600 text-[11px] bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shadow-sm">
                        +{state.transfers.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Bar chart */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner flex">
                  
                  {/* Base voters */}
                  <div 
                    className="h-full transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${baseWidth}%`, 
                      backgroundColor: barColor 
                    }} 
                  />

                  {/* Incoming transfers */}
                  <div 
                    className="h-full transition-all duration-500 ease-out relative opacity-20" 
                    style={{ 
                      width: `${transferWidth}%`, 
                      backgroundColor: barColor 
                    }}
                  >
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}