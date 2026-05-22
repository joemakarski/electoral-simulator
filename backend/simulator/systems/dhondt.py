from typing import Dict, List
from collections import defaultdict

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.base import ElectoralSystem
from simulator.systems.utils import calculate_distance

class DHondtProportionalRepresentation(ElectoralSystem):
    """
    Implements Regional Party-List Proportional Representation using the D'Hondt method.
    Assumes Open List (seats go to the highest voted candidates within the winning party).
    """
    def __str__(self):
        return "D'Hondt Proportional Representation (open list)"
    
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

    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> dict:
        party_lookup = {c.id: c.party_id for c in candidates}

        local_votes: Dict[str, Dict[str, int]] = {
            d.id: {c.id: 0 for c in candidates if c.district_id == d.id or c.district_id is None} 
            for d in districts
        }
        national_party_votes: Dict[str, int] = defaultdict(int)

        # Tally candidate results
        for ballot in ballots:
            d_id = ballot.district_id
            choice_id = ballot.choices[0]
            weight = ballot.population_weight
            
            local_votes[d_id][choice_id] += weight
            national_party_votes[party_lookup[choice_id]] += weight

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
            seats_by_party = {p_id: 0 for p_id in party_votes.keys()}
            district_winners = []
        
            # Formula: Total Votes / (party seats so far + 1), for each party, until seats filled
            
            for _ in range(d.num_seats):
                # Filter to parties which have unelected candidates
                eligible_party_votes = {
                    p_id: votes
                    for (p_id, votes) in party_votes.items()
                    if seats_by_party[p_id] < len(district_candidates[p_id])
                }
                if not eligible_party_votes: 
                    notes.append(f"District {d.name} forfeited seats due to lack of eligible candidates.")
                    break

                quotients = {
                    p_id: (votes / (seats_by_party[p_id] + 1))
                    for (p_id, votes) in eligible_party_votes.items()
                }

                winning_party = max(quotients, key=lambda k: quotients[k])

                # Candidate index points to the candidate list of a party
                candidate_index = seats_by_party[winning_party]
                district_winners.append(district_candidates[winning_party][candidate_index])

                seats_by_party[winning_party] += 1
                
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