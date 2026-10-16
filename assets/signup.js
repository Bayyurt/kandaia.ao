/* Kanda IA newsletter signup popup. Self-contained: styles live in a shadow root so edition pages keep their own look. */
(function(){
'use strict';
if(window.__kandaSignup)return;window.__kandaSignup=true;
var KEY='kanda-signup-hide',DAYS=30,ENDPOINT='https://formsubmit.co/ajax/info@kandaia.ao';
function hidden(){try{var t=+localStorage.getItem(KEY);return t&&Date.now()-t<DAYS*864e5;}catch(_){return false;}}
function remember(){try{localStorage.setItem(KEY,String(Date.now()));}catch(_){}}
var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validContact(v){v=v.trim();if(EMAIL.test(v))return true;var d=v.replace(/[\s().-]/g,'');return /^\+?\d{9,15}$/.test(d);}
var css=':host{all:initial}*{box-sizing:border-box}'+
'.card{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:340px;max-width:calc(100vw - 24px);font:14px/1.45 "Segoe UI",system-ui,-apple-system,sans-serif;color:#e8f6ff;background:linear-gradient(160deg,rgba(14,10,32,.97),rgba(6,8,20,.97));border:1px solid rgba(0,240,255,.45);border-radius:14px;padding:18px 18px 14px;box-shadow:0 0 0 1px rgba(255,43,214,.18),0 12px 40px rgba(0,0,0,.55),0 0 28px rgba(0,240,255,.18);transform:translateY(16px);opacity:0;transition:transform .25s ease,opacity .25s ease}'+
'.card.on{transform:none;opacity:1}'+
'h2{margin:0 26px 2px 0;font-size:16px;line-height:1.3;color:#fff;letter-spacing:.2px}h2 b{color:#00f0ff;font-weight:700}'+
'.en{margin:0 0 12px;color:#9fb3c8;font-size:12.5px}'+
'label{display:block;font-size:12px;color:#9fb3c8;margin:8px 0 4px}'+
'input{width:100%;padding:9px 11px;border-radius:8px;border:1px solid rgba(159,179,200,.35);background:rgba(255,255,255,.04);color:#fff;font:inherit}'+
'input:focus{outline:none;border-color:#00f0ff;box-shadow:0 0 0 3px rgba(0,240,255,.2)}input[aria-invalid=true]{border-color:#ff2bd6}'+
'.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}'+
'button{font:inherit;cursor:pointer}.go{margin-top:12px;width:100%;padding:10px;border:0;border-radius:8px;font-weight:700;color:#05060f;background:linear-gradient(90deg,#00f0ff,#ff2bd6)}.go:disabled{opacity:.6;cursor:wait}'+
'.go:focus-visible,.x:focus-visible{outline:2px solid #fff;outline-offset:2px}'+
'.x{position:absolute;top:8px;right:8px;width:32px;height:32px;border:0;border-radius:8px;background:transparent;color:#9fb3c8;font-size:20px;line-height:1}.x:hover{color:#fff;background:rgba(255,255,255,.08)}'+
'.priv{margin:10px 0 0;font-size:11.5px;color:#7f93a8}.msg{margin:8px 0 0;font-size:13px;min-height:1em}.msg.err{color:#ff7ae6}.msg.ok{color:#5cffc6}'+
'@media (max-width:560px){.card{left:0;right:0;bottom:0;width:100%;max-width:none;border-radius:16px 16px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom))}}'+
'@media (prefers-reduced-motion:reduce){.card{transition:none}}';
var host,root,card,lastFocus;
function build(){
 host=document.createElement('div');host.id='kanda-signup';
 root=host.attachShadow({mode:'open'});
 root.innerHTML='<style>'+css+'</style><section class="card" role="dialog" aria-modal="false" aria-labelledby="ks-t" aria-describedby="ks-d">'+
 '<button type="button" class="x" aria-label="Fechar / Close">×</button>'+
 '<h2 id="ks-t">Receba a <b>AI Newsletter by Kanda IA</b></h2>'+
 '<p class="en" id="ks-d">Get the AI Newsletter by Kanda IA, by email or WhatsApp.</p>'+
 '<form novalidate><label for="ks-n">Nome / Name</label><input id="ks-n" name="nome" autocomplete="name" required maxlength="80">'+
 '<label for="ks-c">Email ou telefone/WhatsApp / Email or phone</label><input id="ks-c" name="contacto" autocomplete="email" inputmode="email" required maxlength="120" placeholder="nome@exemplo.com ou +244 9xx xxx xxx">'+
 '<div class="hp" aria-hidden="true"><label for="ks-h">Não preencher</label><input id="ks-h" name="_honey" tabindex="-1" autocomplete="off"></div>'+
 '<button class="go" type="submit">Seguir / Follow</button><p class="msg" role="status" aria-live="polite"></p>'+
 '<p class="priv">Os seus dados só servem para enviar a newsletter. · Your data is only used to send the newsletter.</p></form></section>';
 document.body.appendChild(host);
 card=root.querySelector('.card');
 var form=root.querySelector('form'),n=root.getElementById('ks-n'),c=root.getElementById('ks-c'),h=root.getElementById('ks-h'),msg=root.querySelector('.msg'),go=root.querySelector('.go');
 root.querySelector('.x').addEventListener('click',function(){close(true);});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&card.classList.contains('on'))close(true);});
 function say(t,cls){msg.textContent=t;msg.className='msg '+(cls||'');}
 form.addEventListener('submit',function(e){
  e.preventDefault();
  var okN=n.value.trim().length>=2,okC=validContact(c.value);
  n.setAttribute('aria-invalid',String(!okN));c.setAttribute('aria-invalid',String(!okC));
  if(!okN){say('Indique o seu nome. · Please enter your name.','err');n.focus();return;}
  if(!okC){say('Email ou telefone inválido (ex.: +244 923 456 789). · Invalid email or phone.','err');c.focus();return;}
  if(h.value){say('Obrigado! · Thanks!','ok');remember();return;}
  var v=c.value.trim(),isMail=EMAIL.test(v);
  go.disabled=true;say('A enviar… · Sending…');
  fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({nome:n.value.trim(),email:isMail?v:'',telefone:isMail?'':v,pagina:location.pathname,_subject:'Nova inscrição newsletter',_template:'table',_captcha:'false',_honey:''})})
  .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
  .then(function(d){if(d&&(d.success===false||d.success==='false'))throw new Error('fail');remember();form.reset();say('Inscrição feita. Obrigado! · You are subscribed. Thank you!','ok');setTimeout(function(){close(false);},3500);})
  .catch(function(){say('Não foi possível enviar. Tente de novo ou escreva para info@kandaia.ao. · Could not send, please try again.','err');})
  .then(function(){go.disabled=false;});
 });
}
function open(manual){
 if(!manual&&hidden())return;
 if(!host)build();
 if(card.classList.contains('on'))return;
 lastFocus=document.activeElement;host.style.display='';
 requestAnimationFrame(function(){card.classList.add('on');});
 if(manual)setTimeout(function(){root.getElementById('ks-n').focus();},30);
}
function close(rem){if(!card)return;if(rem)remember();card.classList.remove('on');setTimeout(function(){host.style.display='none';},260);if(lastFocus&&lastFocus.focus&&root.activeElement)lastFocus.focus();}
window.KandaSignup={open:function(){open(true);},close:function(){close(false);}};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-signup-open]');if(a){e.preventDefault();open(true);}});
var auto=/^\/newsletter\//.test(location.pathname);
if(location.hash==='#seguir'){open(true);}
else if(auto&&!hidden()){
 var t=setTimeout(function(){done();open(false);},15000);
 function onScroll(){var d=document.documentElement,max=d.scrollHeight-d.clientHeight;if(max>0&&(window.scrollY/max)>=.5){done();open(false);}}
 function done(){clearTimeout(t);window.removeEventListener('scroll',onScroll);}
 window.addEventListener('scroll',onScroll,{passive:true});
}
})();
