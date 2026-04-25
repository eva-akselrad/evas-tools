# Investigation Guide: Q1 & Q2

## Q1: What JavaScript web framework powers the backend API?

To identify the backend framework, follow these steps:

1.  **Analyze the 404 JSON Response Body:**
    Since the headers show `Server: nginx`, the backend is hidden. Run this:
    ```bash
    curl https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud/notreal
    ```
    Compare the output to these common framework defaults:
    *   **Fastify:** `{"message":"Route GET:/notreal not found","error":"Not Found","statusCode":404}`
    *   **NestJS:** `{"message":"Cannot GET /notreal","error":"Not Found","statusCode":404}`
    *   **Hapi:** `{"statusCode":404,"error":"Not Found","message":"Not Found"}`
    *   **Express:** Often returns HTML `Cannot GET /notreal` unless configured otherwise.

2.  **Check for Framework-Specific Cookies:**
    Run:
    ```bash
    curl -i https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud/
    ```
    Look for the `Set-Cookie` header:
    *   `connect.sid` -> **Express**
    *   `fastify-session` -> **Fastify**

3.  **Inspect Client-Side JS:**
    Open the site in a browser, press F12, and go to the **Sources** tab. Look for filenames like `main.js` or `vendor.js`. Sometimes the code mentions the framework or uses specific routing patterns.

## Q2: Which type in JavaScript implements the trim() method?

This is a fundamental JavaScript question.
*   You can verify this in your browser's console (F12 -> **Console**):
    ```javascript
    typeof "  hello  ".trim() // returns "string"
    String.prototype.hasOwnProperty('trim') // returns true
    ```
