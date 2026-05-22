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
        # Tally local and national votes
        (local_votes, national_party_votes) = self._tally_standard_votes(ballots, candidates, districts)
        
        # Now determine the winners
        winners = {"NATIONAL_LIST": []} # no national list

        for (d_id, vote_counts) in local_votes.items():
            # FPTP: Highest vote count gets the single seat
            if vote_counts and any(v > 0 for v in vote_counts.values()):
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