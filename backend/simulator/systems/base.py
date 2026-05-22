from typing import Protocol, List, Dict, Tuple
from collections import defaultdict

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District

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

class ElectoralSystem(Protocol):
    """The signature that voting systems must implement."""

    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        ...
    
    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> dict:
        ...

    def _tally_standard_votes(
        self, ballots: List[Ballot], candidates: List[Candidate], districts: List[District]) -> Tuple[Dict[str, Dict[str, int]], Dict[str, int]]:
        """
        A universal tallying engine used by almost all systems.
        Returns (local_votes_dict, national_party_votes_dict)
        """
        party_lookup = {c.id: c.party_id for c in candidates}
        
        # Initialize with 0, for every candidate, in every district
        local_votes: Dict[str, Dict[str, int]] = {
            d.id: {c.id: 0 for c in candidates if c.district_id == d.id or c.district_id is None} 
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