'use client';

import { useEffect } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { DistrictTile } from '@/types';

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

  useEffect(() => {
    // Shortcut for deleting district
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isNationLocked && selectedDistrictId !== null) {
        
        // Safety check for input boxes
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
          return;
        }

        // listen for Backspace or Delete
        if (e.key === 'Backspace' || e.key === 'Delete') {
          toggleTileActive(selectedDistrictId);
          setSelectedDistrictId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDistrictId, isNationLocked, toggleTileActive, setSelectedDistrictId]);

  // Helper to determine the classes and inline styles for each individual tile
  const getTileProps = (tile: DistrictTile) => {
    // Inactive land is always a content-less box
    if (!tile.isActive) {
      const base = "bg-orange-100/60 text-gray-300 border-dashed border-gray-200";
      const hover = isNationLocked ? "" : "cursor-pointer hover:bg-orange-200/50"
      return { 
        className: `${base} ${hover}`, 
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
        // Tally the colors of the winning candidates
        const colorTally: Record<string, number> = {};
        winnersList.forEach(wId => {
          const winnerMeta = candidates.find(c => c.id === wId);
          const winningParty = parties.find(p => p.id === winnerMeta?.party_id);
          const color = winningParty?.color || "#9ca3af"; // Fallback to gray for independents
          
          colorTally[color] = (colorTally[color] || 0) + 1;
        });

        // Build the CSS linear-gradient string with hard stops
        const totalWinners = winnersList.length;
        let gradientStops: string[] = [];
        let currentPct = 0;

        // Sort by seat count descending so the largest party is the primary color
        const sortedColors = Object.keys(colorTally).sort((a, b) => colorTally[b] - colorTally[a]);

        sortedColors.forEach(color => {
          const sharePct = (colorTally[color] / totalWinners) * 100;
          const nextPct = currentPct + sharePct;
          
          // Add hard stops for crisp stripes: "color start%, color end%"
          gradientStops.push(`${color} ${currentPct}%`, `${color} ${nextPct}%`);
          currentPct = nextPct;
        });

        // Apply gradient if multiple colors, otherwise just use a solid background color
        const dynamicStyle = sortedColors.length > 1 
          ? { backgroundImage: `linear-gradient(135deg, ${gradientStops.join(', ')})` }
          : { backgroundColor: sortedColors[0] };

        // 3. Apply selection states
        let stateClass = "text-white font-black drop-shadow shadow-md cursor-pointer";
        if (isSelected) stateClass += " ring-4 ring-black/70 scale-95 z-10";
        else if (hasSelection) stateClass += " opacity-25 grayscale-[40%] scale-95";

        return {
          className: stateClass,
          style: dynamicStyle,
          content: tile.num_seats
        };
      }
    }

    // Before simulation, show standard active district styling
    let baseClass = "bg-orange-300/75 text-black font-bold shadow-md transition-all cursor-pointer";
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
  const handleTileClick = (tileId: string) => {
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
        className={`grid grid-cols-10 gap-0.5 sm:gap-1.5 p-1 sm:p-3 bg-orange-50 border-4 rounded-xl shadow-inner w-[256px] sm:w-[450px] select-none ${
          isNationLocked ? "border-gray-500" : "border-gray-300"
        }`}
      >
        {grid.map((tile) => {
          const props = getTileProps(tile);
          return (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={`w-full aspect-square rounded sm:rounded-lg flex items-center justify-center text-[10px] sm:text-sm transition-all duration-200 ${props.className}`}
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
          <span className="text-neutral-400">Click tiles to create and edit districts. Delete using backspace.</span>
        ) : selectedDistrictId !== null ? (
          <span className="text-indigo-600">Inspecting District {Number(selectedDistrictId) + 1}</span>
        ) : (
          <span className="text-neutral-600"> Click an active district to inspect it.</span>
        )}
      </div>
    </div>
  );
}