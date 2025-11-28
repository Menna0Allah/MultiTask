"""
Test script for Messaging API
Run: python test_messaging_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
ACCESS_TOKEN = None
CONVERSATION_ID = None

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

def test_create_conversation():
    global CONVERSATION_ID
    print("\n💬 Testing create conversation...")
    
    # Get freelancer ID first
    response = requests.get(f"{BASE_URL}/auth/users/?user_type=FREELANCER")
    if response.status_code == 200 and response.json()['results']:
        freelancer_id = response.json()['results'][0]['id']
        
        data = {
            "participant_id": freelancer_id,
            "initial_message": "Hi! I saw your profile and I'm interested in discussing a task."
        }
        
        response = requests.post(
            f"{BASE_URL}/messaging/conversations/create/",
            json=data,
            headers=get_headers()
        )
        print_response("Create Conversation", response)
        
        if response.status_code in [200, 201]:
            CONVERSATION_ID = response.json()['id']

def test_list_conversations():
    print("\n📋 Testing list conversations...")
    
    response = requests.get(
        f"{BASE_URL}/messaging/conversations/",
        headers=get_headers()
    )
    print_response("List Conversations", response)

def test_conversation_detail():
    print("\n🔍 Testing conversation detail...")
    
    if not CONVERSATION_ID:
        print("❌ No conversation ID available")
        return
    
    response = requests.get(
        f"{BASE_URL}/messaging/conversations/{CONVERSATION_ID}/",
        headers=get_headers()
    )
    print_response("Conversation Detail", response)

def test_send_message():
    print("\n📤 Testing send message...")
    
    if not CONVERSATION_ID:
        print("❌ No conversation ID available")
        return
    
    data = {
        "content": "I need help with a house cleaning task. Are you available this weekend?",
        "message_type": "TEXT"
    }
    
    response = requests.post(
        f"{BASE_URL}/messaging/conversations/{CONVERSATION_ID}/messages/send/",
        json=data,
        headers=get_headers()
    )
    print_response("Send Message", response)

def test_list_messages():
    print("\n📨 Testing list messages...")
    
    if not CONVERSATION_ID:
        print("❌ No conversation ID available")
        return
    
    response = requests.get(
        f"{BASE_URL}/messaging/conversations/{CONVERSATION_ID}/messages/",
        headers=get_headers()
    )
    print_response("List Messages", response)

def test_mark_as_read():
    print("\n✅ Testing mark as read...")
    
    if not CONVERSATION_ID:
        print("❌ No conversation ID available")
        return
    
    response = requests.post(
        f"{BASE_URL}/messaging/conversations/{CONVERSATION_ID}/mark-read/",
        headers=get_headers()
    )
    print_response("Mark as Read", response)

def test_messaging_statistics():
    print("\n📊 Testing messaging statistics...")
    
    response = requests.get(
        f"{BASE_URL}/messaging/statistics/",
        headers=get_headers()
    )
    print_response("Messaging Statistics", response)

def main():
    print("\n" + "💬"*30)
    print("  MESSAGING API TESTS")
    print("💬"*30)
    
    try:
        login_as_client()
        test_create_conversation()
        test_list_conversations()
        test_conversation_detail()
        test_send_message()
        test_list_messages()
        test_mark_as_read()
        test_messaging_statistics()
        
        print("\n" + "✅"*30)
        print("  ALL TESTS COMPLETED!")
        print("✅"*30 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()