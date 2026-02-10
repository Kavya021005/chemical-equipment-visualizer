from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
def home(request):
    return JsonResponse({
        "status": "OK",
        "message": "Chemical Equipment Visualizer API is running"
    })


urlpatterns = [
    path("admin/", admin.site.urls),

    # DRF login & logout
    path("api/auth/", include("rest_framework.urls")),

    # Your equipment APIs
    path("api/", include("equipment.urls")),
     path("", home),
]
