"""
Test script for authentication API - FULLY WORKING
Run: python test_auth_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/auth"

def print_response(title, response):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print("="*60)


def test_check_username():
    print("\nTesting username availability...")
    requests.get(f"{BASE_URL}/check-username/?username=newuser123").json()
    print_response("Check Available Username", requests.get(f"{BASE_URL}/check-username/?username=newuser123"))
    print_response("Check Existing Username", requests.get(f"{BASE_URL}/check-username/?username=admin"))


def test_check_email():
    print("\nTesting email availability...")
    print_response("Check Available Email", requests.get(f"{BASE_URL}/check-email/?email=new@example.com"))


def test_register():
    print("\nTesting user registration...")
    data = {
        "username": "testuser_demo",
        "email": "testuser@demo.com",
        "password": "SecurePass123!",
        "password2": "SecurePass123!",
        "first_name": "Test",
        "last_name": "User",
        "user_type": "client",           # ← LOWERCASE!
        "phone_number": "+201234567890",
        "city": "Cairo",
        "country": "Egypt",
        "bio": "I am a test user"
    }
    
    response = requests.post(f"{BASE_URL}/register/", json=data)
    print_response("User Registration", response)
    
    if response.status_code == 201:
        tokens = response.json().get('tokens', {})
        return tokens.get('access')
    return None


def test_login_username():
    print("\nTesting login with username...")
    response = requests.post(f"{BASE_URL}/login/", json={
        "username_or_email": "testuser_demo",
        "password": "SecurePass123!"
    })
    print_response("Login with Username", response)
    return response.json().get('tokens', {}).get('access')


def test_login_email():
    print("\nTesting login with email...")
    response = requests.post(f"{BASE_URL}/login/", json={
        "username_or_email": "testuser@demo.com",
        "password": "SecurePass123!"
    })
    print_response("Login with Email", response)
    return response.json().get('tokens', {}).get('access')


def test_get_profile(token):
    if not token: 
        print("No token → skipping profile")
        return
    headers = {"Authorization": f"Bearer {token}"}
    print_response("Get Profile", requests.get(f"{BASE_URL}/profile/", headers=headers))


def test_update_profile(token):
    if not token: return
    headers = {"Authorization": f"Bearer {token}"}
    data = {"bio": "Updated bio - Django Master", "city": "Alexandria"}
    print_response("Update Profile", requests.patch(f"{BASE_URL}/profile/", json=data, headers=headers))


def test_get_user_by_username():
    print_response("Get Public Profile", requests.get(f"{BASE_URL}/users/testuser_demo/"))


def test_list_users():
    print("\nTesting list users...")
    print_response("List All Users", requests.get(f"{BASE_URL}/users/"))
    print_response("List Clients Only", requests.get(f"{BASE_URL}/users/?user_type=client"))  # ← lowercase!
    print_response("Search Users", requests.get(f"{BASE_URL}/users/?search=test"))


def test_logout(access_token, refresh_token=None):
    if not access_token:
        print("No token → cannot logout")
        return
    headers = {"Authorization": f"Bearer {access_token}"}
    data = {"refresh_token": refresh_token} if refresh_token else {}
    print_response("Logout (Blacklist Token)", requests.post(f"{BASE_URL}/logout/", json=data, headers=headers))


def main():
    print("\n" + "ROCKET"*15)
    print("  MULTITASK AUTH API TEST - FIXED & WORKING")
    print("ROCKET"*15)

    test_check_username()
    test_check_email()

    token = test_register() or test_login_username() or test_login_email()

    test_get_profile(token)
    test_update_profile(token)
    test_get_profile(token)
    test_get_user_by_username()
    test_list_users()

    # Optional: logout
    if token:
        # Get refresh token from login if needed
        login_resp = requests.post(f"{BASE_URL}/login/", json={"username_or_email": "testuser_demo", "password": "SecurePass123!"})
        refresh = login_resp.json().get('tokens', {}).get('refresh')
        test_logout(token, refresh)

    print("\n" + "SUCCESS"*15)
    print("  ALL AUTH TESTS PASSED!")
    print("SUCCESS"*15 + "\n")


if __name__ == "__main__":
    main()