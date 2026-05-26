from typing import Any, Dict, cast

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from simulator.serializers import SimulationRequestSerializer
from simulator.systems.plurality import Plurality
from simulator.systems.listpr import OpenListProportionalRepresentation
from simulator.systems.mmp import MixedMemberProportionalRepresentation
from simulator.systems.utils import apply_voter_fuzzing

import json
SYSTEM_REGISTRY = {
    'plurality': Plurality(),
    'listpr': OpenListProportionalRepresentation(),
    'mmp': MixedMemberProportionalRepresentation(),
}

class RunSimulationView(APIView):
    """
    API endpoint that accepts map data, candidates, and voters, 
    runs a selected electoral simulation in-memory, and returns the results.
    """
    def post(self, request, *args, **kwargs):
        serializer = SimulationRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        simulation_data = cast(Dict[str, Any], serializer.save())
        
        system_type = simulation_data['system']
        districts = simulation_data['districts']
        candidates = simulation_data['candidates']
        voters = simulation_data['voters']
        
        fuzzed_voters = apply_voter_fuzzing(voters, num_chunks=100)

        engine = SYSTEM_REGISTRY.get(system_type)
        if not engine:
            return Response(
                {"error": f"Electoral system '{system_type}' is not supported."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ballots = engine.simulate_voting(voters=fuzzed_voters, candidates=candidates)
            results = engine.allocate_seats(ballots=ballots, districts=districts, candidates=candidates)

            return Response(results, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {"error": "An error occurred during simulation.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )