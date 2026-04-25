# Investigation Guide: Q8 & Q9 (Flag 3) - Legacy API & CORS

## Q8: What browser security mechanism prevents you from using fetch...

This refers to **CORS (Cross-Origin Resource Sharing)**.
*   If the "Modern API" and "Legacy API" are on different origins (different ports or subdomains), the browser blocks one from reading the other unless specific headers are present.

## Q9: What is the value of the X-Flag response header returned by the legacy backend?

This usually requires finding a way to make the *server* talk to the legacy API, bypassing the browser's CORS restrictions.

### Steps to Investigate:

1.  **Identify the Legacy API Path:**
    *   Look for endpoints like `/api/legacy`, `/proxy`, or hints in the JS code about a different port/service.

2.  **Look for SSRF or Request Smuggling:**
    *   **SSRF (Server-Side Request Forgery):** If there is a feature that "fetches" a URL for you, try pointing it to `http://localhost:[legacy_port]/flag`.
    *   **Request Smuggling:** If the modern API acts as a proxy to the legacy API, you might be able to "smuggle" a second request in the body of the first one.

3.  **Inspect Headers:**
    *   The question specifically asks for a **Response Header** (`X-Flag`).
    *   Once you successfully trigger a request to the legacy `/flag` route via the server, you need to find a way to see the headers of that response.
    *   Check if the proxy/SSRF endpoint returns the full response (including headers) or if you can leak it via another vulnerability.
