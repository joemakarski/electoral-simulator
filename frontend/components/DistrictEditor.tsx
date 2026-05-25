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

  const handleLockNation = () => {
    if (activeDistrictsCount === 0) {
      alert("You must activate at least one district on the map before proceeding.");
      return;
    }
    setNationLocked(true);
    setSelectedDistrictId(null); // Clear selection for a fresh Sandbox start
  };

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

      {/* EDITOR PANEL */}
      <div className="flex flex-col gap-5 animate-fade-in min-h-[250px]">
        {!selectedTile || !selectedTile.isActive ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg text-gray-400 p-6 text-center bg-gray-50">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            <p className="font-semibold text-sm">
              {!isNationLocked 
                ? "Click an empty tile on the map to create a new district, or click an active tile to inspect it."
                : "Click an active district on the map to view its details."}
            </p>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">District Settings</h3>
              {!isNationLocked && (
                <button 
                  onClick={handleDeleteDistrict}
                  className="text-xs text-red-500 hover:text-white font-bold px-2 py-1 rounded hover:bg-red-500 transition-colors border border-red-200"
                >
                  Delete
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">District Name</label>
                <input 
                  type="text" 
                  value={selectedTile.name}
                  onChange={(e) => updateDistrictTile(selectedTile.id, { name: e.target.value })}
                  disabled={isNationLocked}
                  className="w-full p-2 border rounded mt-1 font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Number of Seats</label>
                <input 
                  type="number" min="1"
                  value={selectedTile.num_seats === 0 ? "" : selectedTile.num_seats}
                  onChange={(e) => {
                    const safeValue = Number(e.target.value) || 0;
                    updateDistrictTile(selectedTile.id, { num_seats: safeValue });
                  }}
                  onBlur={() => {
                    if (selectedTile.num_seats < 1) {
                      updateDistrictTile(selectedTile.id, { num_seats: 1 });
                    }
                  }}
                  disabled={isNationLocked}
                  className="w-full p-2 border rounded mt-1 font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Voter Demographic</label>
                <select 
                  value={selectedTile.demographicProfileId}
                  onChange={(e) => updateDistrictTile(selectedTile.id, { demographicProfileId: e.target.value })}
                  disabled={isNationLocked}
                  className="w-full p-2 border rounded mt-1 font-semibold text-gray-800 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="" disabled>Select a profile...</option>
                  {demographicProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lock button (if not yet locked) */}
      {!isNationLocked && (
        <div className="mt-2 border-t pt-4">
          <button 
            onClick={handleLockNation}
            className="w-full bg-indigo-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-indigo-700 shadow-md transition-colors"
          >
            Lock Map & Proceed ➔
          </button>
        </div>
      )}
    </div>
  );
}