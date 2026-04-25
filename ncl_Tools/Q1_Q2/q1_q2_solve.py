import requests

def solve_q1():
    url = "https://69eba7f3f6ade36f2f97629b-8000.gateway.cityinthe.cloud/notreal"
    print(f"[*] Triggering 404 on {url}...")
    response = requests.get(url)
    data = response.json()
    print(f"[+] Response Body: {data}")

    # Logic based on known signatures
    if "Route GET:/notreal not found" in data.get("message", ""):
        print("[!] Q1 Answer: Fastify")
    elif "Cannot GET /notreal" in data.get("message", ""):
        print("[!] Q1 Answer: NestJS")
    elif data.get("error") == "Not Found" and "statusCode" in data:
        print("[!] Q1 Answer: Hapi")
    else:
        print("[?] Could not automatically identify. Check the body manually.")

def solve_q2():
    print("[!] Q2 Answer: String")

if __name__ == "__main__":
    solve_q1()
    solve_q2()
