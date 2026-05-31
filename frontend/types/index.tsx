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
