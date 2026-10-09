import json
import re
import unittest
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]

class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.guides = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'a':
            self.links.append(a.get('href', ''))
        if tag == 'details' and a.get('id', '').startswith('guia-'):
            self.guides.append(a['id'])

class EducationFirstSite(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / 'index.html').read_text()
        self.dom = Structure()
        self.dom.feed(self.html)
    def test_real_beginner_guides_available_without_signup(self):
        self.assertEqual(len(self.dom.guides), 3)
        for key in ['comecar', 'aprender', 'experimentar', 'comunidade']:
            self.assertIn(key, self.dom.ids)
    def test_instagram_is_real_participation_destination(self):
        self.assertIn('https://www.instagram.com/kanda.ia.ao/', self.dom.links)
        self.assertIn('mailto:info@kandaia.ao?subject=', self.html)
        self.assertNotIn('href="https://discord.gg/', self.html)
    def test_no_dead_links_or_founder_or_whatsapp_promises(self):
        self.assertNotIn('#', self.dom.links)
        self.assertNotIn('fundador', self.dom.ids)
        self.assertNotIn('Bedri Bayyurt', self.html)
        self.assertNotIn('Diagnóstico grátis', self.html)
        self.assertNotIn('wa.me/', self.html)
        self.assertEqual(len(self.dom.ids), len(set(self.dom.ids)))
        for href in self.dom.links:
            if href.startswith('#'):
                self.assertIn(href[1:], self.dom.ids)
    def test_prompt_builder_has_accessible_inputs_and_result(self):
        for key in ['prompt-goal', 'prompt-context', 'prompt-format', 'prompt-result', 'copy-prompt', 'copy-status']:
            self.assertIn(key, self.dom.ids)
        self.assertIn('aria-live="polite"', self.html)
        self.assertNotIn('eval(', self.html)
        self.assertNotIn('fetch(', self.html)
    def test_organization_metadata_is_valid_json(self):
        block = re.search(r'<script type="application/ld\+json">(.*?)</script>', self.html, re.S)
        self.assertIsNotNone(block)
        metadata = json.loads(block.group(1))
        self.assertEqual(metadata['@context'], 'https://schema.org')
        self.assertEqual(metadata['@type'], 'Organization')
        self.assertEqual(metadata['url'], 'https://kandaia.ao/')
        self.assertEqual(metadata['email'], 'info@kandaia.ao')
        self.assertEqual(metadata['sameAs'], ['https://www.instagram.com/kanda.ia.ao/'])

    def test_bilingual_and_existing_assets_preserved(self):
        self.assertIn('lang="pt-AO"', self.html)
        self.assertIn('id="b-en"', self.html)
        self.assertIn('id="b-pt"', self.html)
        self.assertIn('data:font/woff2;base64,', self.html)
        self.assertIn('prefers-reduced-motion', self.html)
        self.assertIn('https://kandaia.ao/', self.html)

if __name__ == '__main__':
    unittest.main()
