'use client';

import { useEffect, useState } from "react";

import { useSimulationStore } from "@/store/simulationStore";

import AxesConfig from "./tabs/AxesConfig";
import DemographicsConfig from "./tabs/DemographicsConfig";
import DistrictEditor from "./tabs/DistrictEditor";

export default function BuilderControls() {

  const {isNationLocked, selectedDistrictId} = useSimulationStore();

  const [builderTab, setBuilderTab] = useState<'axes' | 'voters' | 'districts'>('axes');

  // If the user clicks the map, auto-switch to the District tab so they can inspect it
  useEffect(() => {
    if (!isNationLocked && selectedDistrictId !== null) {
      setBuilderTab('districts');
    }
  }, [selectedDistrictId, isNationLocked]);


  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 border-b">
        <button 
          onClick={() => setBuilderTab('axes')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            builderTab === 'axes' ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          1. Positions
        </button>
        <button 
          onClick={() => setBuilderTab('voters')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            builderTab === 'voters' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          2. Demographics
        </button>
        <button 
          onClick={() => setBuilderTab('districts')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            builderTab === 'districts' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          3. District
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        {builderTab === 'axes' && <AxesConfig />}
        {builderTab === 'voters' && <DemographicsConfig />}
        {builderTab === 'districts' && <DistrictEditor />}
      </div>
      
    </div>
  )
}