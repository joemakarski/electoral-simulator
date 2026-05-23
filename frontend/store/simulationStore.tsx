import { create } from 'zustand'

export type PositionVector = Record<string, number>;

export type Tile = {
    id: number;
    district_id: string|null;
    population: number;
    demographicProfileId: string|null;
};
export type District = {
    id: string;
    name: string;
    num_seats: number;
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

// The Zustand store
interface SimulationState {
    grid: Tile[];
    setGrid: (grid: Tile[]) => void;
    updateTileDistrict: (tileId: number, districtId: string | null) => void
    updateTileDemographic: (tileId: number, profileId: string | null) => void;

    districts: District[];
    addDistrict: (district: District) => void;
    removeDistrict: (districtId: string) => void;

    isNationLocked: boolean;
    setNationLocked: (locked: boolean) => void;

    activeSystem: string;
    setActiveSystem: (system: string) => void;

    activeBrush: string | null;
    setActiveBrush: (brush: string | null) => void;

    brushMode: "district" | "demographic"; // Toggle what the mouse paints
    setBrushMode: (mode: "district" | "demographic") => void;

    demographicProfiles: DemographicProfile[];
    addDemographicProfile: (profile: DemographicProfile) => void;
    removeDemographicProfile: (profileId: string) => void;
    updateDemographicPosition: (profileId: string, axis: string, value: number) => void;

    activeDemographicBrush: string | null;
    setActiveDemographicBrush: (profileId: string | null) => void;

    results: any; //TODO: SPECIFY
    setResults: (results: any) => void;    

    axes: string[];
    addAxis: (axis: string) => void;
    removeAxis: (axis: string) => void;

    parties: Party[],
    addParty: (party: Party) => void;
    removeParty: (partyId: string) => void;
    updatePartyPosition: (partyId: string, axis: string, value: number) => void;

    candidates: Candidate[];
    generateCandidates: () => void;
}

// Setting up the store
export const useSimulationStore = create<SimulationState>((set, get) => ({
    grid: Array.from({length: 100}, (_, i) => ({ // [10,10]
        id: i, 
        district_id: null, 
        population: 1000, 
        demographicProfileId: null
    })),

    setGrid: (grid) => set({ grid }),

    updateTileDistrict: (tileId, districtId) => set((state) => ({
        grid: state.grid.map(t => t.id===tileId ? { ...t, district_id: districtId } : t)
    })),
    updateTileDemographic: (tileId, profileId) => set((state) => {
        const profile = state.demographicProfiles.find(p => p.id===profileId);
        const pop = profile ? profile.populationPerTile : 1000;
        return {
            grid: state.grid.map(t => t.id === tileId ? { ...t, demographicProfileId: profileId, population: pop } : t)
        };
    }),
    
    districts: [], // initially empty
    addDistrict: (district) => set((state) => ({ districts: [...state.districts, district]})),
    removeDistrict: (id) => set((state) => ({ districts: state.districts.filter(d => d.id!=id)})),

    isNationLocked: false,
    setNationLocked: (locked) => set({isNationLocked: locked}),

    activeSystem: "fptp",
    setActiveSystem: (system) => set({activeSystem: system}),

    activeBrush: null,
    setActiveBrush: (brush) => set({ activeBrush: brush }),

    brushMode: "district",
    setBrushMode: (mode) => set({ brushMode: mode }),
    
    activeDemographicBrush: "URBAN",
    setActiveDemographicBrush: (profileId) => set({ activeDemographicBrush: profileId }),

    demographicProfiles: [
        { id: "URBAN", name: "Urban Progressive", color: "#a855f7", populationPerTile: 5000, positions: { Economy: -0.7, Social: -0.7 } },
        { id: "SUBURBAN", name: "Suburban Moderate", color: "#06b6d4", populationPerTile: 2500, positions: { Economy: 0.1, Social: -0.1 } },
        { id: "RURAL", name: "Rural Conservative", color: "#f97316", populationPerTile: 1000, positions: { Economy: 0.7, Social: 0.6 } }
    ] as DemographicProfile[],
    
    addDemographicProfile: (profile) => set((state) => ({ demographicProfiles: [...state.demographicProfiles, profile] })),
    removeDemographicProfile: (id) => set((state) => ({ demographicProfiles: state.demographicProfiles.filter(p => p.id !== id) })),
    updateDemographicPosition: (profileId, axis, value) => set((state) => ({ 
        demographicProfiles: state.demographicProfiles.map(p => p.id===profileId ? { 
            ...p, positions: { ...p.positions, [axis]: value } 
        } : p) 
    })),

    results: null,
    setResults: (results) => set({ results }),

    axes: ["Economy", "Social"], // Default axes
    addAxis: (axis) => set((state) => {
        if (state.axes.includes(axis)) return state;

        // All new parties and demographics to have default 0 value
        const newParties = state.parties.map(p => ({
            ...p, basePositions: { ...p.basePositions, [axis]: 0.0 }
        }));
        const newDemographics = state.demographicProfiles.map(d => ({
            ...d, positions: { ...d.positions, [axis]: 0.0 }
        }));

        return { axes: [...state.axes, axis], parties: newParties, demographicProfiles: newDemographics };
    }),
    removeAxis: (axis) => set((state) => ({ axes: state.axes.filter(a => a !== axis) })),

    parties: [],
    addParty: (party) => set((state) => ({ parties: [...state.parties, party] })),
    removeParty: (id) => set((state) => ({ parties: state.parties.filter(p => p.id !== id) })),
    updatePartyPosition: (partyId, axis, value) => set((state) => ({
        parties: state.parties.map(p => p.id === partyId ? {
            ...p, basePositions: { ...p.basePositions, [axis]: value }
        } : p)
    })),

    candidates: [],
    generateCandidates: () => { // For now, 1 national + 1 per district
        const { parties, districts } = get();
        const newCandidates: Candidate[] = [];

        parties.forEach(party => {
            // 1. Create a National List candidate
            newCandidates.push({
                id: `c_${party.id}_national`,
                name: `${party.name} (List)`,
                party_id: party.id,
                positions: { ...party.basePositions },
                district_id: null
            });

            // 2. Create one local candidate for every district
            districts.forEach(district => {
                newCandidates.push({
                    id: `c_${party.id}_${district.id}`,
                    name: `${party.name} Candidate`,
                    party_id: party.id,
                    positions: { ...party.basePositions }, // TODO: Add random fuzzing
                    district_id: district.id
                });
            });
        });

        set({ candidates: newCandidates });
    }
}));