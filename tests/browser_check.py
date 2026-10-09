"""Browser regression checks. Requires playwright and a Chromium executable.
Usage: python tests/browser_check.py [--url https://kandaia.ao/] [--screenshots DIR]
Set CHROMIUM_EXECUTABLE if Chromium is not installed at /usr/bin/chromium.
"""
import argparse
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def check(url, screenshots):
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE', '/usr/bin/chromium'), headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        response = page.goto(url, wait_until='networkidle')
        assert response.status == 200
        assert page.locator('#fundador').count() == 0
        assert page.locator('h1').inner_text().startswith('Aprende IA.')
        assert page.locator('#b-pt').get_attribute('aria-pressed') == 'true'
        assert len(page.locator('details.guide').all()) == 3
        page.locator('#guia-1 summary').click()
        assert page.locator('#guia-1').evaluate('(e)=>e.open')
        assert page.get_by_text('Como saber se ajudou', exact=True).is_visible()
        page.locator('#guia-1 summary').click()
        page.locator('#b-en').click()
        assert page.locator('html').get_attribute('lang') == 'en'
        assert page.locator('h1').inner_text().startswith('Learn AI.')
        assert page.locator('#prompt-result').inner_text().startswith('Task: Understand simple interest')
        page.reload(wait_until='networkidle')
        assert page.locator('html').get_attribute('lang') == 'en'
        page.locator('#b-pt').click()
        page.locator('#prompt-goal').fill('Organizar o meu estudo <img src=x onerror=alert(1)>')
        page.locator('#prompt-context').fill('Tenho duas horas livres e três disciplinas.')
        page.locator('#prompt-format').fill('Uma lista curta, com prioridades.')
        assert '<img src=x onerror=alert(1)>' in page.locator('#prompt-result').inner_text()
        assert page.locator('#prompt-result img').count() == 0
        page.locator('#b-en').click()
        assert page.locator('#prompt-goal').input_value().startswith('Organizar o meu estudo')
        assert page.locator('#prompt-result').inner_text().startswith('Task: Organizar o meu estudo')
        page.locator('#b-pt').click()
        context.grant_permissions(['clipboard-read', 'clipboard-write'])
        page.locator('#copy-prompt').click()
        assert 'Copiado.' in page.locator('#copy-status').inner_text()
        assert page.evaluate('navigator.clipboard.readText()') == page.locator('#prompt-result').inner_text()
        page.evaluate("Object.defineProperty(navigator, 'clipboard', {value: undefined, configurable:true})")
        page.locator('#copy-prompt').click()
        assert 'Texto selecionado' in page.locator('#copy-status').inner_text()
        page.locator('#prompt-goal').fill('')
        assert '[acrescenta informação]' in page.locator('#prompt-result').inner_text()
        assert page.evaluate("JSON.stringify(localStorage)") == '{"kanda-lang":"pt-AO"}'
        page.goto(url + '#guia-3', wait_until='networkidle')
        assert page.locator('#guia-3').evaluate('(e)=>e.open')
        page.locator('#guia-3 summary').click()
        overflow = []
        for width in [320, 360, 390, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 1000})
            for lang in ['pt', 'en']:
                page.locator('#b-' + lang).click()
                actual = page.evaluate('({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})')
                assert actual['scroll'] <= actual['client'], (width, lang, actual)
                overflow.append({'width': width, 'language': lang, 'overflow': False})
        page.locator('#b-pt').click()
        page.goto(url, wait_until='networkidle')
        if screenshots:
            screenshots.mkdir(parents=True, exist_ok=True)
            for label, width in [('desktop', 1440), ('mobile', 390)]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.screenshot(path=str(screenshots / (label + '.png')), full_page=True)
        assert not errors, errors
        assert context.cookies() == []
        nojs = browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
        fallback = nojs.new_page()
        fallback.goto(url)
        assert fallback.locator('#guia-1 summary').is_visible()
        fallback.locator('#guia-1 summary').click()
        assert fallback.get_by_text('Como saber se ajudou', exact=True).is_visible()
        assert fallback.locator('#prompt-result').inner_text().startswith('Tarefa:')
        print(json.dumps({'result':'PASS','checks':['PT/EN and persistence','three readable guides','deep-link opening','prompt builder','XSS-safe output','clipboard and manual fallback','no cookies','no prompt storage','no-JS guides','no page errors'], 'viewports':overflow}, ensure_ascii=False))
        browser.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--url')
    parser.add_argument('--screenshots', type=Path)
    args = parser.parse_args()
    server = None
    try:
        if args.url:
            target = args.url
        else:
            handler = functools.partial(QuietHandler, directory=str(ROOT))
            server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            target = 'http://127.0.0.1:' + str(server.server_port) + '/'
        check(target, args.screenshots)
    finally:
        if server:
            server.shutdown()
            server.server_close()
