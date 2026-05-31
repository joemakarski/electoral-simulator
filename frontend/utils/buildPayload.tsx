import { DistrictTile, Candidate, DemographicProfile, SimulationPayload } from "@/types";
import { BASE_DISTRICT_POPULATION } from "@/utils/constants";

export function buildSimulationPayload(
  activeSystem: string,
  grid: DistrictTile[],
  candidates: Candidate[],
  demographicProfiles: DemographicProfile[],
  axes: string[],
  voterFuzzLevel: number
): SimulationPayload 
{ 
    // Get all active tiles (our districts)
    const activeDistricts = grid.filter(t => t.isActive);

    // Format districts for Django
    const payloadDistricts = activeDistricts.map(t => ({
        id: `d${t.id}`,
        name: t.name.trim() || `District ${t.id + 1}`,
        num_seats: t.num_seats
    }));

    // Format voters for Django
    const generatedVoters = activeDistricts.flatMap(tile => {
        return Object.entries(tile.demographics || {}).map(([profileId, percentage]) => {
        const profile = demographicProfiles.find(p => p.id === profileId);
        
        const defaultPositions = axes.reduce((acc, axis) => ({ ...acc, [axis]: 0.0 }), {});
        const finalPositions = profile ? { ...profile.positions } : defaultPositions;
        
        const finalPopulation = Math.floor(BASE_DISTRICT_POPULATION * (percentage / 100));

        return {
            population: finalPopulation,
            positions: finalPositions, 
            district_id: `d${tile.id}`,
            fuzz_level: voterFuzzLevel
        };
        }).filter(v => v.population > 0);
    });

    return {
        system: activeSystem,
        districts: payloadDistricts,
        candidates: candidates,
        voters: generatedVoters,
    };
}