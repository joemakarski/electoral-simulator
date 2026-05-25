from typing import Dict, List
from collections import defaultdict

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.base import ElectoralSystem
from simulator.systems.utils import calculate_distance

class Plurality(ElectoralSystem):
    """Simulate a plurality system, where voters cast a single vote and the top candidates win."""
    def __str__(self):
        return "Plurality (SNTV/FPTP)"
    
    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        ballots = []

        # Iterate through every voter block
        for block in voters:
            district_id = block.district_id
            voteable_candidates = [c for c in candidates if c.district_id == district_id] # Get district candidates
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
        
        district_lookup = {d.id: d for d in districts}
        winners = {"NATIONAL_LIST": []} # no national list

        # Now determine who won
        for (d_id, vote_counts) in local_votes.items():
            num_seats = district_lookup[d_id].num_seats

            # SNTV/Block: Top N candidates are winners
            if vote_counts and any(v > 0 for v in vote_counts.values()):
                sorted_candidates = sorted(vote_counts, key=lambda k: vote_counts[k], reverse=True)
                winners[d_id] = sorted_candidates[:num_seats]
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
                "entitlements": {}, # No proportional entitlements for plurality
                "notes": []
            }
        }