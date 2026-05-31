'use client';

import { useSimulationStore } from '@/store/simulationStore';

import MapGrid from '@/components/MapGrid'; 
import BuilderControls from '@/components/builder/BuilderControls'
import SimulationControls from '@/components/simulator/SimulationControls';
import ResultsDashboard from '@/components/ResultsDashboard';
import DistrictResults from '@/components/simulator/DistrictResults';

export default function Home() {
  const { isNationLocked, selectedDistrictId } = useSimulationStore();

  return (
    <div className="min-h-screen bg-sky-100 p-8 text-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: The map and dashboard*/}
        <div className="col-span-7">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 p-2">
            {isNationLocked ? "Electoral Simulator" : "Build an Electorate"}
          </h1>
          
          <div className="bg-sky-50 p-6 rounded-lg shadow-sm border flex justify-center top-8">
            <MapGrid />
          </div>

          <ResultsDashboard />
        </div>

        {/* Right: The information. */}
        <div className="col-span-5 flex flex-col gap-6">
          
          {isNationLocked ? (
            (selectedDistrictId !== null) ? (<DistrictResults />) : <SimulationControls />
          ) : (
            <BuilderControls />
          )}

        </div>

      </div>
    </div>
  );
}