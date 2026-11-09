"""Signup pop-up browser check (Kanda avatar + speech bubble).
FormSubmit is intercepted: nothing reaches the live endpoint.
Usage: python tests/browser_signup.py [--screenshots DIR]"""
import argparse, functools, http.server, os, threading, json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
SR = "document.querySelector('#kanda-signup')"
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
def run(base, shots):
    posts = []
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
        def ctx(w, h, rm='reduce'):
            c = b.new_context(viewport={'width': w, 'height': h}, reduced_motion=rm)
            c.route('https://formsubmit.co/**', lambda r: (posts.append(r.request.post_data_json),
                    r.fulfill(status=200, content_type='application/json', body='{"success":"true"}')))
            return c
        def is_open(pg):
            return pg.evaluate(f"!!{SR} && {SR}.classList.contains('open')")
        c = ctx(1280, 800); pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.clock.install(); pg.goto(base + 'newsletter/'); pg.wait_for_load_state('load')
        pg.clock.run_for(5000); pg.wait_for_timeout(100)
        assert not is_open(pg), 'not before ~9 s'
        pg.clock.run_for(4500); pg.wait_for_timeout(300)
        assert is_open(pg), 'auto-open at ~9 s'
        assert pg.evaluate(f"{SR}.shadowRoot.querySelector('[role=dialog]').getAttribute('aria-labelledby')") == 'kp-t'
        if shots: pg.screenshot(path=str(shots / 'signup-desktop.png'))
        pg.keyboard.press('Escape'); pg.clock.run_for(1200); pg.wait_for_timeout(100)
        assert not is_open(pg)
        assert pg.evaluate("localStorage.getItem('kanda-pop-dismiss')")
        pg.reload(); pg.wait_for_load_state('load'); pg.clock.run_for(30000); pg.wait_for_timeout(200)
        assert not is_open(pg), 'stays hidden after dismiss'
        # phone: 40% scroll opens it, tap outside dismisses, submit flow
        c2 = ctx(390, 844); m = c2.new_page(); m.goto(base); m.wait_for_load_state('load'); m.wait_for_timeout(2600)
        m.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)'); m.wait_for_timeout(500)
        assert is_open(m), 'scroll trigger'
        bx = m.evaluate(f"(()=>{{const r={SR}.shadowRoot.querySelector('.bub').getBoundingClientRect();return [r.width,r.height,r.left]}})()")
        assert bx[0] <= 390 - 20 and bx[1] < 0.45 * 844 and bx[2] >= 8, bx
        m.locator('#kp-e').fill('abc'); m.locator('#kanda-signup .go').click()
        assert 'não parece certo' in m.locator('#kanda-signup .msg').inner_text() and not posts
        m.locator('#kp-e').fill('ana@example.com'); m.locator('#kanda-signup .go').click()
        m.wait_for_function(f"{SR}.classList.contains('ok')")
        assert 'Feito.' in m.locator('#kanda-signup .done').inner_text()
        if shots: m.screenshot(path=str(shots / 'signup-mobile-done.png'))
        d = posts[0]
        assert d['email'] == 'ana@example.com' and d['_subject'] == 'Nova inscrição comunidade Kanda IA' and 'nome' in d and d['pagina'] == '/'
        assert m.evaluate("localStorage.getItem('kanda-pop-done')") == '1'
        # footer link reopens manually and focuses the email field
        c3 = ctx(1280, 800); h = c3.new_page(); h.goto(base + '?popup=off'); h.wait_for_load_state('load')
        h.locator('footer [data-signup-open]').click(); h.wait_for_timeout(500)
        assert is_open(h)
        assert h.evaluate(f"{SR}.shadowRoot.activeElement.id") == 'kp-e'
        h.mouse.click(200, 300); h.wait_for_timeout(300)
        assert not is_open(h), 'tap outside closes'
        assert not errs, errs
        print(json.dumps({'result': 'PASS', 'posts_intercepted': len(posts)}))
        b.close()
if __name__ == '__main__':
    a = argparse.ArgumentParser(); a.add_argument('--screenshots', type=Path); a = a.parse_args()
    if a.screenshots: a.screenshots.mkdir(parents=True, exist_ok=True)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT)))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    try: run('http://127.0.0.1:%d/' % s.server_port, a.screenshots)
    finally: s.shutdown()
