/* Kanda IA newsletter signup popup. Self-contained: styles live in a shadow root so edition pages keep their own look. */
(function(){
'use strict';
if(window.__kandaSignup)return;window.__kandaSignup=true;
var KEY='kanda-signup-hide',DAYS=30,LATEST='/newsletter/2026-10-16/',ENDPOINT='https://formsubmit.co/ajax/info@kandaia.ao';
function hidden(){try{var t=+localStorage.getItem(KEY);return t&&Date.now()-t<DAYS*864e5;}catch(_){return false;}}
function remember(){try{localStorage.setItem(KEY,String(Date.now()));}catch(_){}}
var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var css=':host{all:initial}*{box-sizing:border-box}'+
'.card{position:fixed;right:16px;bottom:16px;z-index:2147483000;width:300px;max-width:calc(100vw - 24px);font:13px/1.4 "Segoe UI",system-ui,-apple-system,sans-serif;color:#e8f6ff;background:rgba(8,8,22,.96);border:1px solid rgba(0,240,255,.4);border-radius:12px;padding:12px 12px 10px;box-shadow:0 8px 28px rgba(0,0,0,.5),0 0 18px rgba(0,240,255,.14);transform:translateY(12px);opacity:0;transition:transform .2s ease,opacity .2s ease}'+
'.card.on{transform:none;opacity:1}'+
'h2{margin:0 24px 1px 0;font-size:13.5px;line-height:1.3;color:#fff;font-weight:700}h2 b{color:#00f0ff}'+
'.sub{margin:0 0 8px;color:#9fb3c8;font-size:11.5px}'+
'.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'+
'.row{display:flex;gap:6px}.row input{min-width:0}'+
'input{flex:1;width:100%;padding:7px 9px;border-radius:7px;border:1px solid rgba(159,179,200,.3);background:rgba(255,255,255,.04);color:#fff;font:12.5px/1.3 inherit;font-family:inherit}'+
'input:focus{outline:none;border-color:#00f0ff;box-shadow:0 0 0 2px rgba(0,240,255,.2)}input[aria-invalid=true]{border-color:#ff2bd6}'+
'.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}'+
'button{font:inherit;cursor:pointer}.go{flex:none;padding:7px 11px;border:0;border-radius:7px;font-weight:700;font-size:12px;color:#05060f;background:linear-gradient(90deg,#00f0ff,#ff2bd6)}.go:disabled{opacity:.6;cursor:wait}'+
'.go:focus-visible,.x:focus-visible{outline:2px solid #fff;outline-offset:2px}'+
'.x{position:absolute;top:6px;right:6px;width:26px;height:26px;border:0;border-radius:6px;background:transparent;color:#9fb3c8;font-size:17px;line-height:1}.x:hover{color:#fff;background:rgba(255,255,255,.08)}'+
'.priv{margin:6px 0 0;font-size:10.5px;color:#7f93a8}.msg{margin:4px 0 0;font-size:11.5px}.msg:empty{display:none}.msg.err{color:#ff7ae6}.msg.ok{color:#5cffc6}'+
'@media (max-width:560px){.card{left:0;right:0;bottom:0;width:100%;max-width:none;border-radius:12px 12px 0 0;padding:10px 12px calc(8px + env(safe-area-inset-bottom))}}'+
'@media (prefers-reduced-motion:reduce){.card{transition:none}}';
var host,root,card,lastFocus;
function build(){
 host=document.createElement('div');host.id='kanda-signup';
 root=host.attachShadow({mode:'open'});
 root.innerHTML='<style>'+css+'.ty-h{margin:4px 0 2px;color:#00f0ff;font-weight:700;text-shadow:0 0 8px rgba(0,240,255,.6)}.ty-s{margin:0 0 8px;font-size:12px;opacity:.85}.ty-l{display:flex;flex-direction:column;gap:6px;margin:0}.ty-l a{color:#ff2bd6;font:600 12px ui-monospace,Menlo,monospace;text-decoration:none}.ty-l a:hover{text-decoration:underline}</style><section class="card" role="dialog" aria-modal="false" aria-labelledby="ks-t" aria-describedby="ks-d">'+
 '<button type="button" class="x" aria-label="Fechar / Close">×</button>'+
 '<h2 id="ks-t">Junte-se à comunidade <b>Kanda IA</b><span class="sr"> / Join the Kanda IA community</span></h2>'+
 '<p class="sub" id="ks-d">Newsletter de IA, novidades e mais. · <span lang="en">Join the community: AI newsletter, updates and more.</span></p>'+
 '<form novalidate><div class="row"><label class="sr" for="ks-n">Nome / Name</label><input id="ks-n" name="nome" autocomplete="name" required maxlength="80" placeholder="Nome / Name"></div>'+
 '<div class="row" style="margin-top:6px"><label class="sr" for="ks-c">Email</label><input id="ks-c" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="120" placeholder="Email">'+
 '<button class="go" type="submit">Juntar-me / Join</button></div>'+
 '<div class="hp" aria-hidden="true"><label for="ks-h">Não preencher</label><input id="ks-h" name="_honey" tabindex="-1" autocomplete="off"></div>'+
 '<p class="msg" role="status" aria-live="polite"></p>'+
 '<p class="priv">Dados usados só para comunicações Kanda IA. · Used only for Kanda IA updates.</p></form></section>';
 document.body.appendChild(host);
 card=root.querySelector('.card');
 var form=root.querySelector('form'),n=root.getElementById('ks-n'),c=root.getElementById('ks-c'),h=root.getElementById('ks-h'),msg=root.querySelector('.msg'),go=root.querySelector('.go');
 root.querySelector('.x').addEventListener('click',function(){close(true);});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&card.classList.contains('on'))close(true);});
 function thanks(){form.style.display='none';root.querySelector('.sub').style.display='none';var t=document.createElement('div');t.className='ty';t.setAttribute('role','status');
  t.innerHTML='<p class="ty-h">Bem-vindo à comunidade! <span lang="en">· Welcome!</span></p><p class="ty-s">Enviámos um email de boas-vindas. <span lang="en">We sent you a welcome email.</span></p>'+
  '<p class="ty-l"><a href="'+LATEST+'">Última newsletter / Latest newsletter →</a><a href="/aprender/">Guias Aprender / Guides →</a></p>';root.querySelector('.card').appendChild(t);}
 function say(t,cls){msg.textContent=t;msg.className='msg '+(cls||'');}
 form.addEventListener('submit',function(e){
  e.preventDefault();
  var okN=n.value.trim().length>=2,okC=EMAIL.test(c.value.trim());
  n.setAttribute('aria-invalid',String(!okN));c.setAttribute('aria-invalid',String(!okC));
  if(!okN){say('Indique o seu nome. · Please enter your name.','err');n.focus();return;}
  if(!okC){say('Email inválido (ex.: nome@gmail.com). · Invalid email.','err');c.focus();return;}
  if(h.value){say('Obrigado! · Thanks!','ok');remember();return;}
  var v=c.value.trim();
  go.disabled=true;say('A enviar… · Sending…');
  var data={nome:n.value.trim(),email:v,pagina:location.pathname,_subject:'Nova inscrição comunidade Kanda IA',_template:'table',_captcha:'false',_honey:''};
  function ok(){remember();form.reset();go.disabled=false;thanks();}
  function post(){return fetch(ENDPOINT,{method:'POST',mode:'cors',referrer:location.href,referrerPolicy:'no-referrer-when-downgrade',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
   .then(function(r){return r.text().then(function(t){var d;try{d=JSON.parse(t);}catch(_){d=null;}if(!r.ok||!d||d.success===false||d.success==='false')throw new Error('formsubmit '+r.status+': '+(d&&d.message||t).slice(0,200));return d;});});}
  /* Fallback: classic form POST into a hidden iframe (no CORS/JSON involved). */
  function classic(){var name='ks-f'+Date.now(),f=document.createElement('iframe');f.name=name;f.style.display='none';f.setAttribute('aria-hidden','true');document.body.appendChild(f);
   var fm=document.createElement('form');fm.method='POST';fm.action=ENDPOINT.replace('/ajax/','/');fm.target=name;fm.style.display='none';fm.setAttribute('referrerpolicy','no-referrer-when-downgrade');
   data._next=location.origin+'/404.html';for(var k in data){var i=document.createElement('input');i.type='hidden';i.name=k;i.value=data[k];fm.appendChild(i);}
   document.body.appendChild(fm);fm.submit();setTimeout(function(){fm.remove();f.remove();},20000);}
  post().catch(function(e){if(window.console)console.warn('[kanda-signup] retry',e&&e.message);return new Promise(function(r){setTimeout(r,1200);}).then(post);})
  .then(ok,function(e){if(window.console)console.warn('[kanda-signup] ajax failed, classic fallback',e&&e.message);try{classic();ok();}catch(_){say('Não foi possível enviar. Tente de novo ou escreva para info@kandaia.ao. · Could not send, please try again.','err');go.disabled=false;}});
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
var auto=true;
if(location.hash==='#seguir'){open(true);}
else if(auto&&!hidden()){
 var t=setTimeout(function(){done();open(false);},3000);
 function onScroll(){var d=document.documentElement,max=d.scrollHeight-d.clientHeight;if(max>0&&(window.scrollY/max)>=.5){done();open(false);}}
 function done(){clearTimeout(t);window.removeEventListener('scroll',onScroll);}
 window.addEventListener('scroll',onScroll,{passive:true});
}
})();
