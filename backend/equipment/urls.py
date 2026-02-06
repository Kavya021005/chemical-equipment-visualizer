from django.urls import path
from .views import DatasetListView, DatasetRecordsView, UploadCSVView
from .views import DatasetPDFView


urlpatterns = [
    path("datasets/", DatasetListView.as_view()),
    path("datasets/<int:dataset_id>/records/", DatasetRecordsView.as_view()),
    path("upload/", UploadCSVView.as_view()),
    path("datasets/<int:dataset_id>/pdf/", DatasetPDFView.as_view()),

]

