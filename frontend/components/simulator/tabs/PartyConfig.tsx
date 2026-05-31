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

    <div className="flex flex-col gap-6 animate-fade-in">

      {/* Add Party Form */}
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3">
        <label className="text-sm font-bold text-gray-800">Create New Party</label>

        <div className="flex items-center gap-3">
          <input
            type="color" value={newPartyColor} onChange={(e) => setNewPartyColor(e.target.value)}
            className="w-10 h-10 p-1 border border-gray-300 rounded-md cursor-pointer shrink-0 hover:ring-2 hover:ring-blue-400"
            title="Party Color"
          />
          <input
            type="text" placeholder="Party Name..." value={newPartyName} onChange={(e) => setNewPartyName(e.target.value)}
            className="flex-1 p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            onClick={handleAddParty} disabled={!newPartyName.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 font-bold text-sm transition-colors disabled:bg-gray-300 whitespace-nowrap"
          >
            Add Party
          </button>
        </div>
      </div>

      {/* List of parties */}
      <div className="flex flex-col gap-4">
        {parties.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 font-medium">
            No parties created yet.
          </div>
        )}

        {parties.map((party) => (
          <div key={party.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative shrink-0" style={{ borderLeft: `6px solid ${party.color}` }}>
            <button
              onClick={() => removeParty(party.id)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 font-bold text-lg rounded-md hover:bg-gray-100 transition-colors"
              title="Delete Party"
            >
              ✕
            </button>

            <div className="font-bold text-lg mb-4 pb-3 border-b border-gray-100 text-gray-800 pr-8 break-words leading-tight">{party.name}</div>

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