'use client';

import { useSimulationStore } from '@/store/simulationStore';
// TODO:
// import MapGrid from '@/components/MapGrid'; 
// import BuilderControls from '@/components/BuilderControls';
// import SimulationControls from '@/components/SimulationControls';

export default function Home() {
  const { isNationLocked } = useSimulationStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Column: The Map */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-4">
            {isNationLocked ? "Electoral Dashboard" : "Nation Builder"}
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            {/* <MapGrid /> */}
            <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center text-gray-500">
               [Map Component Will Go Here]
            </div>
          </div>
        </div>

        {/* Right Column: The Controls */}
        <div className="col-span-1">
          {isNationLocked ? (
             <div className="bg-white p-6 rounded shadow border">Simulation Tools</div>
          ) : (
             <div className="bg-white p-6 rounded shadow border">Geography Tools</div>
          )}
        </div>

      </div>
    </div>
  );
}