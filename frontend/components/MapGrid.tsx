'use client';

import { useSimulationStore } from '@/store/simulationStore';

export default function MapGrid() {
  const { 
    grid, 
    parties,
    candidates,
    isNationLocked,
    selectedDistrictId, 
    setSelectedDistrictId,
    toggleTileActive,
    results
  } = useSimulationStore();

  // Helper to determine the classes and inline styles for each individual tile
  const getTileProps = (tile: any) => {
    // Inactive land is always an empty box
    if (!tile.isActive) {
      return { 
        className: "bg-orange-100/60 text-gray-300 border-dashed border-gray-200 cursor-pointer hover:bg-orange-200/40", 
        style: {},
        content: "" 
      };
    }

    const isSelected = selectedDistrictId === tile.id;
    const hasSelection = selectedDistrictId !== null;

    // If an election has run, paint using winning party colors
    if (results && results.winners) {
      const districtKey = `d${tile.id}`;
      const winnersList = results.winners[districtKey] as string[] | undefined;
      
      if (winnersList && winnersList.length > 0) {
        const primaryWinnerId = winnersList[0];
        const winnerMeta = candidates.find(c => c.id === primaryWinnerId);
        const winningParty = parties.find(p => p.id === winnerMeta?.party_id);

        if (winningParty) {
          let stateClass = "text-white font-black drop-shadow shadow-md";
          if (isSelected) stateClass += " ring-4 ring-black/70 scale-95 z-10";
          else if (hasSelection) stateClass += " opacity-25 grayscale-[40%] scale-95";

          return {
            className: stateClass,
            style: { backgroundColor: winningParty.color },
            content: tile.num_seats
          };
        }
      }
    }

    // Before simulation, show standard active district styling
    let baseClass = "bg-orange-300/75 text-black font-bold shadow-md transition-all";
    if (isSelected) {
      baseClass += " ring-4 ring-orange-300 scale-95 z-10";
    } else if (hasSelection) {
      baseClass += " opacity-60 scale-95 grayscale-[20%]";
    }

    return { 
      className: baseClass, 
      style: {},
      content: tile.num_seats
    };
  };

  // Click Handler changes behavior natively based on the simulation phase
  const handleTileClick = (tileId: number) => {
    const tile = grid.find(t => t.id === tileId);
    if (!tile) return;

    if (!isNationLocked) {
      // Pre-lock: Creating and selecting
      if (!tile.isActive) {
        toggleTileActive(tileId); // Turn it on
        setSelectedDistrictId(tileId); // Auto-select it for editing
      } else {
        // If already active, just select it
        setSelectedDistrictId(tileId);
      }
    } else {
      // Post-lock: inspect active districts
      if (tile.isActive) {
        setSelectedDistrictId(selectedDistrictId === tileId ? null : tileId);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`grid grid-cols-10 gap-1.5 p-3 bg-orange-50 border-4 rounded-xl shadow-inner w-fit select-none ${
          isNationLocked ? "border-gray-500" : "border-gray-300"
        }`}
      >
        {grid.map((tile) => {
          const props = getTileProps(tile);
          return (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-sm transition-all duration-200 ${props.className}`}
              style={props.style}
              title={tile.isActive ? `${tile.name} (${tile.num_seats} seats)` : "Empty Land"}
            >
              {props.content}
            </div>
          );
        })}
      </div>
      
      {/* Contextual status */}
      <div className="mt-4 text-sm text-gray-500 font-bold px-3 py-1.5">
        {!isNationLocked ? (
          <span className="text-neutral-400">Click tiles to create and edit districts</span>
        ) : selectedDistrictId !== null ? (
          <span className="text-orange-400">Inspecting District {selectedDistrictId + 1}</span>
        ) : (
          <span className="text-neutral-600">Click an active district to inspect</span>
        )}
      </div>
    </div>
  );
}