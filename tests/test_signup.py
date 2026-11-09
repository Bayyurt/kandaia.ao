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
        for m in ['id="kp-e"', 'type="email"', 'name="_honey"', 'tabindex="-1"', 'required', 'formsubmit.co/ajax/info@kandaia.ao',
                  "SUBJ='Nova inscrição comunidade Kanda IA'", "_template:'table'", "_captcha:'false'", "nome:''", 'pagina:location.pathname',
                  'Escape', 'attachShadow', 'role="dialog"', 'aria-labelledby', 'prefers-reduced-motion',
                  'Gostaste? Subscreve.', 'Recebe newsletters grátis e muito mais, por email.', 'Subscrever',
                  'Feito. Vais receber a próxima edição.', 'Liked this? Subscribe.', 'Get free newsletters and more, by email.', 'Subscribe',
                  'DAYS=14', 'DELAY=9000', 'SCROLL=.4', "K_DONE='kanda-pop-done'", "popup"]:
            self.assertIn(m, js)
        for bad in ['na prática', 'em português claro', '3x']:
            self.assertNotIn(bad, js)


class AutoOpenEverywhere(unittest.TestCase):
    def test_auto_open_all_pages_and_v6(self):
        for p in ROOT.rglob('index.html'):
            t=p.read_text()
            if 'signup.js' in t: self.assertIn('signup.js?v=6', t, str(p))


if __name__ == '__main__':
    unittest.main()
