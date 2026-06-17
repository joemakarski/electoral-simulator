from typing import Dict, List

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.base import ElectoralSystem

#TODO: implement on frontend

class BlockVoting(ElectoralSystem):
    """Simulate a plurality block voting system, where voters cast as many votes as there are seats."""
    def __str__(self):
        return "Plurality Block"
    
    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        ballots = []

        # Iterate through every voter block
        for block in voters:
            district_id = block.district_id
            local_candidates = [c for c in candidates if c.district_id == district_id] # Get district candidates
            if not local_candidates: continue
 
            # Distribute along closest voteable candidates for each voting block
            vote_distribution = self._distribute_block_votes(block, local_candidates)

            # Create a ballot for every candidate who got a share of this block's votes
            for c_id, votes in vote_distribution.items():
                if votes > 0:
                    ballots.append(
                        Ballot(
                            district_id=block.district_id,
                            population_weight=votes,
                            choices=[c_id]
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