export type PositionVector = Record<string, number>;

export type DistrictTile = {
    id: number; // NOTE: ID is number here?
    name: string;
    num_seats: number;
    isActive: boolean;
    demographics: Record<string, number>;
};
type District = {
    id: string;
    name: string;
    num_seats: number;
}
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
export type CandidateResult = Candidate & {
    votes: number;
    percentage: number;
    partyName: string;
    color: string;
    isWinner: boolean;
  };
export type VoterBlock = {
    population: number;
    positions: PositionVector;
    district_id: string
    fuzz_level: number
}  
export type DemographicProfile = { 
    id: string; 
    name: string; 
    color: string; 
    positions: PositionVector; 
};

export type SimulationPayload = {
    system: string;
    districts: District[];
    candidates: Candidate[];
    voters: VoterBlock[];
}