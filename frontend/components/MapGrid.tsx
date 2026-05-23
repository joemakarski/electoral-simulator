'use client';

import { useSimulationStore } from '@/store/simulationStore';

// Districts in muted colours
const DISTRICT_PALETTE = [
  "bg-slate-400", "bg-mist-400", "bg-zinc-400", 
  "bg-mauve-400", "bg-olive-400"
];

export default function MapGrid() {
  const { 
    grid, districts, 
    updateTileDistrict, 
    activeBrush, 
    brushMode,
    isNationLocked,
    selectedDistrictId, setSelectedDistrictId 
  } = useSimulationStore();

  const getTileStyleAndClass = (tile: any) => {
    if (!tile.district_id) return { className: "bg-gray-100", style: {} };
    
    const idx = districts.findIndex(d => d.id === tile.district_id);
    const baseColorClass = idx === -1 ? "bg-gray-200" : DISTRICT_PALETTE[idx % DISTRICT_PALETTE.length];

    // Highlight logic for "Inspect" mode
    if (brushMode === "inspect" || isNationLocked) {
      if (selectedDistrictId) {
        // If a district is selected, highlight it and dim the rest
        if (tile.district_id === selectedDistrictId) {
          return { className: `${baseColorClass} shadow-inner scale-95 ring-2 ring-black/20 z-10`, style: {} };
        } else {
          return { className: `${baseColorClass} opacity-30 grayscale-[50%]`, style: {} };
        }
      }
    }

    // Default colorful map
    return { className: baseColorClass, style: {} };
  };

  const handleTileClick = (tileId: number) => {
    if (isNationLocked) return;
    
    const tile = grid.find(t => t.id === tileId);
    
    if (brushMode === "district") {
      updateTileDistrict(tileId, activeBrush);
    } else if (brushMode === "inspect") {
      // In inspect mode, clicking a tile selects its district
      setSelectedDistrictId(tile?.district_id || null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`grid grid-cols-10 gap-1 p-2 bg-gray-50 border-4 rounded-lg shadow-inner w-fit ${
          isNationLocked ? "border-gray-300" : "border-indigo-300"
        }`}
      >
        {grid.map((tile) => {
          const visualProps = getTileStyleAndClass(tile);
          return (
            <div
              key={tile.id}
              onMouseDown={() => handleTileClick(tile.id)}
              onMouseEnter={(e) => { 
                // Only allow drag-to-paint in district mode
                if (e.buttons === 1 && brushMode === "district") handleTileClick(tile.id); 
              }}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-sm transition-all duration-300 border border-black/5 ${visualProps.className} ${
                brushMode === "inspect" ? "cursor-pointer hover:scale-95" : "cursor-crosshair hover:brightness-90"
              }`}
              style={visualProps.style}
            />
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">
        {isNationLocked 
          ? "Map Locked (View Results)" 
          : `Active Mode: ${brushMode === "district" ? "Drawing Borders" : "Inspecting Districts"}`}
      </div>
    </div>
  );
}