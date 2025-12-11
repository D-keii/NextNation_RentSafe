import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def run_test():
    print("🤖 STARTING BACKEND TEST...")
    
    # -----------------------------------------------
    # TEST 1: Check current status of Application #1
    # -----------------------------------------------
    print("\n[1] Checking Application #1...")
    try:
        response = requests.get(f"{BASE_URL}/applications/1")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Found Application: {data['tenantName']}")
            print(f"   ℹ️  Current Status: {data['status']}")
            
            if data['status'] == 'approved':
                print("   ⚠️  It is already approved! (Did you run this twice?)")
        else:
            print("   ❌ Error: Could not find application 1")
            return
    except:
        print("   ❌ Error: Is your server running?")
        return

    # -----------------------------------------------
    # TEST 2: Approve the Tenant (POST)
    # -----------------------------------------------
    print("\n[2] Attempting to APPROVE Application #1...")
    response = requests.post(f"{BASE_URL}/applications/1/approve")
    
    if response.status_code == 200:
        print("   ✅ Server replied: Success!")
    else:
        print(f"   ❌ Failed: {response.text}")
        return

    # -----------------------------------------------
    # TEST 3: Verify the change happened
    # -----------------------------------------------
    print("\n[3] Verifying the change in Database...")
    response = requests.get(f"{BASE_URL}/applications/1")
    new_status = response.json()['status']
    
    if new_status == 'approved':
        print(f"   🎉 SUCCESS! Status is now: '{new_status}'")
        print("   🚀 Your Backend is working perfectly.")
    else:
        print(f"   ❌ FAIL. Status is still: '{new_status}'")

import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000"

def run_test():
    print("🤖 STARTING TEST (No Pip Version)...")

    # 1. VIEW Applications
    url = f"{BASE_URL}/properties/1/applications"
    print(f"\n[1] Visiting: {url}")
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   ✅ Success! Found {len(data)} application(s).")
            if len(data) > 0:
                print(f"   First Applicant: {data[0].get('tenantName', 'Unknown')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return

    # 2. APPROVE Application #1
    # Note: We need to use 'POST' method
    approve_url = f"{BASE_URL}/applications/1/approve"
    print(f"\n[2] Clicking Approve: {approve_url}")
    try:
        req = urllib.request.Request(approve_url, method='POST')
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print("   ✅ Server replied:", data['message'])
    except Exception as e:
        print(f"   ❌ Error approving: {e}")

\
if __name__ == "__main__":
    run_test()