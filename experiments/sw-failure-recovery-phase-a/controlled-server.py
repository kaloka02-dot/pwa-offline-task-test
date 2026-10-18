from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        if self.path.split('?')[0] == '/sw.js':
            mode=(ROOT/'.sw-mode').read_text().strip() if (ROOT/'.sw-mode').exists() else 'good'
            if mode == 'bad-install':
                body=b"self.addEventListener('install',e=>e.waitUntil(Promise.reject(Error('injected install failure'))));"
            elif mode == 'bad-activate':
                body=b"self.addEventListener('install',e=>e.waitUntil(Promise.resolve()));self.addEventListener('activate',e=>e.waitUntil(Promise.reject(Error('injected activation failure'))));"
            else:
                body=(ROOT/'sw.js').read_bytes()
            self.send_response(200)
            self.send_header('Content-Type','application/javascript')
            self.send_header('Cache-Control','no-store')
            self.send_header('Content-Length',str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

if __name__=='__main__':
    ThreadingHTTPServer(('127.0.0.1',4175),Handler).serve_forever()
