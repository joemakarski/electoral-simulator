import math
from typing import List, Dict, Tuple, Set
from collections import defaultdict

from simulator.systems.base import ElectoralSystem
from simulator.domain.entities import VoterBlock, Candidate, Ballot, District
from simulator.systems.utils import calculate_distance, exponential_decay

STV_SENSITIVITY = 0.2 # TODO: Move this to common area with other systems?

class SingleTransferableVote(ElectoralSystem):
    """
    Implements the Single Transferable Vote (STV) system with Droop Quota 
    and Fractional Surplus Transfers.
    """
    def __str__(self):
        return "Single Transferable Vote (STV)"


    def simulate_voting(self, voters: List[VoterBlock], candidates: List[Candidate]) -> List[Ballot]:
        """Generate ranked-choice ballots for each voter blocks, ordered by voter-candidate proximity."""

        ballots: List[Ballot] = []

        for block in voters:
            district_id = block.district_id
            local_candidates = [c for c in candidates if c.district_id == district_id]
            if not local_candidates: continue

            # Calculate proximities and weights 
            candidate_proximities = {
                c.id: calculate_distance(block.positions, c.positions) 
                for c in local_candidates
            }
            candidate_weights = {
                c_id: exponential_decay(dist, STV_SENSITIVITY) 
                for (c_id, dist) in candidate_proximities.items()
            }
            total_weight = sum(candidate_weights.values())

            # Distribute the block's population across different first-preferences
            # Since multiple first choices could exist for similar distance candidates, handle them each
            candidates_by_weight = sorted(candidate_weights.keys(), key=lambda k: candidate_weights[k], reverse=True)
            allocated_votes = 0
            
            for first_choice_id in candidates_by_weight: 
                vote_share = candidate_weights[first_choice_id] / total_weight
                votes = int(block.population * vote_share)
                if votes <= 0: continue

                # Rank the remaining ballot, purely based on the proximities
                remaining_candidates = [c for c in local_candidates if c.id != first_choice_id]
                remaining_ordered_candidates = sorted(remaining_candidates, key=lambda c: candidate_proximities[c.id])

                ranked_candidate_ids = [first_choice_id] + [cand.id for cand in remaining_ordered_candidates]
            
                ballots.append(Ballot(
                    district_id=block.district_id,
                    population_weight=votes,
                    choices=ranked_candidate_ids
                ))
                allocated_votes += votes

            # Absolute closest candidate gets remainder attached on
            remainder = block.population - allocated_votes
            if remainder > 0 and ballots:
                ballots[0].population_weight += remainder

        return ballots
    

    def allocate_seats(self, ballots: List[Ballot], districts: List[District], candidates: List[Candidate], **kwargs) -> Dict:
        """Run the multi-round STV algorithm, and record each round."""

        (local_votes, national_party_votes) = self._tally_standard_votes(ballots, candidates, districts)

        winners: Dict[str, List[str]] = {d.id: [] for d in districts}
        winners["NATIONAL_LIST"] = []

        global_round_details: Dict[str, list] = {}

        for district in districts:
            local_candidates = [c for c in candidates if c.district_id == district.id]

            if not local_candidates or district.num_seats <= 0: continue

            (district_winners, round_logs) = self._perform_stv(
                district.num_seats, ballots, candidates
            )

            winners[district.id] = district_winners
            global_round_details[district.id] = round_logs

        return {
            "results": {
                "local_votes": local_votes,
                "national_party_votes": national_party_votes,
                "rounds": global_round_details
            },
            "stats": {
                "entitlements": {},
                "notes": [],
                "total_parliament_size": sum(d.num_seats for d in districts)
            },
            "winners": winners,
        }
    

    # INTERNAL MECHANICS:

    def _perform_stv(self, num_seats: int, ballots: List[Ballot], candidates: List[Candidate]) -> Tuple[List[str], List[dict]]:
        """Orchestrate the STV round-by-round transfers, and return the details."""
        elected: List[str] = []
        invalid_candidates: Set[str] = set() # Holds both elected and eliminated candidates
        
        quota = math.floor(sum(b.population_weight for b in ballots) / (num_seats + 1)) + 1

        # Track state of each running ballot: [choices_list, current_pointer, current_weight]
        running_ballots = [{
            "choices": b.choices, 
            "pointer": 0, 
            "weight": float(b.population_weight)
            } for b in ballots if b.choices 
        ]

        round_counter = 1
        round_logs = []

        while len(elected) < num_seats:
            # Calculate active votes
            current_tally = self._tally_active_votes(running_ballots, invalid_candidates)
            display_tally = {
                c_id: int(round(v)) 
                for (c_id, v) in current_tally.items()
            }
            
            # If the number of contingent candidates is the same as the number of seats left, just elect all of them
            contingent_ids = [c.id for c in candidates if c.id not in invalid_candidates]
            seats_left = num_seats - len(elected)

            if len(contingent_ids) <= seats_left and len(contingent_ids) > 0:
                for c_id in contingent_ids:
                    elected.append(c_id)
                    invalid_candidates.add(c_id)
                    round_logs.append({
                        "round": round_counter, 
                        "tally": display_tally, 
                        "action": "elected", 
                        "candidate_id": c_id, 
                        "transfers": {}, 
                        "quota": quota
                    })
                    round_counter += 1
                break

            # Get candidates and votes who have reached the quota
            above_quota = {
                c_id: v 
                for (c_id, v) in current_tally.items() if (v >= quota)
            }

            # If someone has met the quota, elect the biggest winner
            if above_quota:
                target_id = max(above_quota, key=lambda k: above_quota[k])
                action = "elected"
                elected.append(target_id)
                
                # Calculate fractional surplus
                transfer_ratio = (current_tally[target_id] - quota) / current_tally[target_id] if current_tally[target_id] > 0 else 0.0
            # If not, eliminate the loser
            else:
                target_id = min(current_tally, key=lambda k: current_tally[k])
                action = "eliminated"
                
                transfer_ratio = 1.0 # transfer 100% of votes

            invalid_candidates.add(target_id)

            # Now transfer, and log
            transfers = self._transfer_votes(running_ballots, target_id, invalid_candidates, transfer_ratio)
            
            round_logs.append({
                "round": round_counter, 
                "tally": display_tally, 
                "action": action, 
                "candidate_id": target_id, 
                "transfers": transfers, 
                "quota": quota
            })
            round_counter += 1

        return elected[:num_seats], round_logs
    

    def _get_next_preference(self, rb: dict, invalid_candidates: Set[str]) -> str:
        """Return the next valid choice (skipping over elected/eliminated candidates)."""
        while rb["pointer"] < len(rb["choices"]) and rb["choices"][rb["pointer"]] in invalid_candidates:
            rb["pointer"] += 1
        
        if rb["pointer"] < len(rb["choices"]):
            return rb["choices"][rb["pointer"]]
        return ""

    def _tally_active_votes(self, running_ballots: List[dict], invalid_candidates: Set[str]) -> Dict[str, float]:
        """Tallies the current top preference for all running ballots. Returns a {pref: votes} dict."""
        tally = defaultdict(float)
        for rb in running_ballots:
            pref = self._get_next_preference(rb, invalid_candidates)
            if not pref: continue
            tally[pref] += rb["weight"]
        return tally

    def _transfer_votes(self, running_ballots: List[dict], from_id: str, invalid_candidates: Set[str], ratio: float) -> Dict[str, int]:
        """Transfer votes from the target candidate to the next valid preferences, according to the transfer ratio."""
        transfers_record = defaultdict(float)

        for rb in running_ballots:
            current_pref = rb["choices"][rb["pointer"]] if rb["pointer"] < len(rb["choices"]) else None
            
            if current_pref == from_id:
                rb["pointer"] += 1 # Force step past the target candidate
                next_pref = self._get_next_preference(rb, invalid_candidates)
                
                if next_pref:
                    transfers_record[next_pref] += rb["weight"] * ratio
                
                rb["weight"] *= ratio # Apply fractional degradation

        return {
            c_id: int(round(v)) 
            for (c_id, v) in transfers_record.items() if v > 0
        }