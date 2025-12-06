import requests
import json

# Test registration endpoint
url = "http://127.0.0.1:8000/api/auth/register/"

# Test data
data = {
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password": "TestPassword123!",
    "password2": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "CLIENT"
}

print("Testing registration endpoint...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("\n" + "="*50 + "\n")

try:
    response = requests.post(url, json=data, headers={"Content-Type": "application/json"})

    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print("\nResponse Body:")
    print(json.dumps(response.json(), indent=2))

except requests.exceptions.ConnectionError:
    print("ERROR: Cannot connect to backend. Is the server running?")
    print("Start it with: start-backend.bat")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    if hasattr(e, 'response'):
        print(f"Response text: {e.response.text}")
