export type PositionVector = Record<string, number>;

export type ElectoralSystem = 'plurality' | 'listpr' | 'mmp' | 'stv';

export interface District {
    id: string;
    name: string;
    num_seats: number;
}

export interface DistrictTile extends District {
    isActive: boolean;
    demographics: Record<string, number>;
}

export interface Party { 
    id: string; 
    name: string; 
    color: string; 
    basePositions: PositionVector; 
}

export interface Candidate { 
    id: string; 
    name: string; 
    party_id: string; 
    positions: PositionVector; 
    district_id: string | null; 
}

export interface CandidateResult extends Candidate {
    votes: number;
    percentage: number;
    partyName: string;
    color: string;
    isWinner: boolean;
}

export interface VoterBlock {
    population: number;
    positions: PositionVector;
    district_id: string
    fuzz_level: number
}

export interface DemographicProfile { 
    id: string; 
    name: string; 
    color: string; 
    positions: PositionVector; 
}

export interface DistrictRound {
    round: number;
    tally: Record<string, number>;
    action: "elected" | "eliminated" | "none";
    candidate_id: string | null;
    transfers: Record<string, number>;
    quota: number | null;
}

export interface SimulationPayload {
    system: ElectoralSystem;
    districts: District[];
    candidates: Candidate[];
    voters: VoterBlock[];
}

export interface SimulationResponse {
    results: {
        local_votes: Record<string, Record<string, number>>;
        national_party_votes: Record<string, number>;
        rounds?: Record<string, DistrictRound[]>
    };
    stats: {
        entitlements: Record<string, number>;
        notes: string[];
        total_parliament_size: number;
    };
    winners: Record<string, string[]>
}