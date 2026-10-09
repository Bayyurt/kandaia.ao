import json
import re
import unittest
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ROUTES = ['/', '/aprender/', '/experimentar/', '/comunidade/', '/solucoes/', '/aprender/aprender-com-ia/', '/aprender/escrever-melhor/', '/aprender/verificar-respostas/']

class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.links, self.assets = [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'a':
            self.links.append(a.get('href', ''))
        if tag in ('script', 'img') and a.get('src'):
            self.assets.append(a['src'])
        if tag == 'link' and a.get('href', '').startswith('/'):
            self.assets.append(a['href'])

class MultipageSite(unittest.TestCase):
    def test_spaces_and_guides_have_real_pages(self):
        for route in ROUTES:
            with self.subTest(route=route):
                path = ROOT / route.strip('/') / 'index.html'
                self.assertTrue(path.is_file(), route)
                html = path.read_text()
                self.assertIn('<main', html)
                self.assertIn('id="b-en"', html)
                self.assertIn('lang="pt-AO"', html)
                self.assertIn('https://kandaia.ao' + route, html)
    def test_home_is_gateway_not_full_presentation(self):
        html = (ROOT / 'index.html').read_text()
        self.assertNotIn('id="prompt-goal"', html)
        self.assertNotIn('class="guide-body"', html)
        nav = re.search(r'<nav.*?</nav>', html, re.S).group(0)
        for route in ['/aprender/', '/experimentar/', '/comunidade/']:
            self.assertIn('href="' + route + '"', nav)
        self.assertNotIn('href="#', nav)
    def test_original_neon_visual_identity_is_restored(self):
        css = ROOT / 'assets/site.css'
        self.assertTrue(css.exists())
        text = css.read_text()
        for marker in ['.scanlines', '.vignette', '.glitch', '.holo', '.floor', '.term', '#00f0ff', '#ff2bd6', 'data:font/woff2;base64,', 'prefers-reduced-motion']:
            self.assertIn(marker, text)
        html = (ROOT / 'index.html').read_text()
        self.assertIn('class="scanlines"', html)
        self.assertIn('class="glitch-wrap"', html)
        self.assertIn('class="floor"', html)
    def test_all_internal_links_assets_and_metadata_are_valid(self):
        for route in ROUTES:
            path = ROOT / route.strip('/') / 'index.html'
            self.assertTrue(path.exists(), route)
            html = path.read_text()
            dom = Structure()
            dom.feed(html)
            self.assertEqual(len(dom.ids), len(set(dom.ids)), route)
            for href in dom.links:
                self.assertNotEqual(href, '#')
                if href.startswith('#'):
                    self.assertIn(href[1:], dom.ids)
                elif href.startswith('/'):
                    target = urlsplit(href).path
                    self.assertTrue((ROOT / target.strip('/') / 'index.html').exists(), (route, href))
            for asset in dom.assets:
                self.assertTrue((ROOT / asset.lstrip('/')).is_file(), (route, asset))
            blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
            for block in blocks:
                data = json.loads(block)
                self.assertEqual(data['@context'], 'https://schema.org')
            self.assertNotIn('Bedri Bayyurt', html)
            self.assertNotIn('id="fundador"', html)
            self.assertNotIn('href="https://discord.gg/', html)
    def test_prompt_tool_exists_only_in_its_space(self):
        path = ROOT / 'experimentar/index.html'
        self.assertTrue(path.exists())
        html = path.read_text()
        dom = Structure()
        dom.feed(html)
        for key in ['prompt-goal','prompt-context','prompt-format','prompt-result','copy-prompt','copy-status']:
            self.assertIn(key, dom.ids)
        self.assertIn('aria-live="polite"', html)
        script = (ROOT / 'assets/site.js').read_text()
        self.assertNotIn('fetch(', script)
        self.assertNotIn('eval(', script)
    def test_community_and_sitemap_use_real_destinations(self):
        path = ROOT / 'comunidade/index.html'
        self.assertTrue(path.exists())
        html = path.read_text()
        self.assertIn('https://www.instagram.com/kanda.ia.ao/', html)
        self.assertIn('Em preparação', html)
        self.assertIn('mailto:info@kandaia.ao?subject=', html)
        tree = ET.parse(ROOT / 'sitemap.xml')
        locs = [e.text for e in tree.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(set(locs), {'https://kandaia.ao' + route for route in ROUTES})

if __name__ == '__main__':
    unittest.main()
