from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # DRF login & logout
    path("api/auth/", include("rest_framework.urls")),

    # Your equipment APIs
    path("api/", include("equipment.urls")),
]
