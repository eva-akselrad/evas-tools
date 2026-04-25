# Investigation Guide: Q4, Q5 & Q6 - Sanitization

## Q4: What npm package is used to sanitize note content?

To find the package name:
1.  **Inspect Source Code:** Look at the JavaScript files loaded by the browser (Sources tab in DevTools). Search for keywords like `sanitize`, `filter`, or `purify`.
2.  **Check `package.json`:** If the source code is available (common in CTFs), check the dependencies.
3.  **Look for Library Signatures:** Many libraries leave traces in the DOM or have specific function names (e.g., `DOMPurify.sanitize`).

## Q5: Is the sanitization library running on the client side or server side?

1.  **Monitor Network Traffic:** If you submit a note with `<script>alert(1)</script>` and the request sent to the server already has the tags removed, it's **Client-side**.
2.  **Observe Server Response:** If the request contains the tags but the response when viewing the note has them removed, it's **Server-side**.

## Q6: What special character enables breaking out of HTML context after sanitization?

This usually refers to a "bypass" character.
1.  **Research the Library:** Once you identify the library from Q4, search for " [Library Name] bypass" or "[Library Name] CVE".
2.  **Common Culprits:**
    *   **Null Byte (`\0` or `%00`):** Sometimes used to terminate strings early in backend parsers.
    *   **Unicode variants:** Characters that look like `<` or `>` but are different code points.
    *   **Incomplete tags:** `<img src=x onerror=...` (missing closing bracket).
    *   **Nested tags:** Logic that only sanitizes one level.
