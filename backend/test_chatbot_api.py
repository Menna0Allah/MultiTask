"""
Test script for Chatbot API
Run: python test_chatbot_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
ACCESS_TOKEN = None
SESSION_ID = None

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

def login():
    global ACCESS_TOKEN
    print("\n🔐 Logging in...")
    
    data = {
        "username_or_email": "john_client",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    if response.status_code == 200:
        ACCESS_TOKEN = response.json()['tokens']['access']
        print("✅ Logged in successfully")

def test_chat():
    global SESSION_ID
    print("\n💬 Testing chat...")
    
    # First message (creates new session)
    data = {
        "message": "Hi! I need help posting a task"
    }
    
    response = requests.post(
        f"{BASE_URL}/chatbot/chat/",
        json=data,
        headers=get_headers()
    )
    print_response("First Chat Message", response)
    
    if response.status_code == 200:
        SESSION_ID = response.json()['session_id']
        
        # Continue conversation
        data = {
            "message": "I need someone to clean my house",
            "session_id": SESSION_ID
        }
        
        response = requests.post(
            f"{BASE_URL}/chatbot/chat/",
            json=data,
            headers=get_headers()
        )
        print_response("Second Chat Message", response)
        
        # Ask about budget
        data = {
            "message": "My budget is around 500 EGP and I'm in Cairo",
            "session_id": SESSION_ID
        }
        
        response = requests.post(
            f"{BASE_URL}/chatbot/chat/",
            json=data,
            headers=get_headers()
        )
        print_response("Third Chat Message", response)

def test_extract_task_info():
    print("\n📝 Testing task extraction...")
    
    if not SESSION_ID:
        print("❌ No session ID available")
        return
    
    response = requests.post(
        f"{BASE_URL}/chatbot/sessions/{SESSION_ID}/extract-task/",
        headers=get_headers()
    )
    print_response("Extract Task Info", response)

def test_suggest_category():
    print("\n🏷️ Testing category suggestion...")
    
    data = {
        "description": "I need someone to develop a mobile app using React Native"
    }
    
    response = requests.post(
        f"{BASE_URL}/chatbot/suggest-category/",
        json=data,
        headers=get_headers()
    )
    print_response("Suggest Category", response)

def test_list_sessions():
    print("\n📋 Testing list sessions...")
    
    response = requests.get(
        f"{BASE_URL}/chatbot/sessions/",
        headers=get_headers()
    )
    print_response("List Sessions", response)

def test_session_detail():
    print("\n🔍 Testing session detail...")
    
    if not SESSION_ID:
        print("❌ No session ID available")
        return
    
    response = requests.get(
        f"{BASE_URL}/chatbot/sessions/{SESSION_ID}/",
        headers=get_headers()
    )
    print_response("Session Detail", response)

def test_chatbot_statistics():
    print("\n📊 Testing chatbot statistics...")
    
    response = requests.get(
        f"{BASE_URL}/chatbot/statistics/",
        headers=get_headers()
    )
    print_response("Chatbot Statistics", response)

def main():
    print("\n" + "🤖"*30)
    print("  CHATBOT API TESTS")
    print("🤖"*30)
    
    try:
        login()
        test_chat()
        test_extract_task_info()
        test_suggest_category()
        test_list_sessions()
        test_session_detail()
        test_chatbot_statistics()
        
        print("\n" + "✅"*30)
        print("  ALL TESTS COMPLETED!")
        print("✅"*30 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()