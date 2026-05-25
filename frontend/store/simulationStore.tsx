import { create } from 'zustand'

const CANDIDATE_LIST_SIZE = 15

export type PositionVector = Record<string, number>;

export type DistrictTile = {
    id: number;
    isActive: boolean;
    name: string;
    num_seats: number;
    demographicProfileId: string;
};
export type Party = { 
    id: string; 
    name: string; 
    color: string; 
    basePositions: PositionVector; 
};
export type Candidate = { 
    id: string; 
    name: string; 
    party_id: string; 
    positions: PositionVector; 
    district_id: string | null; 
};
export type DemographicProfile = { 
    id: string; 
    name: string; 
    color: string; 
    populationPerTile: number; 
    positions: PositionVector; 
};

interface SimulationState {
    // Map and District State
    grid: DistrictTile[];
    toggleTileActive: (id: number) => void;
    updateDistrictTile: (id: number, updates: Partial<DistrictTile>) => void;
    
    selectedDistrictId: number | null;
    setSelectedDistrictId: (id: number | null) => void;

    isNationLocked: boolean;
    setNationLocked: (locked: boolean) => void;

    // System & Results
    activeSystem: string;
    setActiveSystem: (system: string) => void;
    results: any; 
    setResults: (results: any) => void;    

    // Axes
    axes: string[];
    addAxis: (axis: string) => void;
    removeAxis: (axis: string) => void;

    // Entities
    demographicProfiles: DemographicProfile[];
    addDemographicProfile: (profile: DemographicProfile) => void;
    removeDemographicProfile: (profileId: string) => void;
    updateDemographicPosition: (profileId: string, axis: string, value: number) => void;

    parties: Party[];
    addParty: (party: Party) => void;
    removeParty: (partyId: string) => void;
    updatePartyPosition: (partyId: string, axis: string, value: number) => void;

    candidates: Candidate[];
    generateCandidates: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    // Initialize 100 tiles, all inactive by default
    grid: Array.from({length: 100}, (_, i) => ({ 
        id: i, 
        isActive: false, 
        name: `District ${i + 1}`, 
        num_seats: 1, 
        demographicProfileId: "URBAN" // Default fallback
    })),

    toggleTileActive: (id) => set((state) => ({
        grid: state.grid.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
    })),

    updateDistrictTile: (id, updates) => set((state) => ({
        grid: state.grid.map(t => t.id === id ? { ...t, ...updates } : t)
    })),

    selectedDistrictId: null,
    setSelectedDistrictId: (id) => set({ selectedDistrictId: id }),

    isNationLocked: false,
    setNationLocked: (locked) => set({isNationLocked: locked}),

    activeSystem: "fptp",
    setActiveSystem: (system) => set({activeSystem: system}),

    results: null,
    setResults: (results) => set({ results }),

    // Axes management
    axes: ["Economy", "Social"], // defaults
    addAxis: (axis) => set((state) => {
        if (state.axes.includes(axis)) return state;
        const newParties = state.parties.map(p => ({ ...p, basePositions: { ...p.basePositions, [axis]: 0.0 } }));
        const newDemographics = state.demographicProfiles.map(d => ({ ...d, positions: { ...d.positions, [axis]: 0.0 } }));
        return { axes: [...state.axes, axis], parties: newParties, demographicProfiles: newDemographics };
    }),
    removeAxis: (axis) => set((state) => {
        // Prevent deleting all axes to avoid UI crashes
        if (state.axes.length <= 1) return state; 
        
        const removeKey = (obj: PositionVector) => {
            const newObj = { ...obj };
            delete newObj[axis];
            return newObj;
        };

        return { 
            axes: state.axes.filter(a => a !== axis),
            parties: state.parties.map(p => ({ ...p, basePositions: removeKey(p.basePositions) })),
            demographicProfiles: state.demographicProfiles.map(d => ({ ...d, positions: removeKey(d.positions) }))
        };
    }),

    // Profiles and parties
    demographicProfiles: [ // default
        { id: "URBAN", name: "Urban Progressive", color: "#63a31a", populationPerTile: 5000, positions: { Economy: -0.7, Social: -0.7 } },
        { id: "RURAL", name: "Rural Conservative", color: "#012169", populationPerTile: 1000, positions: { Economy: 0.7, Social: 0.6 } }
    ] as DemographicProfile[],
    
    addDemographicProfile: (profile) => set((state) => ({ demographicProfiles: [...state.demographicProfiles, profile] })),
    removeDemographicProfile: (id) => set((state) => ({ demographicProfiles: state.demographicProfiles.filter(p => p.id !== id) })),
    updateDemographicPosition: (profileId, axis, value) => set((state) => ({ 
        demographicProfiles: state.demographicProfiles.map(p => p.id===profileId ? { ...p, positions: { ...p.positions, [axis]: value } } : p) 
    })),

    parties: [],
    addParty: (party) => set((state) => ({ parties: [...state.parties, party] })),
    removeParty: (id) => set((state) => ({ parties: state.parties.filter(p => p.id !== id) })),
    updatePartyPosition: (partyId, axis, value) => set((state) => ({
        parties: state.parties.map(p => p.id === partyId ? { ...p, basePositions: { ...p.basePositions, [axis]: value } } : p)
    })),

    // Candidate generator
    candidates: [],
    generateCandidates: () => {
        const { parties, grid } = get();
        const activeDistricts = grid.filter(t => t.isActive);
        const newCandidates: Candidate[] = [];

        parties.forEach(party => {
            // National List
            for (let i = 0; i < CANDIDATE_LIST_SIZE; i++) {
                newCandidates.push({ 
                    id: `c_${party.id}_national_${i}`, 
                    name: `National List #${i+1}`, 
                    party_id: party.id, positions: { ...party.basePositions }, district_id: null 
                }); 
            }

            // Local candidates (matched to grid tiles)
            activeDistricts.forEach(district => {
                for (let i = 0; i < district.num_seats; i++) {
                    newCandidates.push({ 
                        id: `c_${party.id}_d${district.id}_${i}`, 
                        name: `Local #${i+1} of ${district.name}`, 
                        party_id: party.id, positions: { ...party.basePositions }, district_id: `d${district.id}`
                    })
                }
            });
        });

        set({ candidates: newCandidates });
    }
}));