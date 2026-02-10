from django.urls import path
from .views import DatasetListView, DatasetRecordsView, UploadCSVView
from .views import DatasetPDFView
from django.urls import path
from .views import (
    DatasetListView,
    DatasetRecordsView,
    UploadCSVView,
    DatasetPDFView
)

urlpatterns = [
    path("datasets/", DatasetListView.as_view()),
    path("datasets/<int:dataset_id>/records/", DatasetRecordsView.as_view()),
    path("upload-csv/", UploadCSVView.as_view(), name="upload-csv"),
    path("datasets/<int:dataset_id>/download/", DatasetPDFView.as_view()),

]

