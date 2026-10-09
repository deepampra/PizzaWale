from django.contrib.auth import authenticate
from django.shortcuts import render
from django.http import HttpResponseForbidden
from django.contrib.auth.models import User

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Pizza, Order
from .serializers import PizzaSerializer, OrderSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response


class PizzaViewSet(viewsets.ModelViewSet):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer



class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Order.objects.all().order_by("-created_at")

        return Order.objects.filter(
            user=user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Only owner can update order status."},
                status=403
            )

        order = self.get_object()
        new_status = request.data.get("status")

        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"},
                status=400
            )

        order.status = new_status
        order.save()

        return Response({
            "message": "Order status updated",
            "status": order.status
        })

def update(self, request, *args, **kwargs):
    if not request.user.is_staff:
        return Response(
            {"error": "Only owner can update orders."},
            status=403
        )
    return super().update(request, *args, **kwargs)

def destroy(self, request, *args, **kwargs):
    if not request.user.is_staff:
        return Response(
            {"error": "Only owner can delete orders."},
            status=403
        )
    return super().destroy(request, *args, **kwargs)
  


    


def owner_dashboard(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return HttpResponseForbidden("Access denied. Owner only.")

    orders = Order.objects.all().order_by("-created_at")

    total_orders = orders.count()
    pending_orders = orders.filter(status="pending").count()
    accepted_orders = orders.filter(status="accepted").count()

    delivered_orders = orders.filter(status="delivered")
    total_sales = sum(order.total_amount for order in delivered_orders)

    return render(
        request,
        "orders/dashboard.html",
        {
            "orders": orders,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "accepted_orders": accepted_orders,
            "total_sales": total_sales,
        }
    )


@api_view(["POST"])
def signup(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )

    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "Account created successfully.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })
@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "message": "Login successful.",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "username": user.username,
    })
@api_view(["GET"])
def dashboard_stats(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response(
            {"error": "Access denied. Owner only."},
            status=403
        )
    
    pending_orders = Order.objects.filter(status="pending").count()

    return Response({
        "pending_orders": pending_orders
    })