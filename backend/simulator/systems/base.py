import math
from typing import Protocol, List, Dict, Tuple
from collections import defaultdict
from simulator.systems.utils import calculate_distance

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District

class ElectoralSystem(Protocol):
    """The signature that voting systems must implement."""

    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        ...
    
    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> dict:
        ...

    def _distribute_block_votes(self, block: VoterBlock, candidates: List[Candidate], sensitivity: float = 0.2) -> Dict[str, int]:
        """
        Splits a VoterBlock's population probabilistically among candidates based on proximity (exponential decay).
        Higher sensitivity = Voters spread votes more evenly among nearby candidates.
        """
        if not candidates:
            return {}

        distances = {}
        for c in candidates:
            # Assuming calculate_distance is available
            distances[c.id] = calculate_distance(block.positions, c.positions)

        # Convert distances to weights using exponential decay
        weights = {}
        total_weight = 0.0
        
        for (c_id, dist) in distances.items():
            # If dist is 0, weight is 1. As distance grows, weight approaches 0.
            weight = math.exp(-dist / (sensitivity+0.001))
            weights[c_id] = weight
            total_weight += weight

        # Distribute the population based on weight share
        distribution = {}
        votes_allocated = 0
        
        # Sort by weight descending to give the remainder to the top choice
        sorted_candidates = sorted(weights.keys(), key=lambda k: weights[k], reverse=True)
        
        for c_id in sorted_candidates:
            share = weights[c_id] / total_weight
            votes = int(block.population * share)
            distribution[c_id] = votes
            votes_allocated += votes

        # Give any rounding remainder to the closest candidate
        remainder = block.population - votes_allocated
        if remainder > 0 and sorted_candidates:
            distribution[sorted_candidates[0]] += remainder

        return distribution

    def _tally_standard_votes(
        self, ballots: List[Ballot], candidates: List[Candidate], districts: List[District]) -> Tuple[Dict[str, Dict[str, int]], Dict[str, int]]:
        """
        A universal tallying engine used by almost all systems.
        Returns (local_votes_dict, national_party_votes_dict)
        """
        party_lookup = {c.id: c.party_id for c in candidates}
        
        # Initialize with 0, for every candidate, in every district
        local_votes: Dict[str, Dict[str, int]] = {
            d.id: {c.id: 0 for c in candidates if c.district_id == d.id} 
            for d in districts
        }
        national_party_votes: Dict[str, int] = defaultdict(int)

        all_parties = {c.party_id for c in candidates}
        national_party_votes: Dict[str, int] = {p_id: 0 for p_id in all_parties}

        for ballot in ballots:
            if not ballot.choices:
                continue
                
            d_id = ballot.district_id
            weight = ballot.population_weight
            
            # Index 0 is the local choice
            local_choice = ballot.choices[0]
            if local_choice:
                local_votes[d_id][local_choice] += weight
                national_party_votes[party_lookup[local_choice]] += weight

        return local_votes, national_party_votes
    
    def _calculate_dhondt_seats(
        self, 
        votes: Dict[str, int], 
        total_seats: int,
        max_seats_per_party: Dict[str, int] = {} # Optional capacity limits
    ) -> Dict[str, int]:
        """
        A universal D'Hondt calculator. 
        Returns {party_id: seats_won}.
        """
        seats_won = {p_id: 0 for p_id in votes.keys()}
        
        for _ in range(total_seats):
            # Calculate quotients only for parties with votes AND available candidates
            quotients = {}
            for p_id, v in votes.items():
                if v <= 0:
                    continue
                # If limits are provided, check if the party has maxed out
                if max_seats_per_party and seats_won[p_id] >= max_seats_per_party.get(p_id, float('inf')):
                    continue
                    
                quotients[p_id] = v / (seats_won[p_id] + 1)
                
            if quotients:
                winning_party = max(quotients, key=lambda k: quotients[k])
                seats_won[winning_party] += 1
            else:
                # If no party can take a seat (e.g. everyone is maxed out), stop allocating
                break
                
        return seats_won