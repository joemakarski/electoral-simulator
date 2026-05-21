import json

from simulator.domain.entities import District, Candidate, VoterBlock
from simulator.systems.fptp import FirstPastThePost

ENGINE = FirstPastThePost()

if __name__ == "__main__":
    # Geography
    urban = District(id="D1", name="Urban", num_seats=2)
    suburban = District(id="D2", name="Suburban", num_seats=2)
    districts = [urban, suburban]

    # Candidates (running at-large)
    candidates = [
        Candidate(id="C_RED", name="Alice (Left Party)", party_id="P1", positions={"economy": -0.8, "social": -0.8}, district_id=None),
        Candidate(id="C_RED2", name="Anita (Left Party)", party_id="P1", positions={"economy": -0.7, "social": -0.9}, district_id=None),
        Candidate(id="C_BLUE", name="Bob (Right Party)", party_id="P2", positions={"economy": 0.8, "social": 0.8}, district_id=None),
        Candidate(id="C_GREEN", name="Charlie (Center Party)", party_id="P3", positions={"economy": 0.0, "social": 0.0}, district_id=None)
    ]

    # Voter blocks
    voters = [
        # Urban District: Highly polarized, mostly Left.
        VoterBlock(population=60000, positions={"economy": -0.9, "social": -0.7}, district_id="D1"),
        VoterBlock(population=30000, positions={"economy": 0.7, "social": 0.9}, district_id="D1"),
        VoterBlock(population=10000, positions={"economy": 0.1, "social": 0.0}, district_id="D1"),

        # Suburban District: Centrist and slight Right lean.
        VoterBlock(population=20000, positions={"economy": -0.2, "social": -0.1}, district_id="D2"),
        VoterBlock(population=45000, positions={"economy": 0.6, "social": 0.5}, district_id="D2"),
        VoterBlock(population=35000, positions={"economy": 0.0, "social": 0.2}, district_id="D2")
    ]

    # Run the election, get the ballots and allocate seats
    print(f"\n--- RUNNING ELECTION SIMULATION, using: {ENGINE} ---")
    ballots = ENGINE.simulate_voting(voters, candidates)
    results = ENGINE.allocate_seats(ballots, districts, candidates)
    
    # Print output
    candidate_lookup = {c.id: c.name for c in candidates}
    district_lookup = {d.id: d.name for d in districts}

    # print("Ballots:")
    # print(json.dumps(ballots))

    print("Results JSON:")
    print(json.dumps(results, sort_keys=True, indent=4))

    for (d_id, votes) in results["results"].items():
        print(f"\nResults for {district_lookup[d_id]} District:")
        for (c_id, count) in votes.items():
            print(f"  - {candidate_lookup[c_id]}: {count:,} votes")
        
        winner_ids = results["winners"][d_id]
        print(f"  >> WINNERS: {[candidate_lookup[w] for w in winner_ids]}\n")