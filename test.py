import json
from flask import Flask, Response
import datetime

app = Flask(__name__)

# --- Mock Data ---
MOCK_NMAP_DATA = """
[
    {"ip": "192.168.1.1", "ports": [{"port": 22, "state": "open"}, {"port": 80, "state": "filtered"}]},
    {"ip": "10.0.0.5", "ports": [{"port": 23, "state": "open"}, {"port": 443, "state": "closed"}]},
    {"ip": "172.16.0.9", "ports": [{"port": 22, "state": "open"}, {"port": 8080, "state": "open"}]},
    {"ip": "192.168.1.254", "ports": [{"port": 80, "state": "open"}]}
]
"""

def parse_nmap_results(json_data: str) -> list[str]:
    """
    Parses Nmap JSON results and filters for IP addresses that have 
    port 22 (SSH) open.

    Args:
        json_data: A string containing the Nmap JSON output.

    Returns:
        A list of IP addresses that match the criteria.
    """
    try:
        scan_results = json.loads(json_data)
    except json.JSONDecodeError:
        print("Error: Invalid JSON input received.")
        return []

    vulnerable_ips = []
    for entry in scan_results:
        ip = entry.get("ip")
        ports = entry.get("ports", [])
        
        # Check if any port entry has port 22 and state 'open'
        has_port_22_open = any(
            p.get('port') == 22 and p.get('state') == 'open' for p in ports
        )
        
        if ip and has_port_22_open:
            vulnerable_ips.append(ip)
            
    return vulnerable_ips

@app.route('/dashboard')
def dashboard():
    """
    Endpoint that parses Nmap results and returns a fully styled HTML page 
    with a retro CRT aesthetic.
    """
    vulnerable_ips = parse_nmap_results(MOCK_NMAP_DATA)

    # Generate IP list HTML
    ip_list_html = "\n".join([f"  > {ip}" for ip in vulnerable_ips])
    if not vulnerable_ips:
        ip_list_html = "  > [NO OPEN PORTS 22 DETECTED]"

    # Dynamic status line generation
    now = datetime.datetime.now().strftime("%A, %B %d, %Y at %I:%M %p %Z")
    status_line = f"SYSTEM ACTIVE - Richboro, Pennsylvania | Last Update: {now}"

    # --- HTML Template (Self-Contained CSS) ---
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nmap Security Dashboard</title>
    <style>
        /* Global Reset & Base Styles */
        body {{
            background-color: #000000;
            color: #38d393; /* Main Green */
            font-family: 'VT323', 'Courier New', monospace;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }}

        /* CRT Monitor Container Style */
        .crt-monitor {{
            max-width: 800px;
            width: 95%;
            /* Primary Border Glow */
            border: 6px solid #38d393; 
            box-shadow: 0 0 20px rgba(56, 211, 147, 0.8); 
            padding: 25px;
            background-color: #0a0a0a;
            border-radius: 5px;
            /* Scanlines Effect */
            background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 100% 4px;
            /* Subtle Flicker Animation */
            animation: flicker 0.15s infinite alternate;
        }}

        @keyframes flicker {{
            0%, 100% {{ opacity: 1; text-shadow: 0 0 1px #38d393; }}
            5% {{ opacity: 0.98; }}
            10% {{ opacity: 1; }}
            15% {{ opacity: 0.99; }}
            20% {{ opacity: 1; }}
        }}

        /* Status Bar Styling */
        .status-line {{
            color: #ffeb3b; /* Yellow/Amber */
            font-size: 0.9em;
            margin-bottom: 15px;
            text-align: right;
            letter-spacing: 0.5px;
        }}

        /* Header Styling */
        .report-header {{
            border-bottom: 2px solid #2e8b57; /* Deeper Green */
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        .report-header p {{
            text-transform: uppercase;
            font-size: 1.6em;
            letter-spacing: 6px;
            font-weight: bold;
            margin: 0;
        }}

        /* IP List Display */
        .ip-list pre {{
            white-space: pre-wrap;
            font-size: 1.1em;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            color: #d4ffc7; /* Slightly lighter for readability */
        }}

        /* Footer / Footer Message */
        .footer {{
            text-align: right;
            color: #5b9a7b; /* Subtler green */
            font-size: 0.9em;
            margin-top: 25px;
        }}
    </style>
</head>
<body>
    <div class="crt-monitor">
        <div class="status-line">{status_line}</div>
        
        <div class="report-header">
            <p>--- SSH (PORT 22) SCAN REPORT ---</p>
        </div>
        
        <div class="ip-list">
            <pre>
{ip_list_html}
            </pre>
        </div>
        
        <div class="footer">
            [SCAN COMPLETE]
        </div>
    </div>
</body>
</html>
"""
    return Response(html_content, mimetype='text/html')

if __name__ == '__main__':
    # Ensure you run this script using python app.py
    print("===================================================")
    print("           ✅ NMAP Dashboard Initialized           ")
    print("===================================================")
    print("🚀 To run the dashboard: python app.py")
    print("🌐 Access the report at: http://127.0.0.1:5000/dashboard")
    
    # Run the Flask application
    app.run(debug=True)