from rest_framework import serializers
from .models import DatasetUpload, EquipmentRecord


class EquipmentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentRecord
        fields = "__all__"


class DatasetUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetUpload
        fields = "__all__"


class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
