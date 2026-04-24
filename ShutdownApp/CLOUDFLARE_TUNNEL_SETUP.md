# Cloudflare Tunnel Setup Guide - JARVIS System Control

This guide walks you through setting up a secure Cloudflare Tunnel with Zero Trust authentication for your JARVIS server.

## Prerequisites

- ✓ Cloudflare account (free tier works)
- ✓ A domain registered on Cloudflare (or add an existing domain to Cloudflare DNS)
- ✓ JARVIS server running on port 1234
- ✓ Administrator access to your computer

## Step 1: Install Cloudflare Tunnel

### Download and Install

1. Download Cloudflare Tunnel (cloudflared) from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
2. Choose the Windows installer (.msi) for your architecture (x86-64)
3. Run the installer and follow the prompts
4. Verify installation by opening Command Prompt and running:
   ```bash
   cloudflared --version
   ```

### Alternative: Install via Chocolatey (if you have it)

```powershell
choco install cloudflare-warp
```

## Step 2: Authenticate with Cloudflare

1. Open Command Prompt or PowerShell
2. Run:
   ```bash
   cloudflared login
   ```
3. A browser window will open asking you to log in to Cloudflare
4. Select the domain you want to use for your JARVIS server
5. A certificate file will be downloaded to `%USERPROFILE%\.cloudflared\cert.pem`

## Step 3: Create a Configuration File

Create a file named `config.yml` in the Cloudflare Tunnel config directory:

**Location:** `%USERPROFILE%\.cloudflared\config.yml`

**Content:**

```yaml
# Cloudflare Tunnel Configuration
# Replace 'yourdomain.com' with your actual domain

tunnel: jarvis-system-control
credentials-file: %USERPROFILE%\.cloudflared\<tunnel-id>.json

ingress:
  # JARVIS server
  - hostname: jarvis.yourdomain.com
    service: http://localhost:1234

  # Catch-all rule
  - service: http_status:404
```

**Important:** Replace `yourdomain.com` with your actual domain!

## Step 4: Create the Tunnel

1. Open Command Prompt or PowerShell
2. Run:
   ```bash
   cloudflared tunnel create jarvis-system-control
   ```
3. This creates a tunnel with a UUID. Save this UUID—you'll need it later.
4. A credentials file will be created automatically.

## Step 5: Set Up DNS Records in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Select your domain
3. Go to **DNS > Records**
4. Click "Create record"
5. Create a CNAME record:
   - **Type:** CNAME
   - **Name:** `jarvis` (or your preferred subdomain)
   - **Target:** `<tunnel-id>.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud)
   - Click Save

**Example:**
```
Name: jarvis
Type: CNAME
Content: 12345678-1234-1234-1234-123456789abc.cfargotunnel.com
```

## Step 6: Route Traffic Through Tunnel in Cloudflare Dashboard

1. In the Cloudflare Dashboard, go to **Zero Trust > Networks > Tunnels**
2. Find "jarvis-system-control" tunnel
3. Click on it to configure routing
4. Under "Public Hostname" section:
   - Click "Add public hostname"
   - Domain: `jarvis.yourdomain.com`
   - Type: HTTP
   - URL: `localhost:1234`
   - Click Save

## Step 7: Set Up Zero Trust Authentication

### Create an Access Policy

1. Go to **Zero Trust > Access > Applications**
2. Click "Add an application"
3. Choose "Self-hosted"
4. Configure:
   - **Application name:** JARVIS System Control
   - **Session duration:** 24 hours
   - **Application URL:** `https://jarvis.yourdomain.com`
5. Click Next

### Add Authentication (Login Method)

1. Select authentication method:
   - **One-time PIN:** Simple OTP via email (recommended)
   - **GitHub, Google, Microsoft:** SSO via your account
   - **Email domain:** Only allow specific email domain (e.g., @company.com)
2. Click Next

### Set Access Policies

1. Create a policy:
   - **Name:** Everyone
   - **Action:** Allow
   - **Identity providers:** Select your authentication method
2. Click Save

## Step 8: Start the Tunnel

Create a batch file to start the tunnel:

**File:** `%USERPROFILE%\.cloudflared\start-tunnel.bat`

```batch
@echo off
REM Cloudflare Tunnel Startup
cloudflared tunnel run jarvis-system-control
pause
```

Or run directly:
```bash
cloudflared tunnel run jarvis-system-control
```

## Step 9: Run at Windows Startup (Optional)

### Option A: Task Scheduler

1. Press `Win + R`, type `taskschd.msc`
2. Create New Task:
   - **Name:** Cloudflare Tunnel
   - **Trigger:** At Startup
   - **Action:** Start a program: `cloudflared.exe`
   - **Arguments:** `tunnel run jarvis-system-control`
   - **Run with highest privileges:** ✓
3. Click OK

### Option B: Windows Service (Advanced)

```powershell
# Run as Administrator
cloudflared service install --logfile %USERPROFILE%\.cloudflared\tunnel.log
cloudflared service start
```

## Step 10: Verify Setup

### Test Tunnel Connection

1. Open Command Prompt and run:
   ```bash
   cloudflared tunnel status jarvis-system-control
   ```

2. Open your browser and visit:
   ```
   https://jarvis.yourdomain.com
   ```

3. You should be prompted to authenticate with your chosen method
4. After authentication, you'll see the JARVIS dashboard

### Test JARVIS Endpoints

```bash
# Get available commands
curl -X GET "https://jarvis.yourdomain.com/api/commands" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check server status
curl -X GET "https://jarvis.yourdomain.com/api/status"

# Execute a command (e.g., get status)
curl -X POST "https://jarvis.yourdomain.com/api/command/status" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Troubleshooting

### Tunnel Not Connecting

```bash
# Check tunnel status
cloudflared tunnel status jarvis-system-control

# View logs
cloudflared tunnel logs jarvis-system-control

# Restart tunnel
cloudflared tunnel run jarvis-system-control --loglevel debug
```

### DNS Not Resolving

- Verify CNAME record is created in Cloudflare DNS
- Wait 5-10 minutes for DNS propagation
- Check in Cloudflare Dashboard > DNS > Records

### Can't Access After Authentication

- Verify Access Policy is set correctly
- Check that your authentication method is enabled
- Clear browser cookies and try again

### Port 1234 Already in Use

- Change port in `ShutdownApp/src/index.ts`
- Rebuild: `npm run build`
- Update tunnel config to new port
- Restart JARVIS server

## Security Best Practices

✓ **Use Zero Trust Authentication:** Always require login via Cloudflare  
✓ **Enable 2FA:** Set up two-factor authentication on your Cloudflare account  
✓ **Use Strong Email:** Protect the email used for One-Time PIN  
✓ **Monitor Access:** Regularly check Cloudflare Zero Trust logs  
✓ **Keep Software Updated:** Update cloudflared and Node.js regularly  
✓ **Restrict Commands:** Consider adding role-based access in future versions

## API Endpoint Reference

Once authenticated through the Cloudflare tunnel, use these endpoints:

```bash
# Get list of available commands
GET /api/commands

# Get system status
GET /api/status

# Execute a command
POST /api/command/:name
Body: { "delay": 60 }  # Optional delay in seconds

# Health check
GET /health

# Web dashboard
GET /
```

### Command Examples

#### Shutdown with delay (60 seconds)
```bash
curl -X POST "https://jarvis.yourdomain.com/api/command/shutdown" \
  -H "Content-Type: application/json" \
  -d '{"delay": 60}'
```

#### Restart immediately
```bash
curl -X POST "https://jarvis.yourdomain.com/api/command/restart" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Get system status
```bash
curl -X GET "https://jarvis.yourdomain.com/api/status"
```

## Advanced Configuration

### Custom Domain

Edit `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: jarvis-system-control
credentials-file: %USERPROFILE%\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: my-custom-subdomain.example.com
    service: http://localhost:1234
  - service: http_status:404
```

### Multiple Subdomains (Advanced)

```yaml
tunnel: jarvis-system-control
credentials-file: %USERPROFILE%\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: jarvis.yourdomain.com
    service: http://localhost:1234
  - hostname: backup.yourdomain.com
    service: http://localhost:1234
  - service: http_status:404
```

### Environment Variables

```bash
# Set credential file location
set CLOUDFLARED_CRED_FILE=%USERPROFILE%\.cloudflared\tunnel-credentials.json

# Set config file location
set CLOUDFLARED_CONFIG=%USERPROFILE%\.cloudflared\config.yml

# Enable debug logging
set CLOUDFLARED_LOG_LEVEL=debug
```

## Support & Resources

- **Cloudflare Documentation:** https://developers.cloudflare.com/cloudflare-one/
- **Tunnel Setup Guide:** https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- **Zero Trust Security:** https://developers.cloudflare.com/cloudflare-one/policies/

## Summary

You now have:

✓ JARVIS server running on port 1234  
✓ Cloudflare Tunnel securely exposing your server  
✓ Zero Trust authentication protecting access  
✓ Custom domain (jarvis.yourdomain.com)  
✓ Automatic startup via Task Scheduler  

Your JARVIS system is now accessible from anywhere through a secure, authenticated Cloudflare tunnel!
