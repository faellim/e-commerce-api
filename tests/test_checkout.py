from tests.conftest import auth_headers


def test_checkout_reduces_stock_and_creates_order(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Admin User",
            "email": "admin@example.com",
            "password": "secret123",
        },
    )
    admin_headers = auth_headers(client, "admin@example.com", "secret123")

    product_response = client.post(
        "/api/v1/products",
        headers=admin_headers,
        json={
            "name": "Mechanical Keyboard",
            "description": "Compact wireless mechanical keyboard for developers.",
            "price": 499.9,
            "stock": 5,
            "sku": "KEY-001",
            "category": "Peripherals",
        },
    )
    product_id = product_response.json()["id"]

    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Customer User",
            "email": "customer@example.com",
            "password": "secret123",
        },
    )
    customer_headers = auth_headers(client, "customer@example.com", "secret123")

    add_to_cart_response = client.post(
        "/api/v1/cart/items",
        headers=customer_headers,
        json={"product_id": product_id, "quantity": 2},
    )
    assert add_to_cart_response.status_code == 201

    checkout_response = client.post(
        "/api/v1/orders/checkout",
        headers=customer_headers,
    )

    assert checkout_response.status_code == 201
    assert checkout_response.json()["total_amount"] == "999.80"
    assert len(checkout_response.json()["items"]) == 1

    product_after_checkout = client.get(f"/api/v1/products/{product_id}")
    assert product_after_checkout.json()["stock"] == 3
