from rest_framework import serializers
from .models import Pizza, Order, OrderItem


class PizzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pizza
        fields = "__all__"



class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["pizza", "quantity", "price"]
        read_only_fields = ["price"]



class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "customer_name",
            "mobile",
            "address",
            "latitude",
            "longitude",
            "total_amount",
            "payment_method",
            "status",
            "created_at",
            "items",
        ]
        read_only_fields = ["id", "user", "status", "created_at"]

    
    def create(self, validated_data):
        from decimal import Decimal
        from django.db import transaction
        from rest_framework import serializers

        items_data = validated_data.pop("items")

        if not items_data:
            raise serializers.ValidationError(
                {"items": "Your order must contain at least one item."}
            )

        total = Decimal("0.00")
        prepared_items = []

        for item_data in items_data:
            pizza = item_data["pizza"]
            quantity = item_data["quantity"]

            if quantity < 1:
                raise serializers.ValidationError(
                    {"quantity": "Quantity must be at least 1."}
                )

            price = pizza.price
            total += price * quantity
            prepared_items.append({
                "pizza": pizza,
                "quantity": quantity,
                "price": price,
            })

        # Add the existing ₹30 delivery charge
        total += Decimal("30.00")

        with transaction.atomic():
            order = Order.objects.create(
                **validated_data,
                total_amount=total,
                payment_method="COD",
            )

            for item in prepared_items:
                OrderItem.objects.create(order=order, **item)

        return order
