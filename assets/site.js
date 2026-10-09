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
let saved=null;try{saved=localStorage.getItem('kanda-lang');}catch(_){}
setLanguage(saved==='en'?'en':'pt-AO');
})();
