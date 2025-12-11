import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def run_test():
    print("🚀 STARTING FINAL BACKEND TEST...")
    
    # --- PRE-REQUISITE: WE NEED DATA ---
    # We assume you have run 'python seed_data.py' or have data in DB.
    # If not, let's just try to hit the endpoints assuming ID=1 exists.
    
    # 1. APPROVE APPLICATION (Triggers Contract Generation)
    print("\n[1] Approving Application #1...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/applications/1/approve", method='POST')
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"   ✅ Success: {data['message']}")
    except Exception as e:
        print(f"   ⚠️  Note: {e} (Maybe it was already approved? Continuing...)")

    # 2. CHECK IF CONTRACT WAS CREATED
    # We guess the Contract ID is 1 (since it's the first one)
    print("\n[2] Checking if Contract #1 exists...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/contracts/1") as response:
            contract = json.loads(response.read().decode())
            print(f"   ✅ Contract Found! Status: '{contract['status']}'")
            print(f"   💰 Rent: RM {contract['monthlyRent']}")
    except Exception as e:
        print(f"   ❌ Error: Contract not found. Did step 1 work? {e}")
        return

    # 3. UPLOAD PHOTOS
    print("\n[3] Uploading Photos...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/contracts/1/upload-photos", method='POST')
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"   ✅ Success: {data['message']}")
            print(f"   📊 New Status: {data['contract']['status']}")
    except Exception as e:
        print(f"   ❌ Upload Failed: {e}")

    # 4. LANDLORD SIGN
    print("\n[4] Landlord Signing Contract...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/contracts/1/landlord/sign", method='POST')
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"   ✅ Success: {data['message']}")
            print(f"   ✍️  Landlord Signed: {data['contract']['landlordSigned']}")
    except Exception as e:
        print(f"   ❌ Signing Failed: {e}")

    print("\n🎉 TEST COMPLETE! If you see green checks, your backend is finished.")

if __name__ == "__main__":
    run_test()