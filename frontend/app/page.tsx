'use client';

import { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

import MapGrid from '@/components/MapGrid'; 
import DistrictEditor from '@/components/DistrictEditor';
import SimulationControls from '@/components/SimulationControls';
import ResultsDashboard from '@/components/ResultsDashboard';
import AxesConfig from '@/components/AxesConfig';
import DemographicsConfig from '@/components/DemographicsConfig';
import DistrictResults from '@/components/DistrictResults';

export default function Home() {
  const { isNationLocked, selectedDistrictId } = useSimulationStore();
   1
  const [builderTab, setBuilderTab] = useState<'axes' | 'voters' | 'districts'>('axes');

  // If the user clicks the map, auto-switch to the District tab so they can inspect it
  useEffect(() => {
    if (!isNationLocked && selectedDistrictId !== null) {
      setBuilderTab('districts');
    }
  }, [selectedDistrictId, isNationLocked]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Column: The Map */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            {isNationLocked ? "Electoral Simulator" : "Build an Electorate"}
          </h1>
          
          <div className="bg-sky-50 p-6 rounded-lg shadow-sm border flex justify-center top-8">
            <MapGrid />
          </div>

          <ResultsDashboard />
        </div>

        {/* Right Column: Dynamic Routing */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {isNationLocked ? (
             /* Post-lock: Simulator Mode */
             selectedDistrictId !== null ? (
               <DistrictResults />
             ) : (
               <div className="bg-white p-6 rounded-lg shadow-sm border">
                 <SimulationControls />
               </div>
             )
          ) : (
             /* Pre-lock: Builder Mode */
             <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
               
               {/* Tab Navigation */}
               <div className="flex bg-gray-100 border-b">
                 <button 
                   onClick={() => setBuilderTab('axes')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                     builderTab === 'axes' ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-200'
                   }`}
                 >
                   Positions
                 </button>
                 <button 
                   onClick={() => setBuilderTab('voters')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                     builderTab === 'voters' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-200'
                   }`}
                 >
                   Demographics
                 </button>
                 <button 
                   onClick={() => setBuilderTab('districts')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                     builderTab === 'districts' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-200'
                   }`}
                 >
                   District
                 </button>
               </div>

               {/* Tab Content Area */}
               <div className="p-6">
                 {builderTab === 'axes' && <AxesConfig />}
                 {builderTab === 'voters' && <DemographicsConfig />}
                 {builderTab === 'districts' && <DistrictEditor />}
               </div>
               
             </div>
          )}

        </div>

      </div>
    </div>
  );
}