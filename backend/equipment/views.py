import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import GenericAPIView
import os
from django.http import FileResponse, Http404
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


from .pdf_utils import generate_dataset_pdf
from django.http import FileResponse
from django.conf import settings
import os

from .pdf_utils import generate_dataset_pdf



from .models import DatasetUpload, EquipmentRecord
from .serializers import (
    DatasetUploadSerializer,
    EquipmentRecordSerializer,
    CSVUploadSerializer
)


class DatasetListView(APIView):
    """
    Public API – anyone can view datasets
    """
    def get(self, request):
        datasets = DatasetUpload.objects.order_by("-uploaded_at")[:5]
        serializer = DatasetUploadSerializer(datasets, many=True)
        return Response(serializer.data)


class DatasetRecordsView(APIView):
    """
    Public API – anyone can view records
    """
    def get(self, request, dataset_id):
        records = EquipmentRecord.objects.filter(dataset_id=dataset_id)
        serializer = EquipmentRecordSerializer(records, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name="dispatch")
class UploadCSVView(GenericAPIView):
    """
    Protected API – login required to upload CSV
    """
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = CSVUploadSerializer
    

    def get(self, request):
        return Response({"message": "Use POST method to upload CSV file."})

    def post(self, request):
        serializer = CSVUploadSerializer(data=request.data)

        if not serializer.is_valid():
           return Response(serializer.errors, status=400)

        file = serializer.validated_data["file"]

        # Read CSV
        df = pd.read_csv(file)
        df.columns = [c.strip().lower() for c in df.columns]

        # Create dataset
        dataset = DatasetUpload.objects.create(filename=file.name)

        # Save records
        for _, row in df.iterrows():
            EquipmentRecord.objects.create(
                dataset=dataset,
                equipment_name=row.get("equipment name"),
                type=row.get("type"),
                flowrate=row.get("flowrate"),
                pressure=row.get("pressure"),
                temperature=row.get("temperature"),
            )

        # Summary stats
        dataset.total_count = len(df)
        dataset.avg_flowrate = float(df["flowrate"].mean())
        dataset.avg_pressure = float(df["pressure"].mean())
        dataset.avg_temperature = float(df["temperature"].mean())
        dataset.type_distribution = df["type"].value_counts().to_dict()
        dataset.save()

        # Keep only last 5 datasets
        all_datasets = DatasetUpload.objects.order_by("-uploaded_at")
        if all_datasets.count() > 5:
            for old in all_datasets[5:]:
                old.delete()

        return Response(
            {"message": "CSV uploaded successfully", "dataset_id": dataset.id},
            status=status.HTTP_201_CREATED
        )
class DatasetPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        pdf_dir = os.path.join(settings.BASE_DIR, "pdf_reports")
        os.makedirs(pdf_dir, exist_ok=True)

        file_path = os.path.join(pdf_dir, f"dataset_{dataset_id}_report.pdf")

        try:
            generate_dataset_pdf(dataset_id, file_path)
        except Exception:
            raise Http404("Dataset not found")

        return FileResponse(
            open(file_path, "rb"),
            as_attachment=True,
            filename=f"dataset_{dataset_id}_report.pdf"
        )
class DatasetPDFView(APIView):
    def get(self, request, dataset_id):
        reports_dir = os.path.join(settings.BASE_DIR, "reports")
        os.makedirs(reports_dir, exist_ok=True)

        file_path = os.path.join(reports_dir, f"dataset_{dataset_id}_report.pdf")

        generate_dataset_pdf(dataset_id, file_path)

        return FileResponse(
            open(file_path, "rb"),
            as_attachment=True,
            filename=f"dataset_{dataset_id}_report.pdf"
        )
