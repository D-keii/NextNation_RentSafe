import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000"
CONTRACT_ID = 1

def test_upload_flow():
    print("🧪 TESTING UPLOAD FLOW INSIDE VS CODE...")

    # 1. CHECK STATUS BEFORE
    # We look at the contract to make sure it is 'pending_photos'
    url = f"{BASE_URL}/contracts/{CONTRACT_ID}"
    print(f"\n[1] Checking Contract #{CONTRACT_ID} status...")
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   Current Status: '{data['status']}'")
            print(f"   Current Photos: {len(data['propertyPhotos'])}")
    except Exception as e:
        print(f"   ❌ Error connecting to backend: {e}")
        print("   (Make sure you are running 'python app.py' in another terminal!)")
        return

    # 2. UPLOAD PHOTOS (The POST Request)
    # This simulates clicking "Submit Photos" on the frontend
    upload_url = f"{BASE_URL}/contracts/{CONTRACT_ID}/upload-photos"
    print(f"\n[2] Attempting to Upload Photos to: {upload_url}")
    
    try:
        # Create an empty POST request (Backend mock doesn't need actual files yet)
        req = urllib.request.Request(upload_url, method='POST')
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print(f"   ✅ SUCCESS! Server Message: {result['message']}")
    except Exception as e:
        print(f"   ❌ Upload Failed: {e}")
        return

    # 3. VERIFY STATUS AFTER
    # We check if status changed to 'pending_tenant_approval'
    print(f"\n[3] Verifying changes in Database...")
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print(f"   NEW Status:     '{data['status']}'")
            print(f"   Photos Saved:   {len(data['propertyPhotos'])}")
            
            if data['status'] == 'pending_tenant_approval':
                print("\n🎉 TEST PASSED! The backend logic works perfectly.")
            else:
                print("\n⚠️ TEST FAILED. Status did not update.")
    except Exception as e:
        print(f"   ❌ Error verifying: {e}")

if __name__ == "__main__":
    test_upload_flow()
    