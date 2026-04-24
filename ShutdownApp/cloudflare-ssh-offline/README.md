# Cloudflare SSH Tunnel Offline Fallback

This folder contains a specialized Worker script for your **NCL Team SSH tunnel**. It uses a "Terminal/Hacker" aesthetic to match the vibe of an SSH service.

## Setup Instructions

1. Go to **Workers & Pages** > **Create application** > **Create Worker**.
2. Name it `ssh-offline-handler`.
3. Click **Deploy** and then **Edit Code**.
4. Replace the code with the script below:

```javascript
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);

    if (response.status === 530 || response.status === 502 || response.status === 504) {
      return new Response(SSH_OFFLINE_HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
        status: 200
      });
    }

    return response;
  }
};

const SSH_OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSH Node Offline | NCL Team</title>
    <style>
        body { background: #0a0a0a; color: #00ff41; font-family: 'Courier New', Courier, monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
        .container { width: 90%; max-width: 700px; padding: 2rem; border: 1px solid #00ff41; background: rgba(0, 255, 65, 0.05); box-shadow: 0 0 20px rgba(0, 255, 65, 0.2); position: relative; }
        .header { border-bottom: 1px solid #00ff41; padding-bottom: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; }
        .glitch { animation: glitch 1s linear infinite; }
        @keyframes glitch { 2%, 64% { transform: translate(2px,0) skew(0deg); } 4%, 60% { transform: translate(-2px,0) skew(0deg); } 62% { transform: translate(0,0) skew(5deg); } }
        .status { color: #ff3e3e; font-weight: bold; text-transform: uppercase; }
        .terminal-text { line-height: 1.5; margin-bottom: 1rem; }
        .cursor { display: inline-block; width: 10px; height: 1.2rem; background: #00ff41; animation: blink 1s infinite; vertical-align: middle; }
        @keyframes blink { 50% { opacity: 0; } }
        .scanline { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0, 255, 65, 0.1); animation: scan 4s linear infinite; }
        @keyframes scan { from { top: 0; } to { top: 100%; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="scanline"></div>
        <div class="header">
            <span>[ SYSTEM STATUS: SSH_GATEWAY ]</span>
            <span class="status">OFFLINE</span>
        </div>
        <div class="terminal-text">
            > INITIALIZING CONNECTION...<br>
            > ERROR: CONNECTION_REFUSED<br>
            > TRACE: REMOTE_HOST_DOWN<br>
            > WARNING: SECURE TUNNEL DISCONNECTED<br><br>
            The SSH Node for the NCL Team is currently unavailable. This occurs when the host machine is offline or the Cloudflare Tunnel has been suspended.<br><br>
            Please contact the Lead Admin to restore access.<br><br>
            <span class="glitch">AWAITING_REBOOT</span><span class="cursor"></span>
        </div>
    </div>
</body>
</html>
`;
```

## 2. Configure the Route
1. In Cloudflare, go to **Workers Routes** > **Add route**.
2. **Route:** `ssh.yourdomain.com/*` (Your actual SSH subdomain).
3. **Worker:** `ssh-offline-handler`.
4. Click **Save**.
