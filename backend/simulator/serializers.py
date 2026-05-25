from rest_framework import serializers
from simulator.domain.entities import VoterBlock, Candidate, District


class DistrictSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    num_seats = serializers.IntegerField(min_value=1)

    def create(self, validated_data):
        return District(**validated_data)


class CandidateSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    party_id = serializers.CharField()
    positions = serializers.DictField(child=serializers.FloatField())
    district_id = serializers.CharField(allow_null=True, required=False)

    def create(self, validated_data):
        return Candidate(**validated_data)
    

class VoterBlockSerializer(serializers.Serializer):
    population = serializers.IntegerField(min_value=1)
    positions = serializers.DictField(child=serializers.FloatField())
    district_id = serializers.CharField()

    def create(self, validated_data):
        return VoterBlock(**validated_data)


class SimulationRequestSerializer(serializers.Serializer):
    """
    The master serializer that validates the entire JSON payload
    sent by Next.js when the user runs an election.
    """
    system = serializers.ChoiceField(
        choices=['plurality', 'listpr', 'mmp'] # Currently available systems only
    ) 
    districts = DistrictSerializer(many=True)
    candidates = CandidateSerializer(many=True)
    voters = VoterBlockSerializer(many=True)

    def create(self, validated_data):
        # Instantiate all the nested objects
        return {
            "system": validated_data['system'],
            "districts": [District(**d) for d in validated_data['districts']],
            "candidates": [Candidate(**d) for d in validated_data['candidates']],
            "voters": [VoterBlock(**d) for d in validated_data['voters']]
        }