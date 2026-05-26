'use client';

import { useState } from "react";
import { useSimulationStore } from "@/store/simulationStore";

export default function AxesConfig() {
  const { axes, addAxis, removeAxis } = useSimulationStore();
  const [newAxisName, setNewAxisName] = useState("");

  const handleAddAxis = () => {
    const trimmed = newAxisName.trim();
    if (!trimmed) return;
    
    if (axes.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      alert("This axis already exists!"); // TODO: better UX
      return;
    }

    addAxis(trimmed);
    setNewAxisName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAxis();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-bold text-gray-800">Axes Editor</h2>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Positions</span>
      </div>

      <p className="text-xs text-gray-500 mb-4">Add a new position spectrum.</p>

      {/* Input Form */}
      <div className="flex items-center gap-3 mb-5">
        <input 
          type="text" 
          placeholder="e.g. Environment..."
          value={newAxisName}
          onChange={(e) => setNewAxisName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2.5 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
        />
        <button 
          onClick={handleAddAxis}
          disabled={!newAxisName.trim()}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Axes Chips */}
      <div className="flex flex-wrap gap-2">
        {axes.map((axis) => (
          <div 
            key={axis} 
            className="flex items-center bg-gray-50 border border-gray-200 text-gray-700 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm"
          >
            <span>{axis}</span>
            <button 
              onClick={() => removeAxis(axis)}
              disabled={axes.length <= 1}
              className="ml-3 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              title={axes.length <= 1 ? "Cannot delete the last axis" : "Remove axis"}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}