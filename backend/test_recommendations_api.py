"""
Test script for Recommendations API
Run: python test_recommendations_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
ACCESS_TOKEN = None

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

def get_headers():
    if ACCESS_TOKEN:
        return {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    return {}

def login_as_freelancer():
    global ACCESS_TOKEN
    print("\n🔐 Logging in as freelancer...")
    
    data = {
        "username_or_email": "sara_freelancer",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    if response.status_code == 200:
        ACCESS_TOKEN = response.json()['tokens']['access']
        print("✅ Logged in successfully")

def test_recommended_tasks():
    print("\n🎯 Testing recommended tasks...")
    response = requests.get(
        f"{BASE_URL}/recommendations/tasks/?limit=5",
        headers=get_headers()
    )
    print_response("Recommended Tasks", response)

def test_user_preferences():
    print("\n⚙️ Testing user preferences...")
    
    # Get preferences
    response = requests.get(
        f"{BASE_URL}/recommendations/preferences/",
        headers=get_headers()
    )
    print_response("Get Preferences", response)
    
    # Update preferences
    data = {
        "preferred_categories": "1,2,4",
        "min_budget": 500,
        "max_budget": 5000,
        "preferred_location": "Cairo",
        "prefer_remote": True
    }
    
    response = requests.patch(
        f"{BASE_URL}/recommendations/preferences/",
        json=data,
        headers=get_headers()
    )
    print_response("Update Preferences", response)

def login_as_client():
    global ACCESS_TOKEN
    print("\n🔐 Logging in as client...")
    
    data = {
        "username_or_email": "john_client",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    if response.status_code == 200:
        ACCESS_TOKEN = response.json()['tokens']['access']
        print("✅ Logged in successfully")

def test_recommended_freelancers():
    print("\n👥 Testing recommended freelancers...")
    
    # Get a task first
    response = requests.get(f"{BASE_URL}/tasks/my-tasks/", headers=get_headers())
    if response.status_code == 200 and response.json()['results']:
        task_id = response.json()['results'][0]['id']
        
        response = requests.get(
            f"{BASE_URL}/recommendations/freelancers/{task_id}/?limit=5",
            headers=get_headers()
        )
        print_response("Recommended Freelancers", response)

def main():
    print("\n" + "🚀"*30)
    print("  RECOMMENDATIONS API TESTS")
    print("🚀"*30)
    
    try:
        # Test as freelancer
        login_as_freelancer()
        test_recommended_tasks()
        test_user_preferences()
        
        # Test as client
        login_as_client()
        test_recommended_freelancers()
        
        print("\n" + "✅"*30)
        print("  ALL TESTS COMPLETED!")
        print("✅"*30 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()