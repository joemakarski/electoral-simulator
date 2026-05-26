import { create } from 'zustand'
import { faker } from '@faker-js/faker'

faker.seed(100)

const CANDIDATE_LIST_SIZE = 15
const CANDIDATE_FUZZ = 0.10;
const VOTER_FUZZ = 0.10;

export type PositionVector = Record<string, number>;

export type DistrictTile = {
    id: number;
    isActive: boolean;
    name: string;
    num_seats: number;
    demographics: Record<string, number>;
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

    // Fuzzing
    candidateFuzzLevel: number;
    setCandidateFuzzLevel: (level: number) => void;
    voterFuzzLevel: number;
    setVoterFuzzLevel: (level: number) => void;

    // Cache
    lastUsedDistrictConfig: { num_seats: number; demographics: Record<string, number> } | null;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    // Initialize 100 tiles, all inactive by default
    grid: Array.from({length: 100}, (_, i) => ({ 
        id: i, 
        isActive: false, 
        name: `District ${i + 1}`, 
        num_seats: 1, 
        demographics: {}
    })),

    toggleTileActive: (id) => set((state) => {
        const tile = state.grid.find(t => t.id === id);
        if (!tile) return state;

        const isTurningOn = !tile.isActive;
        // pull from memory if turning on
        const newSeats = isTurningOn ? (state.lastUsedDistrictConfig?.num_seats || 1) : 1;
        const newDemographics = isTurningOn ? (state.lastUsedDistrictConfig?.demographics || {}) : {};

        return {
            grid: state.grid.map(t => t.id === id ? { 
                ...t, 
                isActive: isTurningOn,
                num_seats: newSeats,
                demographics: newDemographics
            } : t)
        };
    }),

    updateDistrictTile: (id, updates) => set((state) => {
        const currentTile = state.grid.find(t => t.id === id);
        let newMemory = state.lastUsedDistrictConfig;

        // Only update memory if the user actually edited seats or demographics
        if (updates.num_seats !== undefined || updates.demographics !== undefined) {
            newMemory = {
                num_seats: updates.num_seats ?? currentTile?.num_seats ?? 1,
                demographics: updates.demographics ?? currentTile?.demographics ?? {}
            };
        }
        return {
            grid: state.grid.map(t => t.id === id ? { ...t, ...updates } : t),
            lastUsedDistrictConfig: newMemory // Update the memory
        };
    }),

    selectedDistrictId: null,
    setSelectedDistrictId: (id) => set({ selectedDistrictId: id }),

    isNationLocked: false,
    setNationLocked: (locked) => set({isNationLocked: locked}),

    activeSystem: "plurality",
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
        { id: "URBAN", name: "Urban Progressive", color: "#63a31a", positions: { Economy: -0.7, Social: -0.7 } },
        { id: "RURAL", name: "Rural Conservative", color: "#012169", positions: { Economy: 0.7, Social: 0.6 } }
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
        const { parties, grid, axes } = get();
        const activeDistricts = grid.filter(t => t.isActive);
        const newCandidates: Candidate[] = [];
        
        const fuzzPositions = (basePositions: PositionVector) => {
            const fuzzed: PositionVector = {};
            axes.forEach(axis => {
                const base = basePositions[axis] || 0;
                const deviation = (Math.random() - 0.5) * CANDIDATE_FUZZ
                fuzzed[axis] = Math.max(-1, Math.min(1, base+deviation));
            })
            return fuzzed
        }

        parties.forEach(party => {
            // National List
            for (let i = 0; i < CANDIDATE_LIST_SIZE; i++) {
                newCandidates.push({ 
                    id: `c_${party.id}_national_${i}`, 
                    name: faker.person.fullName(), 
                    party_id: party.id, 
                    positions: { ...party.basePositions }, 
                    district_id: null 
                }); 
            }

            // Local candidates (matched to grid tiles)
            activeDistricts.forEach(district => {
                for (let i = 0; i < district.num_seats; i++) {
                    newCandidates.push({ 
                        id: `c_${party.id}_d${district.id}_${i}`, 
                        name: faker.person.fullName(), 
                        party_id: party.id, 
                        positions: { ...fuzzPositions(party.basePositions) }, 
                        district_id: `d${district.id}`
                    })
                }
            });
        });

        set({ candidates: newCandidates });
    },

    candidateFuzzLevel: CANDIDATE_FUZZ,
    setCandidateFuzzLevel: (level) => set({candidateFuzzLevel: level}),
    voterFuzzLevel: VOTER_FUZZ,
    setVoterFuzzLevel: (level) => {console.log(level); set({voterFuzzLevel: level})},

    lastUsedDistrictConfig: null,
}));