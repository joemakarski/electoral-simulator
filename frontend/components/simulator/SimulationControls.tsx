'use client';

import { useState } from "react";

import PartyConfig from "@/components/simulator/tabs/PartyConfig";
import ElectionConfig from "@/components/simulator/tabs/ElectionConfig";

export default function SimulationControls() {

  const [simTab, setSimTab] = useState<'parties' | 'election'>('parties');

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
    

        {/* Tab Navigation */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button 
            onClick={() => setSimTab('parties')}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              simTab === 'parties' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            4. Parties
          </button>
          <button 
            onClick={() => setSimTab('election')}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              simTab === 'election' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            5. Election
          </button>
        </div>


        {/* Main Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px] p-6">
          {simTab === 'parties' && <PartyConfig /> }
          {simTab === 'election' && <ElectionConfig />}
        </div>
      </div>
    </div>
  );
}