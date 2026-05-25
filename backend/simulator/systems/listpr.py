from typing import Dict, List
from collections import defaultdict

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.base import ElectoralSystem
from simulator.systems.utils import calculate_distance

class OpenListProportionalRepresentation(ElectoralSystem):
    """
    Implements Regional Party-List Proportional Representation using the D'Hondt method.
    Assumes Open List (seats go to the highest voted candidates within the winning party).
    """
    def __str__(self):
        return "Open List Proportional Representation"
    
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

    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> dict:
        party_lookup = {c.id: c.party_id for c in candidates}

        (local_votes, national_party_votes) = self._tally_standard_votes(ballots, candidates, districts)

        winners = {"NATIONAL_LIST": []}
        notes = []

        # Each district had its own proportional election
        for d in districts:
            district_votes = local_votes[d.id]

            # Agreggate votes by party
            party_votes = defaultdict(int)
            for (c_id, votes) in district_votes.items():
                p_id = party_lookup[c_id]
                party_votes[p_id] = party_votes[p_id] + votes

            district_candidates = {
                p_id: sorted(
                    [c_id for c_id in district_votes if party_lookup[c_id] == p_id],
                    key=lambda c_id: district_votes[c_id],
                    reverse=True
                )
                for p_id in party_votes
            }
             
            # Initialise, then start allocating seats via D'Hondt
            candidate_limits = {p_id: len(candidates) for (p_id, candidates) in district_candidates.items()}
            
            # Call the universal D'Hondt math engine
            seats_won = self._calculate_dhondt_seats(
                votes=party_votes, 
                total_seats=d.num_seats,
                max_seats_per_party=candidate_limits
            )
            
            # Check if any seats were forfeited
            total_awarded = sum(seats_won.values())
            if total_awarded < d.num_seats:
                notes.append(f"District {d.name} forfeited {d.num_seats - total_awarded} seat(s) due to lack of eligible candidates.")
            
            # Assign the candidates to the seats won
            district_winners = []
            for p_id, count in seats_won.items():
                if count > 0:
                    # Slice in the top N
                    district_winners.extend(district_candidates[p_id][:count])
                    
            winners[d.id] = district_winners


        return {
            "results": {
                "local_votes": local_votes,
                "national_party_votes": dict(national_party_votes)
            },
            "winners": winners,
            "stats": {
                "total_parliament_size": sum(len(w) for w in winners.values()),
                "entitlements": {},
                "notes": notes
            }
        }