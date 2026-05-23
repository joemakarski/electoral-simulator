'use client';

import { useSimulationStore } from '@/store/simulationStore';

// Districts in muted colours
const DISTRICT_PALETTE = [
  "bg-slate-400", "bg-mist-400", "bg-zinc-400", 
  "bg-mauve-400", "bg-olive-400"
];

export default function MapGrid() {
  const { 
    grid, 
    districts, 
    demographicProfiles,
    updateTileDistrict, 
    updateTileDemographic,
    activeBrush, 
    activeDemographicBrush,
    brushMode,
    isNationLocked 
  } = useSimulationStore();

  // Helper to figure out what color a tile should be
  const getTileStyle = (tile: any) => {
    // When locked, show clean map background
    if (isNationLocked) {
      if (!tile.district_id) return { className: "bg-gray-100 opacity-40" };
      const idx = districts.findIndex(d => d.id === tile.district_id);
      return { className: `${DISTRICT_PALETTE[idx % DISTRICT_PALETTE.length]} opacity-50` };
    }

    // Context-dependent colouring
    if (brushMode === "district") {
      if (!tile.district_id) return { className: "bg-gray-200" };
      const idx = districts.findIndex(d => d.id === tile.district_id);
      return { className: idx === -1 ? "bg-gray-200" : DISTRICT_PALETTE[idx % DISTRICT_PALETTE.length] };
    } else {
      // Use explicit hex codes from the profile
      const profile = demographicProfiles.find(p => p.id === tile.demographicProfileId);
      return { 
        className: "", 
        style: { backgroundColor: profile ? profile.color : "#e5e7eb" } 
      };
    }
  };

  const handleTileClick = (tileId: number) => {
    if (isNationLocked) return;
    
    if (brushMode === "district") {
      updateTileDistrict(tileId, activeBrush);
    } else {
      updateTileDemographic(tileId, activeDemographicBrush);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`grid grid-cols-10 gap-1 p-2 bg-gray-50 border-4 rounded-lg shadow-inner w-fit ${
          isNationLocked ? "border-gray-300 cursor-default" : "border-purple-300 cursor-pointer"
        }`}
      >
        {grid.map((tile) => {
          const visualProps = getTileStyle(tile);
          return (
            <div
              key={tile.id}
              onMouseDown={() => handleTileClick(tile.id)}
              onMouseEnter={(e) => { if (e.buttons === 1) handleTileClick(tile.id); }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-sm transition-all duration-150 border border-black/5 ${visualProps.className} ${
                !isNationLocked && "hover:scale-95 hover:brightness-95"
              }`}
              style={visualProps.style}
            />
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">
        {isNationLocked 
          ? "Map Locked (View Mode)" 
          : `Active Canvas: Editing ${brushMode === "district" ? "District Borders" : "Demographics"}`}
      </div>
    </div>
  );
}