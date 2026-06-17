from typing import Dict, List
from collections import defaultdict

from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.base import ElectoralSystem

class MixedMemberProportionalRepresentation(ElectoralSystem):
    """
    Implements Mixed-Member Proportional Representation (MMP).
    Uses FPTP for local districts and D'Hondt for national list proportional top-ups.
    """
    def __str__(self):
        return "Mixed-Member Proportional (MMP)"
    
    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        ballots = []

        # Iterate through every voter block
        for block in voters:
            
            # 1. The local vote
            local_candidates = [c for c in candidates if c.district_id == block.district_id]
            if local_candidates:
                # Distribute along closest voteable candidates for each voting block
                local_distribution = self._distribute_block_votes(block, local_candidates)

                # Create a ballot for every candidate who got a share of this block's votes
                for (c_id, votes) in local_distribution.items():
                    if votes > 0:
                        ballots.append(
                            Ballot(
                                district_id=block.district_id,
                                population_weight=votes,
                                choices=[c_id, ""]
                            )
                        )
            
            # 2. The party list vote
            list_candidates = [c for c in candidates if c.district_id is None]
            if list_candidates:
                list_distribution = self._distribute_block_votes(block, list_candidates)

                # Create a ballot for every candidate who got a share of this block's votes
                for (c_id, votes) in list_distribution.items():
                    if votes > 0:
                        ballots.append(
                            Ballot(
                                district_id=block.district_id,
                                population_weight=votes,
                                choices=["", c_id]
                            )
                        )

        return ballots

    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> Dict:

        local_seats_available = sum(d.num_seats for d in districts)
        list_seats_available = kwargs.get('list_seats', local_seats_available)
        threshold = kwargs.get('threshold', 0.0)

        party_lookup = {c.id: c.party_id for c in candidates}
        winners = {d.id: [] for d in districts}
        winners["NATIONAL_LIST"] = [] # A special bucket for the top-up seats
        notes = []

        # 1. Tally local and party votes
        local_votes: Dict[str, Dict[str, int]] = {
            d.id: {c.id: 0 for c in candidates if c.district_id == d.id} 
            for d in districts
        }
        
        # Explicitly initialize all parties to 0
        all_parties = {c.party_id for c in candidates}
        party_votes: Dict[str, int] = {p_id: 0 for p_id in all_parties}
        
        total_party_votes = 0

        for ballot in ballots:
            local_id = ballot.choices[0]
            list_id = ballot.choices[1]
            weight = ballot.population_weight

            # Tally local vote, if any
            if local_id:
                local_votes[ballot.district_id][local_id] += weight

            # Tally national party vote, if any
            if list_id:
                p_id = party_lookup[list_id]
                party_votes[p_id] += weight
                total_party_votes += weight
        
        # 2. Allocate local seats
        local_seats_won_by_party = defaultdict(int)

        for d in districts:
            vote_counts = local_votes[d.id]
            
            if vote_counts and any(v > 0 for v in vote_counts.values()):
                sorted_candidates = sorted(vote_counts, key=lambda k: vote_counts[k], reverse=True)
                local_winners = sorted_candidates[:d.num_seats] # Handle multi-seat district
                winners[d.id].extend(local_winners)

                for winner_id in local_winners:
                    p_id = party_lookup[winner_id]
                    local_seats_won_by_party[p_id] += 1

        # 3. Filter with electoral threshold
        eligible_parties = {
            p_id: votes for p_id, votes in party_votes.items()
            if total_party_votes > 0 and (votes / total_party_votes) >= threshold
        }

        # 4. Calculate proportional entitlement
        total_parliament_seats = local_seats_available + list_seats_available
        entitlements = self._calculate_dhondt_seats(
            votes=eligible_parties,
            total_seats=total_parliament_seats,
        )
        
        # 5. Calculate and award top-up seats
        for (p_id, total_owed) in entitlements.items():
            won_locally = local_seats_won_by_party[p_id]
            
            top_up_needed = total_owed - won_locally
            
            if top_up_needed > 0:
                # Find all at-large candidates for this party
                party_list_candidates = [c.id for c in candidates if c.party_id == p_id and c.district_id is None]
                
                # Check for shortfalls
                if len(party_list_candidates) < top_up_needed:
                    shortfall = top_up_needed - len(party_list_candidates)
                    notes.append(f"Party {p_id} forfeited {shortfall} national list seat(s) due to a lack of candidates.")
                    top_up_needed = len(party_list_candidates)

                # Sort them by their individual popularity (Open List)
                party_list_candidates.sort(
                    key=lambda c_id: sum(b.population_weight for b in ballots if b.choices[1] == c_id), 
                    reverse=True
                )
                
                # Award the top-up seats
                winners["NATIONAL_LIST"].extend(party_list_candidates[:top_up_needed])
        
        return {
            "results": {
                "local_votes": {k: dict(v) for k, v in local_votes.items()},
                "national_party_votes": dict(party_votes),
            },
            "winners": winners,
            "stats": {
                "total_parliament_size": sum(len(w) for w in winners.values()),
                "entitlements": entitlements,
                "notes": notes,
            }
        }
    
    