import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:5000"

# IMPORTANT: Replace this with an IC that actually exists in your 'contracts' table
# If you used the previous test script, check what landlord_ic was assigned to Property #1.
TEST_LANDLORD_IC = "800515-01-5678" 

def run_history_test():
    print(f"🚀 STARTING TENANT HISTORY TEST for Landlord: {TEST_LANDLORD_IC}...")

    # --- TEST: GET TENANT HISTORY ---
    url = f"{BASE_URL}/landlord/{TEST_LANDLORD_IC}/tenant-history"
    print(f"\n[1] Fetching history from: {url}")

    try:
        # By default, urlopen uses GET if no data is passed
        with urllib.request.urlopen(url) as response:
            status_code = response.getcode()
            raw_data = response.read().decode()
            
            # Parse JSON
            history_list = json.loads(raw_data)

            if status_code == 200:
                print(f"   ✅ Connection Success! (Status: 200)")
                
                # Check if we got a list
                if isinstance(history_list, list):
                    count = len(history_list)
                    print(f"   📂 Found {count} records for this landlord.")
                    
                    if count == 0:
                        print("      ⚠️  List is empty. (Does this landlord have signed contracts in the DB?)")
                    else:
                        # Loop through and print details to prove it works
                        for idx, record in enumerate(history_list):
                            print(f"\n      --- Record #{idx + 1} ---")
                            print(f"      🏠 Property: {record['property']['title']}")
                            print(f"      👤 Tenant:   {record['tenant']['name']} (IC: {record['tenant']['ic']})")
                            print(f"      📜 Status:   {record['contractDetails']['status']}")
                            print(f"      💰 Escrow:   {record['escrow']['status']} (RM {record['escrow']['amount']})")
                else:
                    print("   ❌ Error: Expected a list but got something else.")
                    print(f"   Raw Response: {raw_data}")

            else:
                print(f"   ❌ Server returned error code: {status_code}")

    except urllib.error.HTTPError as e:
        print(f"   ❌ HTTP Error: {e.code} - {e.reason}")
        print(f"      (Did you use the correct Landlord IC?)")
    except urllib.error.URLError as e:
        print(f"   ❌ Connection Error: {e.reason}")
        print("      (Is your Flask server running?)")
    except Exception as e:
        print(f"   ❌ Unexpected Error: {e}")

    print("\n🎉 HISTORY TEST COMPLETE!")

if __name__ == "__main__":
    run_history_test()