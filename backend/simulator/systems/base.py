from typing import Protocol, List
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