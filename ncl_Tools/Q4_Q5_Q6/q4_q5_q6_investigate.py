import requests
import re

def solve_q4_q5_q6():
    url = "https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud/static/main.js"
    print(f"[*] Fetching {url} for analysis...")
    
    try:
        response = requests.get(url)
        content = response.text

        # Q4: Look for package names or unique function names
        # Common ones: dompurify, sanitize-html, js-xss
        packages = re.findall(r'from\s+[\'"]([@\w\-/]+)[\'"]', content)
        print(f"[+] Found imports: {packages}")
        
        # Check for DOMPurify specifically
        if "dompurify" in content.lower() or "DOMPurify" in content:
            print("[!] Q4 Answer: dompurify")
            
        # Q5: Where is it running?
        if "sanitize(" in content or "DOMPurify.sanitize" in content:
            print("[!] Q5 Answer: client side (code found in main.js)")
        else:
            print("[!] Q5 Answer: server side (if main.js only sends raw input)")

        # Q6: Breakout character
        # If it's DOMPurify, common breakout involve: \0, <math>, or nested tags
        print("[*] Q6 Hint: If dompurify < 2.0.17, look for 'Mutation XSS'.")
        print("[*] Try searching the JS for a specific character used in a regex or split() call.")

    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    solve_q4_q5_q6()
