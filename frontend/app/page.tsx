'use client';

import { useSimulationStore } from '@/store/simulationStore';
import MapGrid from '@/components/MapGrid'; 
import DistrictInspector from '@/components/DistrictInspector';
import SimulationControls from '@/components/SimulationControls';
import ResultsDashboard from '@/components/ResultsDashboard';
import AxesConfig from '@/components/AxesConfig';
import DemographicsConfig from '@/components/DemographicsConfig';
import LocalDistrictSandbox from '@/components/LocalDistrictSandbox';

export default function Home() {
  const { isNationLocked, selectedDistrictId } = useSimulationStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Column: The Map */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-4">
            {isNationLocked ? "Electoral Sandbox" : "Nation Builder"}
          </h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md border flex justify-center">
            <MapGrid />
          </div>

          <ResultsDashboard />
        </div>

        {/* Right Column: Dynamic Routing */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {isNationLocked ? (
             /* Post-lock: sandbox (+ local vs national) */
             selectedDistrictId !== null ? (
               <LocalDistrictSandbox />
             ) : (
               <div className="bg-white p-6 rounded shadow border">
                 <SimulationControls />
               </div>
             )
          ) : (
             /* Pre-lock: Builder mode */
             <>
               <AxesConfig /> 
               <DemographicsConfig />
               <div className="bg-white p-6 rounded shadow border">
                 <DistrictInspector />
               </div>
             </>
          )}

        </div>

      </div>
    </div>
  );
}