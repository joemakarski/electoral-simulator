from typing import Dict, List
from collections import defaultdict

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.base import ElectoralSystem
from simulator.systems.utils import calculate_distance

class FirstPastThePost(ElectoralSystem):
    """Simulate a single-winner plurality system"""
    def __str__(self):
        return "First Past The Post"
    
    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        ballots = []

        # Iterate through every voter block
        for block in voters:
            district_id = block.district_id
            voteable_candidates = [c for c in candidates if c.district_id == district_id or c.district_id == None] # Get district/at-large candidates
            if not voteable_candidates: continue
            
            # Get closest voteable candidates for each voting block
            closest_candidate = min(
                voteable_candidates, 
                key=lambda c: calculate_distance(block.positions, c.positions)
            )
            
            # Winner gets all the voting block's votes
            if closest_candidate:
                ballots.append(
                    Ballot(
                        district_id=district_id,
                        population_weight=block.population,
                        choices=[closest_candidate.id]
                    )
                )

        return ballots
    
    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> Dict:
        party_lookup = {c.id: c.party_id for c in candidates}

        # Initialise with format: { "district_id": { "candidate_id": vote_count } }
        # "At this district: Candidate A got N votes; ..."
        local_votes: Dict[str, Dict[str, int]] = {
            d.id: {
                c.id: 0 for c in candidates if c.district_id == d.id or c.district_id is None
            } for d in districts
        }
        national_party_votes: Dict[str, int] = defaultdict(int)

        for ballot in ballots:
            d_id = ballot.district_id
            choice_id = ballot.choices[0] # FPTP: One vote
            weight = ballot.population_weight

            local_votes[d_id][choice_id] += weight
            national_party_votes[party_lookup[choice_id]] += weight
        
        # Now determine the winners
        winners = {"NATIONAL_LIST": []} # no national list
        
        for (d_id, vote_counts) in local_votes.items():
            # FPTP: Highest vote count gets the single seat
            if vote_counts:
                winner_id = max(vote_counts, key=lambda k: vote_counts[k])
                winners[d_id] = [winner_id]
            else:
                winners[d_id] = []

        return {
            "results": {
                "local_votes": local_votes,
                "national_party_votes": dict(national_party_votes)
            },
            "winners": winners,
            "stats": {
                "total_parliament_size": sum(len(w) for w in winners.values()),
                "entitlements": {}, # FPTP doesn't have proportional entitlements
                "notes": []
            }
        }