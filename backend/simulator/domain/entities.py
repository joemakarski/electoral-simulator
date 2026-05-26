from dataclasses import dataclass
from typing import Dict, List

# Multi-dimensional idea-to-position mapping
PositionVector = Dict[str, float]

@dataclass
class District:
    id: str
    name: str
    num_seats: int

@dataclass
class Party:
    id: str
    name: str
    color: str

@dataclass
class Candidate:
    id: str
    name: str
    party_id: str
    positions: PositionVector # Where the candidate stands on the issues
    district_id: str | None # None if running at-large

@dataclass
class VoterBlock:
    population: int
    positions: PositionVector
    district_id: str
    fuzz_level: float = 0.0

@dataclass
class Ballot:
    district_id: str
    population_weight: int
    choices: List[str]