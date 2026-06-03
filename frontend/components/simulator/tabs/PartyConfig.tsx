'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";
import { DEFAULT_PARTY_COLOR } from "@/utils/constants";
import PositionSliders from "@/components/PositionSliders";

export default function PartyConfig() {
  const {
    axes, parties,
    addParty, removeParty, updatePartyPosition,
  } = useSimulationStore();

  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyColor, setNewPartyColor] = useState(DEFAULT_PARTY_COLOR);


  const handleAddParty = () => {
    if (!newPartyName.trim()) return;

    const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {}); // default value: 0

    addParty({
      id: `p_${Date.now()}`,
      name: newPartyName,
      color: newPartyColor,
      basePositions: defaultPositions
    });

    setNewPartyName("");
  };

  return (

    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Add Party Form */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Create New Party</label>

        <div className="flex items-center gap-2.5">
          <input
            type="color" value={newPartyColor} onChange={(e) => setNewPartyColor(e.target.value)}
            className="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer shrink-0 hover:ring-2 hover:ring-blue-400"
            title="Party Color"
          />
          <input
            type="text" placeholder="Party Name..." value={newPartyName} onChange={(e) => setNewPartyName(e.target.value)}
            className="flex-1 min-w-0 py-1.5 px-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            onClick={handleAddParty} disabled={!newPartyName.trim()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded font-bold text-sm transition-colors hover:bg-blue-700 disabled:bg-gray-300 whitespace-nowrap shadow-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* List of parties */}
      <div className="flex flex-col gap-3">
        {parties.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-5 text-center text-sm text-gray-500 font-medium">
            No parties created yet.
          </div>
        )}

        {parties.map((party) => (
          <div key={party.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative shrink-0" style={{ borderLeft: `4px solid ${party.color}` }}>
            
            {/* Compact Header (No Border) */}
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold text-gray-800 text-base truncate pr-4">{party.name}</div>
              <button
                onClick={() => removeParty(party.id)}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-sm shrink-0"
                title="Delete Party"
              >
                ✕
              </button>
            </div>

            <PositionSliders
              axes={axes}
              positions={party.basePositions}
              id={party.id}
              colorClass="accent-gray-700"
              onPositionChange={updatePartyPosition}
            />
          </div>
        ))}
      </div>
    </div>
  )
}