def test_register_login_and_me_flow(client):
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Admin User",
            "email": "admin@example.com",
            "password": "secret123",
        },
    )

    assert register_response.status_code == 201
    assert register_response.json()["is_admin"] is True

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@example.com", "password": "secret123"},
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@example.com"
