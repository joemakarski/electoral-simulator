from dataclasses import dataclass
from typing import Dict, List, Protocol
import math

"""
HIGH LEVEL ROUGH CONCEPT:
On a pannable hexagonal map, Districts are selected - those Districts together form a Nation.
You create a number of Ideas and allocate them to a specified number of Voters using some customisable algorithm.
You also create some Parties and specify their Ideas.
Then you choose how to allocate Voters across the Districts using another customisable algorithm (e.g. maybe some party is especially strong in northern districts).
All these properties can be manually adjusted, or psuedo-randomly all changed at once via some algorithm (might be based on a distribution).
You can then select a voting system, and simulate an election. The results will be visualised at the global and local level.

NOTES:
Still need to adapt for next.js django architecture.
Some may be better suited for frontend.
No algorithms yet.
"""
# Multi-dimensional idea-to-position mapping
PositionVector = Dict[str, float]

@dataclass
class District:
    id: str
    name: str
    num_mandates: int # Seats available

@dataclass
class Party:
    id: str
    name: str
    color: str

@dataclass
class Candidate:
    id: str
    name: str
    party_id: str
    positions: PositionVector # Where the candidate stands on the issues
    district_id: str | None # None if running at-large

@dataclass
class VoterBlock:
    population: int
    positions: PositionVector
    district_id: str


class ElectoralSystem(Protocol):
    """The signature that voting systems must implement."""
    def calculate_results(
        self, 
        voters: List[VoterBlock], 
        candidates: List[Candidate], 
        districts: List[District],
        **kwargs # ideas: threshold, limited vote, ballot type,  
    ) -> dict:
        ...

class FirstPastThePost(ElectoralSystem):
    """Simulate a single-winner plurality system"""
    def calculate_results(self, voters, candidates, districts, **kwargs):

        # Initialise with format: { "district_id": { "candidate_id": vote_count } }
        # "At this district: Candidate A got N votes; ..."
        results: Dict[str, Dict[str, int]] = {
            d.id: {
                c.id: 0 for c in candidates if c.district_id == d.id or c.district_id is None
            } for d in districts
        }

        # Iterate through every voter block
        for block in voters:
            district_id = block.district_id
            voteable_candidates = [c for c in candidates if c.district_id or c.district_id == None] # Get district/at-large candidates
            if not voteable_candidates:
                continue
            
            closest_candidate = None
            shortest_distance = float('inf')

            # Now find the closest candidate to voters' positions
            for candidate in voteable_candidates:
                distance = calculate_distance(block.positions, candidate.positions)

                if distance < shortest_distance:
                    shortest_distance = distance
                    closest_candidate = candidate
            
            # Winner gets all the voting block's votes
            if closest_candidate:
                results[district_id][closest_candidate.id] += block.population
        
        winners = {}
        for (district_id, vote_counts) in results.items():
            # Assign this district's winning candidate
            if vote_counts:
                winner_id = max(vote_counts, key=lambda k: vote_counts[k])
                winners[district_id] = winner_id
            else:
                winners[district_id] = None

        return {
            "results": results,
            "winners": winners,
        }


def calculate_distance(voter_positions: PositionVector, candidate_positions: PositionVector) -> float:
    """
    Calculates the Euclidean distance between a VoterBlock and a Candidate 
    across any number of dimensions.
    """
    sum_of_squared_differences = 0.0
    
    # For each voter position on an issue, compare with candidate's position on that issue  
    for (axis, voter_value) in voter_positions.items():
        candidate_value = candidate_positions.get(axis, 0.0) # assume 0 if no position
         
        sum_of_squared_differences += (candidate_value - voter_value) ** 2
        
    # Return the square root of the sum: sqrt( (x2-x1)^2 + (y2-y1)^2 + ... )
    return math.sqrt(sum_of_squared_differences)