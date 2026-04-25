import requests

def solve_q8():
    print("[!] Q8 Answer: CORS (Cross-Origin Resource Sharing)")

def solve_q9():
    # The 'modern' API often acts as a proxy to the 'legacy' API.
    # We need to find the proxy endpoint, e.g., /api/proxy or /api/legacy
    
    base_url = "https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud"
    
    # Common legacy/proxy paths to test
    paths = ["/api/legacy/flag", "/api/proxy/flag", "/api/v1/legacy/flag"]
    
    print("[*] Searching for Legacy API endpoints...")
    for path in paths:
        url = f"{base_url}{path}"
        response = requests.get(url)
        
        print(f"[*] Testing {url} -> Status {response.status_code}")
        
        # Check for X-Flag in response headers
        if "X-Flag" in response.headers:
            print(f"[!] Success! Q9 Answer (X-Flag Header): {response.headers['X-Flag']}")
            return
            
    print("[-] Could not find X-Flag in common paths. Inspect main.js for 'legacy' or 'proxy' keywords.")

if __name__ == "__main__":
    solve_q8()
    solve_q9()
