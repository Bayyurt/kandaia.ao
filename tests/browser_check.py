"""Multipage browser checks. Requires playwright and Chromium.
Usage: python tests/browser_check.py [--url https://kandaia.ao/] [--screenshots DIR]
"""
import argparse
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ROUTES = ['/', '/aprender/', '/experimentar/', '/comunidade/', '/solucoes/', '/aprender/aprender-com-ia/', '/aprender/escrever-melhor/', '/aprender/verificar-respostas/']

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def check(url, screenshots):
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), headless=True)
        context = browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
        page = context.new_page()
        errors, failed = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('response', lambda r: failed.append((r.status,r.url)) if r.status>=400 else None)
        page.goto(url,wait_until='networkidle')
        assert page.locator('#prompt-goal').count()==0
        assert page.locator('.guide-body').count()==0
        assert page.locator('nav a[href="/aprender/"]').is_visible()
        page.locator('nav a[href="/aprender/"]').click()
        page.wait_for_url('**/aprender/')
        assert page.locator('.directory article').count()==3
        assert page.locator('nav a[href="/aprender/"]').get_attribute('aria-current')=='page'
        page.locator('a[href="/aprender/aprender-com-ia/"]').click()
        page.wait_for_url('**/aprender/aprender-com-ia/')
        assert page.get_by_text('Como saber se ajudou',exact=True).is_visible()
        page.locator('#b-en').click()
        assert page.locator('html').get_attribute('lang')=='en'
        assert 'Use AI to learn' in page.title()
        page.locator('nav a[href="/experimentar/"]').click()
        page.wait_for_url('**/experimentar/')
        assert page.locator('html').get_attribute('lang')=='en'
        assert page.locator('#prompt-result').inner_text().startswith('Task: Understand simple interest')
        page.locator('#b-pt').click()
        page.locator('#prompt-goal').fill('Organizar o estudo <img src=x onerror=alert(1)>')
        page.locator('#prompt-context').fill('Duas horas e três disciplinas.')
        page.locator('#prompt-format').fill('Uma lista com prioridades.')
        assert '<img src=x onerror=alert(1)>' in page.locator('#prompt-result').inner_text()
        assert page.locator('#prompt-result img').count()==0
        page.locator('#b-en').click()
        assert page.locator('#prompt-goal').input_value().startswith('Organizar o estudo')
        page.locator('#b-pt').click()
        context.grant_permissions(['clipboard-read','clipboard-write'])
        page.locator('#copy-prompt').click()
        assert 'Copiado.' in page.locator('#copy-status').inner_text()
        assert page.evaluate('navigator.clipboard.readText()')==page.locator('#prompt-result').inner_text()
        page.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
        page.locator('#copy-prompt').click()
        assert 'Texto selecionado' in page.locator('#copy-status').inner_text()
        page.locator('#prompt-goal').fill('')
        assert '[acrescenta informação]' in page.locator('#prompt-result').inner_text()
        assert page.evaluate('JSON.stringify(localStorage)')=='{"kanda-lang":"pt-AO"}'
        results=[]
        for route in ROUTES:
            target=urljoin(url,route)
            response=page.goto(target,wait_until='networkidle')
            assert response.status==200,(route,response.status)
            assert page.locator('h1').count()==1
            assert page.locator('#fundador').count()==0
            assert page.locator('.scanlines').count()==1
            for width in [320,360,390,768,1440]:
                page.set_viewport_size({'width':width,'height':1000})
                for lang in ['pt','en']:
                    page.locator('#b-'+lang).click()
                    actual=page.evaluate('({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})')
                    assert actual['scroll']<=actual['client'],(route,width,lang,actual)
                    assert page.locator('nav a[href="/aprender/"]').is_visible()
            results.append({'route':route,'status':response.status,'responsive':'PASS (320–1440 px, PT/EN)'})
        page.locator('#b-pt').click()
        if screenshots:
            screenshots.mkdir(parents=True,exist_ok=True)
            for route,name in [('/','home'),('/aprender/','learn'),('/aprender/aprender-com-ia/','guide'),('/experimentar/','exercise')]:
                page.goto(urljoin(url,route),wait_until='networkidle')
                for label,width in [('desktop',1440),('mobile',390)]:
                    page.set_viewport_size({'width':width,'height':1000})
                    page.screenshot(path=str(screenshots/(name+'-'+label+'.png')),full_page=True)
        assert not errors,errors
        assert not failed,failed
        assert context.cookies()==[]
        nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
        fallback=nojs.new_page()
        fallback.goto(urljoin(url,'/aprender/'))
        fallback.locator('a[href="/aprender/aprender-com-ia/"]').click()
        assert fallback.get_by_text('Como saber se ajudou',exact=True).is_visible()
        fallback.goto(urljoin(url,'/experimentar/'))
        assert fallback.locator('#prompt-result').inner_text().startswith('Tarefa:')
        motion=browser.new_context(reduced_motion='no-preference')
        animated=motion.new_page()
        animated.goto(url)
        assert animated.locator('.g-a').first.evaluate("e=>getComputedStyle(e).animationName")=='g1'
        assert animated.locator('.floor').evaluate("e=>getComputedStyle(e).animationName")=='gridPulse'
        print(json.dumps({'result':'PASS','routes':results,'checks':['real page navigation','article routes','original neon and animations','active nav','PT/EN across navigation','local prompt builder','safe text rendering','clipboard and fallback','no cookies or prompt storage','no-JS navigation and articles','no page errors or failed assets']},ensure_ascii=False))
        browser.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url')
    parser.add_argument('--screenshots',type=Path)
    args=parser.parse_args()
    server=None
    try:
        if args.url:
            target=args.url
        else:
            handler=functools.partial(QuietHandler,directory=str(ROOT))
            server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            target='http://127.0.0.1:'+str(server.server_port)+'/'
        check(target,args.screenshots)
    finally:
        if server:
            server.shutdown()
            server.server_close()
