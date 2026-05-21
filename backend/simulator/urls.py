from django.urls import path
from .views import RunSimulationView

urlpatterns = [
    path('simulate/', RunSimulationView.as_view(), name='run-simulation'), # after POST(http://localhost:8000/api/simulate/)
]