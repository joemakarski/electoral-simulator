import math, random
from typing import List

from simulator.domain.entities import PositionVector, VoterBlock

#TODO: consider utils.py vs base.py


def calculate_distance(vector1: PositionVector, vector2: PositionVector) -> float:
    """
    Calculates the Euclidean distance between two position vectors across any number of dimensions.
    """
    sum_of_squared_differences = 0.0
    
    for (axis, v1_val) in vector1.items():
        v2_val = vector2.get(axis, 0.0) # assume 0 if no position
        sum_of_squared_differences += (v2_val - v1_val) ** 2
        
    # Return the square root of the sum: sqrt( (x2-x1)^2 + (y2-y1)^2 + ... )
    return math.sqrt(sum_of_squared_differences)


def exponential_decay(x: float, divisor: float) -> float:
    return math.exp(-x / (divisor + 0.001))
    

def apply_voter_fuzzing(voters: List[VoterBlock], num_chunks: int = 10) -> List[VoterBlock]:
    """
    Takes a list of large voter blocks, and smears them into smaller chunks
    along a normal distribution based on the fuzz level.
    """
    smeared_votes = []
    for block in voters:

        # If no fuzz, skip
        if block.fuzz_level <= 0:
            smeared_votes.append(block)
            continue

        adjusted_num_chunks = min(num_chunks, block.population)
        
        chunk_pop = block.population // adjusted_num_chunks
        remainder = block.population % adjusted_num_chunks

        # Append each new chunk of the voter block
        for i in range(adjusted_num_chunks):
            fuzzed_positions = {}

            # Fuzz each axis value on the normal distribution and clamp it  
            for (axis, val) in block.positions.items():
                noise_val = random.gauss(mu=val, sigma=block.fuzz_level)
                fuzzed_positions[axis] = max(-1.0, min(1.0, noise_val))
            
            # Remainder population tacked on in first iteration
            adjusted_chunk_pop = chunk_pop + (remainder if i==0 else 0) 

            smeared_votes.append(VoterBlock(
                population=adjusted_chunk_pop,
                positions=fuzzed_positions,
                district_id=block.district_id,
                fuzz_level=block.fuzz_level
            ))
    print("Smeared into", len(smeared_votes))
    return smeared_votes