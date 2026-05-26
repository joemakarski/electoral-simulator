'use client';

import { useSimulationStore } from "@/store/simulationStore";

export default function DistrictEditor() {
  const {
    grid,
    selectedDistrictId,
    updateDistrictTile,
    demographicProfiles,
    isNationLocked,
    setNationLocked,
    toggleTileActive,
    setSelectedDistrictId
  } = useSimulationStore();

  // Find the currently selected tile
  const selectedTile = grid.find(t => t.id === selectedDistrictId);

  // Count active districts to ensure we have at least one before locking
  const activeDistrictsCount = grid.filter(t => t.isActive).length;

  // Check district demographic percentages sum to 100%
  const invalidDistricts = grid.filter(t => {
    if (!t.isActive) return false;
    const sum = Object.values(t.demographics || {}).reduce((a, b) => a + b, 0)
    return sum !== 100
  })

  const isMapReady = activeDistrictsCount > 0 && invalidDistricts.length === 0;

  const handleLockNation = () => {
    if (!isMapReady) {
      alert("You must activate at least one district on the map before proceeding."); // TODO: Polish
      return;
    }
    setNationLocked(true);
    setSelectedDistrictId(null); // Clear selection for a fresh Sandbox start
  };

  const handleDemographicChange = (profileId: string, value: number) => {
    if (!selectedTile) return;
    const safeValue = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));

    updateDistrictTile(selectedTile.id, {
      demographics: {
        ...selectedTile.demographics,
        [profileId]: safeValue
      }
    })
  }

  const currentSum = selectedTile 
    ? Object.values(selectedTile.demographics || {}).reduce((a, b) => a + b, 0) 
    : 0;

  const handleDeleteDistrict = () => {
    if (selectedDistrictId !== null) {
      toggleTileActive(selectedDistrictId);
      setSelectedDistrictId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">District Editor</h2>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {activeDistrictsCount} Active
        </span>
      </div>

      <div className="flex flex-col gap-5 animate-fade-in min-h-[250px]">
        {!selectedTile || !selectedTile.isActive ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg text-gray-400 p-6 text-center bg-gray-50">
            <p className="font-semibold text-sm">Click an empty tile to create a district, or an active tile to edit it.</p>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">District Settings</h3>
              <button 
                onClick={() => { toggleTileActive(selectedDistrictId!); setSelectedDistrictId(null); }}
                className="text-xs text-red-500 hover:text-white font-bold px-2 py-1 rounded hover:bg-red-500 transition-colors border border-red-200"
              >Delete</button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                  <input 
                    type="text" value={selectedTile.name}
                    onChange={(e) => updateDistrictTile(selectedTile.id, { name: e.target.value })}
                    className="w-full p-2 border rounded mt-1 font-semibold text-gray-800"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold text-gray-500 uppercase">Seats</label>
                  <input 
                    type="number" min="1" value={selectedTile.num_seats === 0 ? "" : selectedTile.num_seats}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateDistrictTile(selectedTile.id, { num_seats: isNaN(val) ? 0 : val });
                    }}
                    onBlur={() => { if (selectedTile.num_seats < 1) updateDistrictTile(selectedTile.id, { num_seats: 1 }); }}
                    className="w-full p-2 border rounded mt-1 font-semibold text-gray-800"
                  />
                </div>
              </div>

              {/* THE MELTING POT EDITOR */}
              <div className="mt-2 border-t pt-4">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Voter Makeup</label>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${currentSum === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Total: {currentSum}%
                  </span>
                </div>

                {/* Capacity Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 flex overflow-hidden">
                  {demographicProfiles.map(p => {
                    const pct = selectedTile.demographics[p.id] || 0;
                    if (pct === 0) return null;
                    return <div key={p.id} style={{ width: `${pct}%`, backgroundColor: p.color }} className="h-full transition-all" title={`${p.name}: ${pct}%`} />
                  })}
                  {currentSum > 100 && <div className="flex-1 bg-red-500 animate-pulse" />}
                </div>

                {/* Input List */}
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {demographicProfiles.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{p.name}</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" min="0" max="100" 
                          value={selectedTile.demographics[p.id] || ""}
                          onChange={(e) => handleDemographicChange(p.id, parseInt(e.target.value))}
                          className="w-16 p-1 border rounded text-right text-sm font-bold"
                          placeholder="0"
                        />
                        <span className="text-gray-400 text-sm font-bold">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isNationLocked && (
        <div className="mt-2 border-t pt-4">
          <button 
            onClick={handleLockNation}
            disabled={!isMapReady}
            className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-indigo-700 shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex flex-col items-center"
          >
            <span>Lock Map & Proceed ➔</span>
            {!isMapReady && <span className="text-xs font-normal mt-1 opacity-80">All districts must have exactly 100% voters.</span>}
          </button>
        </div>
      )}
    </div>
  );
}