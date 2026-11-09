/* fx/culprit.js — Culprit mode. After you solve a case, replay it as the culprit: spend the night's hours covering your tracks.
   Whatever you leave behind is what the detective finds. Load after ending.js and lib.js. Best result per case is saved. */
(function(){
"use strict";
var E=CFLib.esc,RES=[["Caught","🚔"],["Framed an innocent","🎭"],["Got away","🕶️"],["Perfect crime","💎"]];
function g(i){return document.getElementById(i)}
function hash(t){var h=7;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%233280;return h||1}
function best(c){try{var v=JSON.parse(localStorage.getItem("cf2_culp_"+c.id));return v==null?-1:v}catch(e){return -1}}
function save(c,v){try{if(v>best(c))localStorage.setItem("cf2_culp_"+c.id,JSON.stringify(v))}catch(e){}}
function close(){var o=document.querySelector(".culp");if(o)o.remove()}
/* the night's plan: one card per proof flag. Budget = just enough hours to erase all but (need-1) clues, plus one spare */
function plan(c){var cu=CFLib.culprit(c);if(!cu)return null;var items=[];
 cu.flags.forEach(function(f){var cl=CFLib.clue(c,f);if(cl){var sl=/slip$/.test(f);items.push({f:f,note:cl.note,slip:sl,cost:sl?1:1+hash(f)%2})}});
 if(items.length<2)return null;
 var costs=items.map(function(x){return x.cost}).sort(function(a,b){return a-b}),k=Math.max(1,items.length-cu.need+1),sus=CFLib.suspects(c,cu.name);
 return {cu:cu,items:items,T:costs.slice(0,k).reduce(function(a,b){return a+b},0)+1,dec:sus.length?sus[hash(c.id)%sus.length]:null}}

function open(idx){var c=CF.C[idx],p=plan(c);if(!p)return;close();
 var ch={},el=document.createElement("div"),phase="plan",res=null,cf=CFLib.sents((c.S.win_master||c.S.win||{t:""}).t),
  admit=cf.filter(function(s){return /admit|confess/i.test(s)})[0]||cf[1]||cf[0]||"";
 el.className="culp";el.setAttribute("role","dialog");el.setAttribute("aria-label","Culprit mode");
 function reset(){p.items.forEach(function(x){ch[x.f]="leave"})}
 function used(){var u=0;p.items.forEach(function(x){var a=ch[x.f];u+=a=="destroy"?x.cost:a=="frame"?1:0});return u}
 function dawn(){var found=0,framed=0,rows="";
  p.items.forEach(function(x,k){var a=ch[x.f],cls=a=="destroy"?"gone":a=="frame"?"frame":"found";if(a=="leave")found++;if(a=="frame")framed++;
   rows+='<li class="'+cls+'" style="--i:'+k+'"><span>'+(cls=="gone"?"GONE":cls=="frame"?"POINTS AT "+E(String(p.dec).toUpperCase()):"FOUND")+'</span>'+E(x.note)+'</li>'});
  var r=found>=p.cu.need?0:framed>=2?1:found==0&&framed==0?3:2;save(c,r);res={r:r,found:found,rows:rows};phase="end";render()}
 function render(){var left=p.T-used(),i,pips="",b;
  for(i=0;i<p.T;i++)pips+='<i class="'+(i<left?"on":"")+'"></i>';
  if(phase=="plan"){
   el.innerHTML='<div class="cm-wrap"><header><b>🕶️ Culprit mode · '+E(c.title)+'</b><button data-a="x" aria-label="Close">✕</button></header>'+
    '<p>You are <b>'+E(p.cu.name)+'</b>. '+E(c.place)+'. The detective arrives at dawn.</p>'+
    (admit?'<p class="mute">If you are caught, this comes out: <i>“'+E(admit)+'”</i></p>':"")+
    '<p class="mute">Each card is a clue the detective will find unless you act. Destroy it, or frame someone else for it. Frame two and an innocent person is arrested.</p>'+
    '<div class="cm-time"><span>⏱ Hours left: <b>'+left+'</b> of '+p.T+'</span><span class="cm-pips" aria-hidden="true">'+pips+'</span></div><div class="cm-cards">'+
    p.items.map(function(x,k){var a=ch[x.f],avail=left+(a=="destroy"?x.cost:a=="frame"?1:0);
     return '<div class="cm-card"><p class="cm-note">'+(x.slip?"🗣️ ":"🔎 ")+E(x.note)+'</p><div class="cm-opts">'+
      '<button data-a="leave" data-i="'+k+'" class="'+(a=="leave"?"on":"")+'">'+(x.slip?"Chat freely":"Leave it")+'</button>'+
      '<button data-a="destroy" data-i="'+k+'" class="'+(a=="destroy"?"on":"")+'"'+(avail>=x.cost?"":" disabled")+'>'+(x.slip?"Rehearse your answers":"Destroy it")+' ⏱'+x.cost+'</button>'+
      (!x.slip&&p.dec?'<button data-a="frame" data-i="'+k+'" class="'+(a=="frame"?"on":"")+'"'+(avail>=1?"":" disabled")+'>Frame '+E(p.dec)+' ⏱1</button>':"")+'</div></div>'}).join("")+
    '</div><div class="cm-foot"><button class="choice" data-a="dawn">Dawn breaks ▶</button></div></div>'}
  else{b=best(c);
   el.innerHTML='<div class="cm-wrap"><header><b>🌅 Dawn · '+E(c.title)+'</b><button data-a="x" aria-label="Close">✕</button></header><p>Inspector Dhawan walks the scene…</p><ol class="cm-reveal">'+res.rows+'</ol>'+
    '<div class="cm-verdict r'+res.r+'" style="--i:'+p.items.length+'"><b>'+RES[res.r][1]+' '+RES[res.r][0]+'</b><p>'+[
     'Inspector Dhawan fans the evidence across the table. “'+res.found+' loose thread'+(res.found==1?"":"s")+', '+E(p.cu.name)+'. That is plenty.” The case closes against you.',
     'The trail you laid leads to '+E(String(p.dec))+'. By noon they are in handcuffs and you are home for breakfast. Someone innocent pays for your night’s work.',
     'The detective has only scraps. “Not enough to charge anyone,” the file concludes. You walk free, but you will hear footsteps for years.',
     'Nothing. Not a thread. The detective leaves empty-handed and the file goes to the cold cases.'][res.r]+'</p></div>'+
    '<p class="mute">Best result: '+RES[b][1]+' '+RES[b][0]+'</p><div class="cm-foot"><button class="choice" data-a="again">Try again</button><button class="choice" data-a="x">Close</button></div></div>'}}
 el.addEventListener("click",function(ev){var b=ev.target.closest("button");if(!b||b.disabled)return;var a=b.dataset.a,i=b.dataset.i;
  if(a=="x")return close();
  if(a=="again"){reset();phase="plan";return render()}
  if(a=="dawn")return dawn();
  if(i!=null){ch[p.items[+i].f]=a;render()}});
 reset();document.body.appendChild(el);render()}

document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-cm]");if(b){e.preventDefault();open(+b.dataset.cm)}});
document.addEventListener("cf:case",close);
document.addEventListener("cf:ending",function(e){if(e.detail.sc.k!="win")return;var cs=CF.state().cs,i=CF.C.indexOf(cs);if(i<0||!plan(cs))return;
 var host=document.querySelector(".cine .cbtn")||document.querySelector("#sc .ch");
 if(host)host.insertAdjacentHTML("afterbegin",'<button class="choice" data-cm="'+i+'">🕶️ Replay as the culprit</button>')});
document.addEventListener("cf:home",function(){close();var old=g("cmstrip"),done=[];if(old)old.remove();
 CF.C.forEach(function(c,i){if(CF.wins(c)&&plan(c))done.push([c,i])});if(!done.length)return;
 var s=document.createElement("section");s.id="cmstrip";s.className="cm-strip";
 s.innerHTML='<h2>🕶️ Culprit mode</h2><p class="mute">Replay a solved case from the other side of the table.</p><div class="cm-list">'+done.map(function(d){var b=best(d[0]);
  return '<button data-cm="'+d[1]+'"><span>'+d[0].icon+'</span><b>'+E(d[0].title)+'</b><small>'+(b<0?"Not tried":RES[b][1]+" "+RES[b][0])+'</small></button>'}).join("")+'</div>';
 g("app").appendChild(s)});
})();
