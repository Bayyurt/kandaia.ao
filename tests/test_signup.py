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
        for m in ['id="ks-n"', 'id="ks-c"', 'name="_honey"', 'tabindex="-1"', 'required', 'formsubmit.co/ajax/info@kandaia.ao',
                  "_subject:'Nova inscrição comunidade Kanda IA'", "_template:'table'", "_captcha:'false'", 'Escape', 'attachShadow',
                  'Junte-se à comunidade', 'Join the Kanda IA community', 'Newsletter de IA, novidades e mais.', 'AI newsletter, updates and more.', 'Juntar-me / Join', 'DAYS=30', '3000', '.5']:
            self.assertIn(m, js)

if __name__ == '__main__':
    unittest.main()
