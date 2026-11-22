"""Double-click launcher for the built KOLX website."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import urllib.request
import os
import webbrowser

PORT = int(os.environ.get('KOLX_PORT', '3000'))
URL = f'http://127.0.0.1:{PORT}/?v=blue'
ROOT = Path(__file__).resolve().parent / 'out'

def main():
    try:
        with urllib.request.urlopen(URL, timeout=2) as response:
            html = response.read().decode('utf-8')
        if 'KOLX' in html and 'X-Coin' in html:
            print('KOLX is already running: ' + URL)
            if '--check' not in sys.argv:
                webbrowser.open(URL)
            return 0
    except Exception:
        pass
    if '--check' in sys.argv:
        print('KOLX is not currently running.')
        return 1
    if not (ROOT / 'index.html').exists():
        print('Built website missing. Run npm run build first.')
        return 1
    try:
        server = ThreadingHTTPServer(('127.0.0.1', PORT), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
    except OSError as exc:
        print('Cannot open port 3000. Another application may be using it. ' + str(exc))
        return 1
    print('KOLX is running: ' + URL)
    print('Keep this window open. Press Ctrl+C to stop.')
    if '--no-browser' not in sys.argv:
        webbrowser.open(URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nKOLX stopped.')
    finally:
        server.server_close()
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
