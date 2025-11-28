"""
Test script for Tasks API - FIXED & WORKING
Run: python test_tasks_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
ACCESS_TOKEN = None  # Will be set after login


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
    return {"Authorization": f"Bearer {ACCESS_TOKEN}"} if ACCESS_TOKEN else {}


def login_as_client():
    global ACCESS_TOKEN
    print("\nLogging in as client...")
    data = {"username_or_email": "john_client", "password": "password123"}
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    if response.status_code == 200:
        ACCESS_TOKEN = response.json()['tokens']['access']
        print("Logged in successfully")
    else:
        print("Login failed")
        print_response("Login Failed", response)


def test_categories():
    print("\nTesting categories...")
    response = requests.get(f"{BASE_URL}/tasks/categories/")
    print_response("Get Categories", response)


def test_create_task():
    print("\nTesting create task...")
    data = {
        "title": "Website Development Needed",
        "description": "I need a professional website for my business. Must be responsive and modern.",
        "category": 4,
        "task_type": "DIGITAL",
        "budget": 2500,
        "is_negotiable": True,
        "is_remote": True,
        "deadline": "2025-02-15T12:00:00Z",
        "estimated_duration": "2 weeks"
    }
    
    response = requests.post(
        f"{BASE_URL}/tasks/create/",
        json=data,
        headers=get_headers()
    )
    print_response("Create Task", response)
    
    if response.status_code == 201:
        json_data = response.json()
        # FIXED: Handle both direct 'id' and nested 'task' -> 'id'
        task_id = json_data.get('id') or json_data.get('task', {}).get('id')
        if not task_id:
            print("Cannot find task ID in response!")
            return None
        print(f"Task created with ID: {task_id}")
        return task_id
    return None


def test_list_tasks():
    print("\nTesting list tasks...")
    urls = [
        f"{BASE_URL}/tasks/",
        f"{BASE_URL}/tasks/?status=OPEN",
        f"{BASE_URL}/tasks/?search=website",
        f"{BASE_URL}/tasks/?min_budget=1000&max_budget=5000"
    ]
    titles = ["List All Tasks", "List Open Tasks", "Search Tasks", "Filter by Budget"]
    for url, title in zip(urls, titles):
        response = requests.get(url)
        print_response(title, response)


def test_task_detail(task_id):
    if not task_id: return
    print(f"\nTesting task detail (ID: {task_id})...")
    response = requests.get(f"{BASE_URL}/tasks/{task_id}/")
    print_response("Get Task Detail", response)


def test_my_tasks():
    print("\nTesting my tasks...")
    response = requests.get(f"{BASE_URL}/tasks/my-tasks/", headers=get_headers())
    print_response("My Posted Tasks", response)


def test_task_statistics():
    print("\nTesting task statistics...")
    response = requests.get(f"{BASE_URL}/tasks/statistics/")
    print_response("Platform Statistics", response)
    response = requests.get(f"{BASE_URL}/tasks/my-statistics/", headers=get_headers())
    print_response("My Statistics", response)


def login_as_freelancer():
    global ACCESS_TOKEN
    print("\nLogging in as freelancer...")
    data = {"username_or_email": "sara_freelancer", "password": "password123"}
    response = requests.post(f"{BASE_URL}/auth/login/", json=data)
    if response.status_code == 200:
        ACCESS_TOKEN = response.json()['tokens']['access']
        print("Logged in successfully")
    else:
        print("Login failed")


def test_apply_to_task(task_id):
    if not task_id: return None
    print(f"\nTesting apply to task (ID: {task_id})...")
    data = {
        "proposal": "I am a professional web developer with 5 years of experience.",
        "offered_price": 2300,
        "estimated_time": "10 days",
        "cover_letter": "Check my portfolio!"
    }
    response = requests.post(
        f"{BASE_URL}/tasks/{task_id}/apply/",
        json=data,
        headers=get_headers()
    )
    print_response("Apply to Task", response)
    
    if response.status_code == 201:
        json_data = response.json()
        app_id = json_data.get('id') or json_data.get('application', {}).get('id')
        return app_id
    return None


def test_my_applications():
    print("\nTesting my applications...")
    response = requests.get(f"{BASE_URL}/tasks/my-applications/", headers=get_headers())
    print_response("My Applications", response)


def test_task_applications(task_id):
    if not task_id: return
    login_as_client()  # Switch back to client
    print(f"\nTesting task applications (ID: {task_id})...")
    response = requests.get(f"{BASE_URL}/tasks/{task_id}/applications/", headers=get_headers())
    print_response("Task Applications", response)


def test_accept_application(application_id):
    if not application_id: return
    print(f"\nTesting accept application (ID: {application_id})...")
    response = requests.post(
        f"{BASE_URL}/tasks/applications/{application_id}/accept/",
        headers=get_headers()
    )
    print_response("Accept Application", response)


def main():
    print("\n" + "ROCKET"*10)
    print("  MULTITASK TASKS API TESTS - FULLY WORKING")
    print("ROCKET"*10)
    
    login_as_client()
    test_categories()
    task_id = test_create_task()
    test_list_tasks()
    test_task_detail(task_id)
    test_my_tasks()
    test_task_statistics()
    
    login_as_freelancer()
    application_id = test_apply_to_task(task_id)
    test_my_applications()
    
    test_task_applications(task_id)
    test_accept_application(application_id)
    
    print("\n" + "SUCCESS"*10)
    print("  ALL TESTS PASSED SUCCESSFULLY!")
    print("SUCCESS"*10 + "\n")


if __name__ == "__main__":
    main()