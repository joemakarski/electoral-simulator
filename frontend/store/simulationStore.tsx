import { create } from 'zustand'

export type PositionVector = { // default axes
    economy: number; 
    social: number 
}; 
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
export type Candidate = {
  id: string;
  name: string;
  party_id: string;
  positions: PositionVector;
  district_id: string | null;
};

// The Zustand store
interface SimulationState {
    // Geography
    grid: Tile[];
    setGrid: (grid: Tile[]) => void;
    updateTileDistrict: (tileId: number, districtId: string | null) => void

    // Nation creation
    districts: District[];
    addDistrict: (district: District) => void;
    removeDistrict: (districtId: string) => void;

    // Phase control
    isNationLocked: boolean;
    setNationLocked: (locked: boolean) => void;

    // Electoral system
    activeSystem: string;
    setActiveSystem: (system: string) => void;

    // Brush
    activeBrush: string | null;
    setActiveBrush: (brush: string | null) => void;

    // Candidates
    candidates: Candidate[];
    setCandidates: (candidates: Candidate[]) => void;
    results: any;
    setResults: (results: any) => void;    
}

// Setting up the store
export const useSimulationStore = create<SimulationState>((set) => ({
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
    
    districts: [], // initially empty
    addDistrict: (district) => set((state) => ({ districts: [...state.districts, district]})),
    removeDistrict: (id) => set((state) => ({ districts: state.districts.filter(d => d.id!=id)})),

    isNationLocked: false,
    setNationLocked: (locked) => set({isNationLocked: locked}),

    activeSystem: "fptp",
    setActiveSystem: (system) => set({activeSystem: system}),

    activeBrush: null,
    setActiveBrush: (brush) => set({ activeBrush: brush }),

    candidates: [
        // Some default national candidates
        { id: "c1", name: "Alice", party_id: "RED", positions: { economy: -0.8, social: -0.8 }, district_id: null },
        { id: "c2", name: "Bob", party_id: "BLUE", positions: { economy: 0.8, social: 0.8 }, district_id: null },
        { id: "c3", name: "Charlie", party_id: "GREEN", positions: { economy: 0.0, social: 0.0 }, district_id: null },
    ],
    setCandidates: (candidates) => set({ candidates }),
    results: null,
    setResults: (results) => set({ results }),
}));