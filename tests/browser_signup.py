"""Popup browser check. Network to formsubmit is intercepted (never hits live endpoint).
Usage: python tests/browser_signup.py [--screenshots DIR]"""
import argparse, functools, http.server, os, threading, json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
def run(base, shots):
    posts=[]
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'))
        def ctx(w,h):
            c=b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
            c.route('https://formsubmit.co/**',lambda r:(posts.append(r.request.post_data_json),r.fulfill(status=200,content_type='application/json',body='{"success":"true"}')))
            return c
        c=ctx(1280,800); pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.clock.install()
        pg.goto(base+'newsletter/2026-10-16/')
        card=pg.locator('#kanda-signup .card')
        assert card.count()==0
        pg.clock.run_for(16000); pg.wait_for_timeout(400)
        assert card.is_visible()
        for s in ['#ks-n','#ks-c','#ks-h']: assert pg.locator('#kanda-signup '+s).count()==1
        assert pg.locator('#kanda-signup #ks-h').bounding_box()['x']<-1000
        if shots: pg.screenshot(path=str(shots/'signup-desktop.png'))
        pg.keyboard.press('Escape'); pg.clock.run_for(500)
        assert not card.is_visible()
        assert pg.evaluate("localStorage.getItem('kanda-signup-hide')")
        pg.reload(); pg.clock.run_for(20000); pg.wait_for_timeout(200)
        assert pg.locator('#kanda-signup').count()==0, 'should stay hidden 30 days'
        # submit flow on fresh context
        c2=ctx(390,844); m=c2.new_page(); m.goto(base+'newsletter/2026-10-16/')
        m.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)'); m.wait_for_timeout(400)
        mc=m.locator('#kanda-signup .card'); assert mc.is_visible()
        box=mc.bounding_box(); assert box['width']>=389 and abs(box['y']+box['height']-844)<2 and box['height']<=0.35*844, box
        if shots: m.screenshot(path=str(shots/'signup-mobile.png'))
        m.locator('#ks-n').fill('Ana'); m.locator('#ks-c').fill('abc'); m.locator('.go').click()
        assert 'inválido' in m.locator('.msg').inner_text() and not posts
        m.locator('#ks-c').fill('+244 923 456 789'); m.locator('.go').click()
        m.wait_for_function("document.querySelector('#kanda-signup').shadowRoot.querySelector('.msg').className.includes('ok')")
        assert posts and posts[0]['telefone']=='+244 923 456 789' and posts[0]['_subject']=='Nova inscrição comunidade Kanda IA'
        # home: no auto-open, footer link opens
        c3=ctx(1280,800); h=c3.new_page(); h.clock.install(); h.goto(base); h.clock.run_for(20000)
        assert h.locator('#kanda-signup').count()==0
        h.locator('footer [data-signup-open]').click(); h.wait_for_timeout(400)
        assert h.locator('#kanda-signup .card').is_visible()
        assert h.evaluate("document.querySelector('#kanda-signup').shadowRoot.activeElement.id")=='ks-n'
        if shots: h.screenshot(path=str(shots/'signup-home.png'))
        assert not errs, errs
        print(json.dumps({'result':'PASS','posts_intercepted':len(posts)}))
        b.close()
if __name__=='__main__':
    a=argparse.ArgumentParser(); a.add_argument('--screenshots',type=Path); a=a.parse_args()
    if a.screenshots: a.screenshots.mkdir(parents=True,exist_ok=True)
    s=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=str(ROOT)))
    threading.Thread(target=s.serve_forever,daemon=True).start()
    try: run('http://127.0.0.1:%d/'%s.server_port,a.screenshots)
    finally: s.shutdown()
