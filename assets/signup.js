/*! kanda-signup.js · Kanda IA newsletter signup that pops out of the Kanda avatar.
 * Self-contained (shadow DOM, no deps). Posts to the same FormSubmit endpoint and fields as before,
 * so signups keep landing in info@kandaia.ao for signups_sync.py.
 * Triggers: ~9s or 40% scroll (whichever first, never on first paint). Dismiss: X / Esc / tap outside -> 14 days.
 * Success -> never again. Manual: [data-signup-open], #seguir, window.KandaSignup.open(). Test: ?popup=now | ?popup=off */
(function(){
'use strict';
if(window.__kandaSignup)return;window.__kandaSignup=true;
var ENDPOINT='https://formsubmit.co/ajax/info@kandaia.ao',SUBJ='Nova inscrição comunidade Kanda IA';
var K_DIS='kanda-pop-dismiss',K_DONE='kanda-pop-done',K_OLD='kanda-signup-hide',DAYS=14,DELAY=9000,SCROLL=.4,MINWAIT=2500;
var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var D=document,R=D.documentElement;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(_){return null;}}
function recent(k){var t=+ls(k);return t&&Date.now()-t<DAYS*864e5;}
function blocked(){return ls(K_DONE)==='1'||recent(K_DIS)||recent(K_OLD);}
var q='';try{q=new URLSearchParams(location.search).get('popup')||'';}catch(_){}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function en(){return R.lang==='en'||R.getAttribute('data-lang')==='en';}
var T={
 pt:{t:'Gostaste? Subscreve.',s:'Recebe newsletters grátis e muito mais, por email.',l:'O teu email',ph:'nome@email.com',b:'Subscrever',x:'Fechar',av:'Recebe a newsletter por email',
     bad:'Esse email não parece certo.',wait:'A enviar…',ok:'Feito. Vais receber a próxima edição.',err:'Não deu para enviar. Tenta outra vez ou escreve para info@kandaia.ao.'},
 en:{t:'Liked this? Subscribe.',s:'Get free newsletters and more, by email.',l:'Your email',ph:'name@email.com',b:'Subscribe',x:'Close',av:'Get the newsletter by email',
     bad:'That email doesn\'t look right.',wait:'Sending…',ok:'Done. You\'ll get the next edition.',err:'Couldn\'t send. Try again or write to info@kandaia.ao.'}
};
var KM='M50.00 12.37C48.95 12.37 47.86 12.46 46.86 12.64C45.87 12.81 44.87 13.08 44.03 13.44C43.19 13.79 42.40 14.24 41.80 14.77C41.19 15.30 40.70 15.93 40.40 16.63C40.10 17.34 39.96 18.14 40.01 19.01C40.06 19.89 40.30 20.85 40.73 21.88C41.15 22.90 41.77 24.01 42.56 25.17C43.34 26.32 44.33 27.55 45.44 28.80C46.55 30.04 47.85 31.35 49.23 32.65C50.61 33.94 52.15 35.28 53.73 36.57C55.31 37.87 57.01 39.17 58.70 40.40C60.39 41.63 62.15 42.84 63.87 43.94C65.59 45.04 67.34 46.09 69.00 47.01C70.66 47.92 72.30 48.75 73.83 49.42C75.36 50.09 76.83 50.65 78.17 51.04C79.51 51.43 80.76 51.68 81.87 51.77C82.97 51.85 83.96 51.78 84.81 51.56C85.66 51.34 86.37 50.96 86.95 50.46C87.53 49.96 87.97 49.29 88.29 48.55C88.61 47.81 88.80 46.93 88.87 46.02C88.95 45.10 88.90 44.08 88.76 43.08C88.62 42.08 88.37 41.00 88.04 40.01C87.72 39.01 87.30 38.00 86.82 37.11C86.34 36.21 85.78 35.35 85.18 34.66C84.58 33.97 83.92 33.36 83.22 32.95C82.53 32.54 81.78 32.26 81.02 32.20C80.26 32.13 79.45 32.24 78.64 32.56C77.82 32.88 76.98 33.41 76.14 34.13C75.29 34.85 74.43 35.78 73.57 36.89C72.72 37.99 71.85 39.31 71.01 40.75C70.17 42.19 69.33 43.83 68.52 45.54C67.71 47.26 66.92 49.14 66.18 51.04C65.43 52.93 64.72 54.95 64.07 56.94C63.42 58.93 62.82 60.98 62.30 62.96C61.79 64.93 61.33 66.92 60.97 68.78C60.61 70.64 60.33 72.46 60.17 74.12C60.00 75.79 59.93 77.36 59.97 78.75C60.01 80.15 60.16 81.41 60.42 82.49C60.68 83.57 61.05 84.49 61.52 85.23C61.99 85.97 62.58 86.53 63.24 86.92C63.89 87.32 64.66 87.53 65.46 87.61C66.27 87.69 67.16 87.58 68.06 87.38C68.95 87.17 69.91 86.80 70.81 86.36C71.72 85.92 72.66 85.35 73.51 84.73C74.36 84.12 75.19 83.40 75.90 82.67C76.60 81.94 77.24 81.14 77.71 80.36C78.19 79.58 78.56 78.75 78.74 77.97C78.91 77.18 78.95 76.39 78.77 75.64C78.60 74.89 78.25 74.16 77.69 73.48C77.13 72.81 76.37 72.17 75.43 71.59C74.48 71.01 73.32 70.48 72.01 70.00C70.70 69.53 69.18 69.12 67.55 68.76C65.91 68.41 64.10 68.11 62.22 67.87C60.34 67.64 58.30 67.46 56.27 67.34C54.23 67.22 52.09 67.16 50.00 67.16C47.91 67.16 45.77 67.22 43.73 67.34C41.70 67.46 39.66 67.64 37.78 67.87C35.90 68.11 34.09 68.41 32.45 68.76C30.82 69.12 29.30 69.53 27.99 70.00C26.68 70.48 25.52 71.01 24.57 71.59C23.63 72.17 22.87 72.81 22.31 73.48C21.75 74.16 21.40 74.89 21.23 75.64C21.05 76.39 21.09 77.18 21.26 77.97C21.44 78.75 21.81 79.58 22.29 80.36C22.76 81.14 23.40 81.94 24.10 82.67C24.81 83.40 25.64 84.12 26.49 84.73C27.34 85.35 28.28 85.92 29.19 86.36C30.09 86.80 31.05 87.17 31.94 87.38C32.84 87.58 33.73 87.69 34.54 87.61C35.34 87.53 36.11 87.32 36.76 86.92C37.42 86.53 38.01 85.97 38.48 85.23C38.95 84.49 39.32 83.57 39.58 82.49C39.84 81.41 39.99 80.15 40.03 78.75C40.07 77.36 40.00 75.79 39.83 74.12C39.67 72.46 39.39 70.64 39.03 68.78C38.67 66.92 38.21 64.93 37.70 62.96C37.18 60.98 36.58 58.93 35.93 56.94C35.28 54.95 34.57 52.93 33.82 51.04C33.08 49.14 32.29 47.26 31.48 45.54C30.67 43.83 29.83 42.19 28.99 40.75C28.15 39.31 27.28 37.99 26.43 36.89C25.57 35.78 24.71 34.85 23.86 34.13C23.02 33.41 22.18 32.88 21.36 32.56C20.55 32.24 19.74 32.13 18.98 32.20C18.22 32.26 17.47 32.54 16.78 32.95C16.08 33.36 15.42 33.97 14.82 34.66C14.22 35.35 13.66 36.21 13.18 37.11C12.70 38.00 12.28 39.01 11.96 40.01C11.63 41.00 11.38 42.08 11.24 43.08C11.10 44.08 11.05 45.10 11.13 46.02C11.20 46.93 11.39 47.81 11.71 48.55C12.03 49.29 12.47 49.96 13.05 50.46C13.63 50.96 14.34 51.34 15.19 51.56C16.04 51.78 17.03 51.85 18.13 51.77C19.24 51.68 20.49 51.43 21.83 51.04C23.17 50.65 24.64 50.09 26.17 49.42C27.70 48.75 29.34 47.92 31.00 47.01C32.66 46.09 34.41 45.04 36.13 43.94C37.85 42.84 39.61 41.63 41.30 40.40C42.99 39.17 44.69 37.87 46.27 36.57C47.85 35.28 49.39 33.94 50.77 32.65C52.15 31.35 53.45 30.04 54.56 28.80C55.67 27.55 56.66 26.32 57.44 25.17C58.23 24.01 58.85 22.90 59.27 21.88C59.70 20.85 59.94 19.89 59.99 19.01C60.04 18.14 59.90 17.34 59.60 16.63C59.30 15.93 58.81 15.30 58.20 14.77C57.60 14.24 56.81 13.79 55.97 13.44C55.13 13.08 54.13 12.81 53.14 12.64C52.14 12.46 51.05 12.37 50.00 12.37Z';
var SVG='<svg viewBox="-14 -8 128 128" aria-hidden="true" focusable="false"><defs><path id="kp-m" d="'+KM+'"/></defs>'+
 '<g class="i iy"><use href="#kp-m" fill="none" stroke="#ffe800" stroke-width="15" stroke-linejoin="round"/></g>'+
 '<g class="i ip"><use href="#kp-m" fill="none" stroke="#ff48b0" stroke-width="10" stroke-linejoin="round"/><circle cx="50" cy="52.37" r="8" fill="#ff48b0"/></g>'+
 '<g class="i ib"><use href="#kp-m" fill="none" stroke="#0078bf" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="52.37" r="6.6" fill="#0078bf"/></g></svg>';
var NAVY='#12204a',CSS=
':host{all:initial;position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));z-index:2147483000;pointer-events:none;'+
 'font-family:var(--sans,"Kanda Sans",KInter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif);color:'+NAVY+';-webkit-text-size-adjust:100%}'+
'*{box-sizing:border-box}'+
'.av{pointer-events:auto;position:relative;display:block;width:60px;height:60px;padding:0;margin:0 0 0 auto;border:0;background:none;cursor:pointer;border-radius:50%;'+
 'transform:translate(130%,8px) rotate(28deg);opacity:0;transition:transform .7s cubic-bezier(.34,1.56,.64,1),opacity .25s ease}'+
'.av svg{width:100%;height:100%;display:block;overflow:visible}'+
'.av:focus-visible{outline:3px solid #0078bf;outline-offset:3px}'+
':host(.peek) .av{transform:translate(0,0) rotate(-6deg);opacity:1}'+
':host(.open) .av{transform:translate(0,0) rotate(0)}'+
':host(.peek) .av svg{animation:bob 2.6s ease-in-out .8s infinite}'+
':host(.open) .iy{animation:my 1.8s ease-in-out infinite}:host(.open) .ip{animation:mp 1.8s ease-in-out infinite}'+
'@keyframes bob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(-4deg)}}'+
'@keyframes my{0%,100%{transform:translate(3px,2.5px)}50%{transform:translate(5px,1px)}}'+
'@keyframes mp{0%,100%{transform:translate(-2.5px,-2px)}50%{transform:translate(-4px,-.5px)}}'+
'.iy{transform:translate(3px,2.5px)}.ip{transform:translate(-2.5px,-2px)}'+
'.bub{pointer-events:auto;position:absolute;right:4px;bottom:74px;width:min(312px,calc(100vw - 24px));padding:14px 14px 12px;'+
 'background:#f4eedf;background-image:radial-gradient(rgba(255,72,176,.13) 1px,transparent 1.3px);background-size:6px 6px;'+
 'border:2px solid '+NAVY+';box-shadow:5px 5px 0 #ff48b0,-2px -2px 0 #ffe800;'+
 'transform-origin:92% 100%;transform:scale(.4) translateY(14px);opacity:0;visibility:hidden;'+
 'transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .18s ease,visibility 0s linear .45s}'+
'.bub:after,.bub:before{content:"";position:absolute;right:20px;width:0;height:0;border:10px solid transparent;border-bottom:0}'+
'.bub:before{bottom:-12px;border-top:12px solid '+NAVY+'}.bub:after{bottom:-8.5px;right:22px;border-width:8px;border-bottom:0;border-top:9px solid #f4eedf}'+
':host(.open) .bub{transform:none;opacity:1;visibility:visible;transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .18s ease,visibility 0s}'+
'.k{margin:0 30px 6px 0;font:700 10.5px/1.2 var(--mono,"Kanda Mono",KMono,ui-monospace,Menlo,monospace);letter-spacing:.08em;text-transform:uppercase;color:#0078bf}'+
'h2{margin:0 26px 4px 0;font-size:19px;line-height:1.18;font-weight:800;letter-spacing:-.01em;color:'+NAVY+'}'+
'h2 mark{background:linear-gradient(transparent 52%,#ffe800 52%);color:inherit;padding:0 1px}'+
'.s{margin:0 0 10px;font-size:14px;line-height:1.35;color:#33406a}'+
'.row{display:flex;gap:6px}'+
'input{flex:1;min-width:0;width:100%;height:42px;padding:0 10px;border:2px solid '+NAVY+';border-radius:0;background:#fffaf0;color:'+NAVY+';font-size:16px;line-height:1;font-family:inherit;-webkit-appearance:none;appearance:none}'+
'input::placeholder{color:#6b7594}input:focus{outline:none;border-color:#0078bf;box-shadow:0 0 0 2px rgba(0,120,191,.25)}input[aria-invalid=true]{border-color:#ff48b0}'+
'.go{flex:none;height:42px;padding:0 13px;border:2px solid '+NAVY+';border-radius:0;background:#ffe800;color:'+NAVY+';font-size:15px;font-weight:800;line-height:1;font-family:inherit;cursor:pointer;box-shadow:3px 3px 0 '+NAVY+';transition:transform .08s,box-shadow .08s}'+
'.go:hover{background:#fff27a}.go:active{transform:translate(2px,2px);box-shadow:1px 1px 0 '+NAVY+'}.go:disabled{opacity:.6;cursor:wait}'+
'.go:focus-visible,.x:focus-visible{outline:3px solid #0078bf;outline-offset:2px}'+
'.x{position:absolute;top:6px;right:6px;width:32px;height:32px;padding:0;border:0;background:transparent;color:'+NAVY+';font:400 24px/1 system-ui,sans-serif;cursor:pointer}.x:hover{background:#ffe800}'+
'.msg{margin:7px 0 0;font-size:13px;line-height:1.3;font-weight:600}.msg:empty{display:none}.msg.err{color:#c2187a}'+
'.done{display:none;margin:2px 30px 2px 0;font-size:18px;line-height:1.25;font-weight:800}.done mark{background:linear-gradient(transparent 52%,#ffe800 52%);color:inherit}'+
':host(.ok) form,:host(.ok) .s,:host(.ok) h2{display:none}:host(.ok) .done{display:block}'+
'.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'+
'.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}'+
'@media (min-width:761px){:host{right:18px;bottom:22px}.av{width:72px;height:72px}.bub{right:86px;bottom:6px;width:330px;transform-origin:100% 80%;transform:scale(.4) translateX(20px)}'+
 '.bub:before{right:-12px;bottom:22px;border:10px solid transparent;border-right:0;border-left:12px solid '+NAVY+'}.bub:after{right:-8.5px;bottom:24px;border:8px solid transparent;border-right:0;border-left:9px solid #f4eedf}}'+
'@media (prefers-reduced-motion:reduce){.av,.bub,:host(.open) .bub{transition:opacity .15s linear!important}.av,.bub{transform:none!important}'+
 ':host(.peek) .av svg,:host(.open) .iy,:host(.open) .ip{animation:none!important}}';
var host,root,bub,form,inp,msg,go,lastFocus,state='idle',logo=null,hideT=0,peekT=0;
function L(){return T[en()?'en':'pt'];}
function text(){if(!root)return;var t=L();
 root.querySelector('h2').innerHTML=t.t.replace(/ ([^ ]+)$/,' <mark>$1</mark>');
 root.querySelector('.s').textContent=t.s;root.querySelector('.lbl').textContent=t.l;inp.placeholder=t.ph;go.textContent=t.b;
 root.querySelector('.x').setAttribute('aria-label',t.x);root.querySelector('.av').setAttribute('aria-label',t.av);
 root.querySelector('.done').innerHTML='<mark>'+t.ok.split('. ')[0]+'.</mark> '+t.ok.split('. ').slice(1).join('. ');
 if(msg.dataset.k)msg.textContent=t[msg.dataset.k];}
function build(){
 host=D.createElement('div');host.id='kanda-signup';host.setAttribute('data-nosnippet','');
 root=host.attachShadow({mode:'open'});
 root.innerHTML='<style>'+CSS+'</style>'+
 '<section class="bub" role="dialog" aria-modal="false" aria-labelledby="kp-t" aria-describedby="kp-d">'+
 '<button type="button" class="x">×</button><p class="k" aria-hidden="true">Kanda IA · Newsletter</p>'+
 '<h2 id="kp-t"></h2><p class="s" id="kp-d"></p><p class="done" role="status" aria-live="polite"></p>'+
 '<form novalidate><label class="sr lbl" for="kp-e"></label><div class="row">'+
 '<input id="kp-e" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" required maxlength="120">'+
 '<button class="go" type="submit"></button></div>'+
 '<div class="hp" aria-hidden="true"><input name="_honey" tabindex="-1" autocomplete="off"></div>'+
 '<p class="msg" role="status" aria-live="polite"></p></form></section>'+
 '<button type="button" class="av" aria-expanded="false">'+SVG+'</button>';
 D.body.appendChild(host);
 bub=root.querySelector('.bub');form=root.querySelector('form');inp=root.getElementById('kp-e');msg=root.querySelector('.msg');go=root.querySelector('.go');
 text();
 new MutationObserver(text).observe(R,{attributes:true,attributeFilter:['lang','data-lang']});
 root.querySelector('.x').addEventListener('click',function(){dismiss();});
 root.querySelector('.av').addEventListener('click',function(){state==='open'?dismiss():show(true);});
 D.addEventListener('keydown',function(e){if(e.key==='Escape'&&state==='open')dismiss();});
 D.addEventListener('click',function(e){if(state==='open'&&e.composedPath().indexOf(host)<0&&!(e.target.closest&&e.target.closest('[data-signup-open]')))dismiss();});
 form.addEventListener('submit',submit);
}
function say(k,cls){msg.dataset.k=k||'';msg.textContent=k?L()[k]:'';msg.className='msg '+(cls||'');}
function hideLogo(on){ /* the page's living avatar "moves" down here while the bubble is open */
 logo=logo||D.querySelector('#logo.logo3,.kanda-av-auto');if(!logo)return;
 try{if(window.KandaAvatar&&KandaAvatar.api){on?KandaAvatar.disable():KandaAvatar.enable();}}catch(_){}
 logo.style.transition='opacity .3s';logo.style.opacity=on?'0':'';logo.style.pointerEvents=on?'none':'';}
function show(manual){
 if(!host)build();if(state==='open')return;
 clearTimeout(hideT);clearTimeout(peekT);lastFocus=D.activeElement;host.style.display='';hideLogo(true);
 var av=root.querySelector('.av');av.setAttribute('aria-expanded','true');
 requestAnimationFrame(function(){requestAnimationFrame(function(){host.classList.add('peek');
  setTimeout(function(){host.classList.add('open');state='open';if(manual)inp.focus({preventScroll:true});},RM?0:(manual?250:650));});});
 state='opening';
}
function dismiss(){ if(!host||state==='closed')return;
 if(!host.classList.contains('ok'))ls(K_DIS,String(Date.now()));
 var hadFocus=!!root.activeElement;state='closed';host.classList.remove('open');root.querySelector('.av').setAttribute('aria-expanded','false');
 peekT=setTimeout(function(){host.classList.remove('peek');},RM?0:200);
 hideT=setTimeout(function(){host.style.display='none';hideLogo(false);},RM?150:900);
 if(hadFocus&&lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});}
function submit(e){
 e.preventDefault();var v=inp.value.trim(),hp=form.querySelector('[name=_honey]').value;
 if(!EMAIL.test(v)){inp.setAttribute('aria-invalid','true');say('bad','err');inp.focus();return;}
 inp.setAttribute('aria-invalid','false');
 if(hp){done();return;}
 go.disabled=true;say('wait');
 /* same fields the old site form sent (signups_sync.py reads nome/email/pagina; subject must match "inscri|comunidade") */
 var data={nome:'',email:v,pagina:location.pathname,_subject:SUBJ,_template:'table',_captcha:'false',_honey:''};
 function post(){return fetch(ENDPOINT,{method:'POST',mode:'cors',referrerPolicy:'no-referrer-when-downgrade',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
  .then(function(r){return r.text().then(function(t){var d;try{d=JSON.parse(t);}catch(_){d=null;}if(!r.ok||!d||d.success===false||d.success==='false')throw new Error('formsubmit '+r.status);return d;});});}
 function classic(){var n='kp-f'+Date.now(),f=D.createElement('iframe');f.name=n;f.style.display='none';f.setAttribute('aria-hidden','true');D.body.appendChild(f);
  var fm=D.createElement('form');fm.method='POST';fm.action=ENDPOINT.replace('/ajax/','/');fm.target=n;fm.style.display='none';
  data._next=location.origin+'/404.html';for(var k in data){var i=D.createElement('input');i.type='hidden';i.name=k;i.value=data[k];fm.appendChild(i);}
  D.body.appendChild(fm);fm.submit();setTimeout(function(){fm.remove();f.remove();},20000);}
 post().catch(function(){return new Promise(function(r){setTimeout(r,1200);}).then(post);})
 .then(done,function(){try{classic();done();}catch(_){say('err','err');go.disabled=false;}});
}
function done(){ls(K_DONE,'1');go.disabled=false;say('');form.reset();host.classList.add('ok');
 setTimeout(function(){if(state==='open')dismiss();},7000);}
window.KandaSignup={open:function(){show(true);},close:function(){dismiss();}};
D.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-signup-open]');if(a){e.preventDefault();state==='closed'&&(state='idle');show(true);}});
function arm(){
 if(q==='off')return;
 if(location.hash==='#seguir'){setTimeout(function(){show(true);},400);return;}
 if(q==='now'){setTimeout(function(){show(false);},700);return;}
 if(blocked())return;
 var t0=Date.now(),fired=false;
 function fire(){if(fired)return;fired=true;clearTimeout(tm);removeEventListener('scroll',sc);show(false);}
 var tm=setTimeout(fire,DELAY);
 function sc(){var m=R.scrollHeight-R.clientHeight;if(m>0&&scrollY/m>=SCROLL){if(Date.now()-t0<MINWAIT){clearTimeout(tm);tm=setTimeout(fire,MINWAIT-(Date.now()-t0));}else fire();}}
 addEventListener('scroll',sc,{passive:true});
}
if(D.readyState==='complete')arm();else addEventListener('load',arm);
})();
