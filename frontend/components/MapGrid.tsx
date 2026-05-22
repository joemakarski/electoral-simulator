'use client';

import { useSimulationStore } from '@/store/simulationStore';

// A simple distinct color palette for our dynamic districts
const PALETTE = [
  "bg-blue-500", "bg-red-500", "bg-green-500", 
  "bg-purple-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500"
];

export default function MapGrid() {
  const { grid, districts, updateTileDistrict, activeBrush, isNationLocked } = useSimulationStore();

  // Helper to figure out what color a tile should be
  const getTileColor = (districtId: string | null) => {
    if (!districtId) return "bg-gray-200"; // Unassigned land
    
    const index = districts.findIndex(d => d.id === districtId);
    if (index === -1) return "bg-gray-200"; // Fallback if district deleted
    
    return PALETTE[index % PALETTE.length];
  };

  const handleTileClick = (tileId: number) => {
    // Prevent painting if the nation is locked!
    if (isNationLocked) return;
    updateTileDistrict(tileId, activeBrush);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`grid grid-cols-10 gap-1 p-2 bg-gray-100 border-4 rounded-lg shadow-inner w-fit ${
          isNationLocked ? "border-gray-400 cursor-default" : "border-blue-300 cursor-pointer"
        }`}
      >
        {grid.map((tile) => (
          <div
            key={tile.id}
            onMouseDown={() => handleTileClick(tile.id)}
            onMouseEnter={(e) => {
              // Enable drag-to-paint (if left mouse button is held down)
              if (e.buttons === 1) handleTileClick(tile.id);
            }}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-sm transition-colors duration-150 ${getTileColor(tile.district_id)} ${
              !isNationLocked && "hover:brightness-90"
            }`}
          />
        ))}
      </div>
      
      {/* Small status indicator */}
      <div className="mt-4 text-sm text-gray-500 font-medium">
        {isNationLocked 
          ? "Geography Locked. Map is in View-Only mode." 
          : "Click and drag to paint districts."}
      </div>
    </div>
  );
}