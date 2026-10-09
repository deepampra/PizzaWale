from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import PizzaViewSet, OrderViewSet, owner_dashboard, signup, login, dashboard_stats
router = DefaultRouter()
router.register("pizzas", PizzaViewSet)
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("signup/", signup),
    path("login/", login),
    path("dashboard/", owner_dashboard),
    path("dashboard-stats/", dashboard_stats),
    
] + router.urls