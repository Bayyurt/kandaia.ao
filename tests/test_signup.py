import re, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
MAIN = ['index.html','aprender/index.html','aprender/aprender-com-ia/index.html','aprender/escrever-melhor/index.html','aprender/verificar-respostas/index.html','experimentar/index.html','comunidade/index.html','solucoes/index.html','newsletter/index.html']

class Signup(unittest.TestCase):
    def test_script_included_everywhere(self):
        for p in MAIN + [str(x.relative_to(ROOT)) for x in ROOT.glob('newsletter/2026-*/index.html')]:
            with self.subTest(p=p):
                self.assertEqual((ROOT/p).read_text().count('/assets/signup.js'), 1)
    def test_footer_link_on_main_pages(self):
        for p in MAIN:
            with self.subTest(p=p):
                foot = re.search(r'<footer.*?</footer>', (ROOT/p).read_text(), re.S).group(0)
                self.assertIn('data-signup-open', foot)
                self.assertIn('Junte-se à comunidade', foot)
    def test_popup_fields_honeypot_backend(self):
        js = (ROOT/'assets/signup.js').read_text()
        for m in ['id="ks-n"', 'id="ks-c"', 'type="email"', 'Enviámos um email de boas-vindas', '/aprender/', 'LATEST=',  'name="_honey"', 'tabindex="-1"', 'required', 'formsubmit.co/ajax/info@kandaia.ao',
                  "_subject:'Nova inscrição comunidade Kanda IA'", "_template:'table'", "_captcha:'false'", 'Escape', 'attachShadow',
                  'Junte-se à comunidade', 'Join the Kanda IA community', 'Newsletter de IA, novidades e mais.', 'AI newsletter, updates and more.', 'Juntar-me / Join', 'DAYS=30', '3000', '.5']:
            self.assertIn(m, js)



class AutoOpenEverywhere(unittest.TestCase):
    def test_auto_open_all_pages_and_v3(self):
        js=(ROOT/'assets/signup.js').read_text()
        self.assertIn('var auto=true;', js); self.assertIn('3000', js); self.assertIn('DAYS=', js)
        for p in ROOT.rglob('index.html'):
            t=p.read_text()
            if 'signup.js' in t: self.assertIn('signup.js?v=5', t, str(p))


if __name__ == '__main__':
    unittest.main()
