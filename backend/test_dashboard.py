import urllib.request
import json

BASE_URL = "http://127.0.0.1:5000"
LANDLORD_IC = "800515-01-5678"  # The ID used in your frontend

def test_dashboard():
    print(f"📊 TESTING DASHBOARD FOR LANDLORD: {LANDLORD_IC}...\n")
    
    url = f"{BASE_URL}/users/{LANDLORD_IC}/landlord-dashboard"
    
    try:
        with urllib.request.urlopen(url) as response:
            if response.status != 200:
                print(f"❌ Error: Server returned status {response.status}")
                return

            data = json.loads(response.read().decode())
            
            # --- VERIFY THE 5 DATA LISTS ---
            
            # 1. My Properties
            props = data.get('myProperties', [])
            print(f"🏠 My Properties:      {len(props)} found")
            if props: print(f"   - Example: {props[0]['title']}")

            # 2. Pending Applications
            apps = data.get('pendingApplications', [])
            print(f"📄 Pending Apps:       {len(apps)} found")
            
            # 3. Active Contracts
            active = data.get('activeContracts', [])
            print(f"✅ Active Contracts:   {len(active)} found")
            
            # 4. Pending Contracts
            pending_c = data.get('pendingContracts', [])
            print(f"⏳ Pending Contracts:  {len(pending_c)} found")
            
            # 5. Secured Escrow
            escrow = data.get('securedEscrows', [])
            print(f"💰 Secured Escrows:    {len(escrow)} found")
            
            print("\n🎉 DASHBOARD ENDPOINT IS WORKING!")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        print("   (Make sure 'python app.py' is running!)")

if __name__ == "__main__":
    test_dashboard()