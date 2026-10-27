(function(){
'use strict';
const root=document.documentElement;
const pt=document.getElementById('b-pt'),en=document.getElementById('b-en');
const output=document.getElementById('prompt-result');
const fields=['prompt-goal','prompt-context','prompt-format'].map(id=>document.getElementById(id));
const status=document.getElementById('copy-status');
const hasBuilder=Boolean(output&&status&&fields.every(Boolean));
let touched=false;
function english(){return root.lang==='en';}
function updatePrompt(){
 if(!hasBuilder)return;
 const labels=english()?['Task','Context','Format']:['Tarefa','Contexto','Formato'];
 const reminder=english()?'Do not invent facts. If information is missing, ask. Tell me what I should verify.':'Não inventes factos. Se faltar informação, pergunta. Indica o que devo verificar.';
 const fallback=english()?'[add information]':'[acrescenta informação]';
 output.textContent=fields.map((f,i)=>labels[i]+': '+(f.value.trim()||fallback)).join('\n\n')+'\n\n'+reminder;
 status.textContent='';
}
function setLanguage(lang){
 root.lang=lang;
 if(pt)pt.setAttribute('aria-pressed',String(lang!=='en'));
 if(en)en.setAttribute('aria-pressed',String(lang==='en'));
 const nav=document.querySelector('nav');
 if(nav)nav.setAttribute('aria-label',lang==='en'?'Main navigation':'Navegação principal');
 const title=document.body.dataset[lang==='en'?'titleEn':'titlePt'];
 if(title)document.title=title;
 if(hasBuilder&&!touched)fields.forEach(f=>{f.value=f.dataset[lang==='en'?'en':'pt'];});
 updatePrompt();
 try{localStorage.setItem('kanda-lang',lang);}catch(_){}
}
if(pt)pt.addEventListener('click',()=>setLanguage('pt-AO'));
if(en)en.addEventListener('click',()=>setLanguage('en'));
if(hasBuilder){
 fields.forEach(f=>f.addEventListener('input',()=>{touched=true;updatePrompt();}));
 document.getElementById('copy-prompt').addEventListener('click',async()=>{
  try{
   if(!navigator.clipboard)throw new Error('Clipboard unavailable');
   await navigator.clipboard.writeText(output.textContent);
   status.textContent=english()?'Copied. Paste it into your AI tool and review the result.':'Copiado. Cola na tua ferramenta de IA e revê o resultado.';
  }catch(_){
   const selection=window.getSelection(),range=document.createRange();
   range.selectNodeContents(output);
   if(selection){selection.removeAllRanges();selection.addRange(range);}
   output.focus();
   status.textContent=english()?'Text selected. Use Copy or Ctrl/Cmd+C.':'Texto selecionado. Usa Copiar ou Ctrl/Cmd+C.';
  }
 });
}
if(!document.querySelector('.k-bg')){
 const bg=document.createElement('div');bg.className='k-bg';bg.setAttribute('aria-hidden','true');
 bg.innerHTML='<div class="k-city">'+[1,2,3,4,5,6,7,8].map(i=>'<div class="b b'+i+'"></div>').join('')+'</div><div class="k-floor"></div>';
 document.body.insertBefore(bg,document.body.firstChild);
}
const topWrap=document.querySelector('header.top .wrap')||document.querySelector('header.top');
if(topWrap&&!document.querySelector('.k-chrome')){
 const c=document.createElement('div');c.className='k-chrome';c.setAttribute('aria-hidden','true');
 const seg=(location.pathname.split('/').filter(Boolean)[0]||'home').toUpperCase();
 c.innerHTML='<span>KANDA IA — '+seg+'</span><span class="k-live">● ONLINE</span>';
 topWrap.appendChild(c);
}
let saved=null;try{saved=localStorage.getItem('kanda-lang');}catch(_){}
setLanguage(saved==='en'?'en':'pt-AO');
})();

/* Luanda weather strip — ambient, fail silent */
(function(){
 const hdr=document.querySelector('header.top');
 if(!hdr||document.querySelector('.wx-strip'))return;
 const el=document.createElement('p');
 el.className='wx-strip';
 el.setAttribute('role','status');
 el.setAttribute('title','Open-Meteo');
 el.hidden=true;
 hdr.insertBefore(el,hdr.firstChild);
 const WMO={0:['céu limpo','clear sky'],1:['principalmente limpo','mainly clear'],2:['parcialmente nublado','partly cloudy'],3:['nublado','overcast'],45:['nevoeiro','fog'],48:['nevoeiro com geada','depositing rime fog'],51:['garoa fraca','light drizzle'],61:['chuva fraca','slight rain'],63:['chuva moderada','moderate rain'],65:['chuva forte','heavy rain'],80:['aguaceiros fracos','slight rain showers'],95:['trovoada','thunderstorm']};
 const url='https://api.open-meteo.com/v1/forecast?latitude=-8.84&longitude=13.23&current=temperature_2m,weather_code&timezone=Africa%2FLuanda';
 fetch(url).then(r=>{if(!r.ok)throw new Error('wx');return r.json()}).then(d=>{
  const cur=(d&&d.current)||{};
  const temp=cur.temperature_2m;
  if(temp==null)return;
  const code=Number(cur.weather_code||0);
  const pair=WMO[code]||['código '+code,'code '+code];
  const ptT=String(temp).replace('.',',');
  const enT=String(temp);
  el.innerHTML='<span class="pt">Luanda · '+ptT+'°C · '+pair[0]+'</span><span class="en">Luanda · '+enT+'°C · '+pair[1]+'</span><span class="wx-src" aria-hidden="true"> · Open-Meteo</span>';
  el.hidden=false;
  el.classList.add('is-on');
 }).catch(function(){/* fail silent */});
})();
