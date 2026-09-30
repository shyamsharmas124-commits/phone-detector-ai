import time
import requests
import argparse
import sys
from datetime import datetime

def keep_alive(url, interval):
    """
    Pings the specified URL every `interval` seconds to keep the backend alive.
    """
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting keep-alive bot...")
    print(f"Target URL: {url}")
    print(f"Ping interval: {interval} seconds")
    print("Press Ctrl+C to stop.\n")

    while True:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Ping successful: {response.status_code} OK")
            else:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Ping failed with status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error pinging backend: {e}")
        
        try:
            time.sleep(interval)
        except KeyboardInterrupt:
            print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Keep-alive bot stopped.")
            sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Keep-alive bot for the backend.")
    parser.add_argument(
        "--url", 
        type=str, 
        required=True, 
        help="The URL of the /health endpoint (e.g., https://your-backend.onrender.com/health)"
    )
    parser.add_argument(
        "--interval", 
        type=int, 
        default=300, 
        help="Interval between pings in seconds (default: 300 seconds / 5 minutes)"
    )
    
    args = parser.parse_args()
    keep_alive(args.url, args.interval)
