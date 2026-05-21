from simulator.domain.entities import PositionVector
import math

def calculate_distance(voter_positions: PositionVector, candidate_positions: PositionVector) -> float:
    """
    Calculates the Euclidean distance between a VoterBlock and a Candidate 
    across any number of dimensions.
    """
    sum_of_squared_differences = 0.0
    
    # For each voter position on an issue, compare with candidate's position on that issue  
    for (axis, voter_value) in voter_positions.items():
        candidate_value = candidate_positions.get(axis, 0.0) # assume 0 if no position
         
        sum_of_squared_differences += (candidate_value - voter_value) ** 2
        
    # Return the square root of the sum: sqrt( (x2-x1)^2 + (y2-y1)^2 + ... )
    return math.sqrt(sum_of_squared_differences)