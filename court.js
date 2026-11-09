/* fx/court.js — Courtroom finale. A wrong accusation or "Insufficient Proof" opens a cross-examination of the real culprit instead of an instant fail.
   Press probes a statement; Present shows a notebook clue. Break enough statements to win a "Verdict: Guilty" ending.
   Needs engine edits: cancelable cf:before event + CF.go. Load after lib.js and trial-data.js. */
(function(){
"use strict";
var E=CFLib.esc,by=null;
function hash(t){var h=7;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%233280;return h||1}
function shuffle(a,s){var r=function(){s=(s*9301+49297)%233280;return s/233280},i,j,t;a=a.slice();for(i=a.length-1;i>0;i--){j=Math.floor(r()*(i+1));t=a[i];a[i]=a[j];a[j]=t}return a}
function inject(){(window.CASES||[]).forEach(function(c){if(!c.S.trial_win&&CFLib.culprit(c))c.S.trial_win={e:"Verdict: Guilty",k:"win",i:"⚖️",t:"The court convicts."}})}
function closeAll(){var c=document.querySelector(".court");if(c)c.remove()}
/* a trial is offered only when it can be won: proofs held, plus the culprit's slip if you never caught it */
function spec(st){var cs=st.cs,c=CFLib.culprit(cs);if(!c)return null;
 var T=(window.CFTrial||{})[cs.id]||{},bait=null,held;
 c.flags.forEach(function(f){if(!bait&&/slip$/.test(f))bait=f});
 held=c.flags.filter(function(f){return st.fl[f]}).length;
 if(held+(bait&&!st.fl[bait]?1:0)<c.need)return null;
 return {c:c,bait:bait,need:c.need,items:shuffle(c.flags.map(function(f){return {f:f,t:T[f]||"I had nothing to do with this. You have nothing that says otherwise.",done:0}}),hash(cs.id))}}

function open(sp,id,sc){
 var st=CF.state(),cs=st.cs,rec=st.notes.slice(),own=CFLib.who(cs,sp.c.name),el=document.createElement("div"),
  n=sp.items.length,hp=3,got=0,ix=0,mood="neutral",msg="",phase="intro",rOpen=false,busy=false;
 el.className="court";el.setAttribute("role","dialog");el.setAttribute("aria-label","Courtroom");
 function held(){var u=[];rec.forEach(function(t){CFLib.flagsOf(cs,t).forEach(function(f){if(u.indexOf(f)<0)u.push(f)})});return u}
 function later(fn,ms){busy=true;setTimeout(function(){busy=false;fn()},ms)}
 function shake(){el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake")}
 function objection(){CFLib.snd("thud");shake();var q=document.createElement("div");q.className="ct-obj";q.textContent="OBJECTION!";el.appendChild(q);setTimeout(function(){q.remove()},950)}
 function judge(){return sc.k=="weak"?"“The prosecution’s case is thin, counsel. I will allow one cross-examination. Do not waste it.”":"“You named the wrong person, counsel. The court recalls the true witness. You have one chance.”"}
 function render(){var s=sp.items[ix],i,h="",list="",rl="";
  for(i=0;i<3;i++)h+='<i class="'+(i<hp?"on":"")+'">♥</i>';
  sp.items.forEach(function(x,k){list+='<li class="'+(x.done?"ok":k==ix?"cur":"")+'"><button data-a="goto" data-k="'+k+'">'+(x.done?"✓ ":(k+1)+". ")+E(x.t.length>46?x.t.slice(0,44)+"…":x.t)+'</button></li>'});
  rec.forEach(function(t,k){rl+='<button class="ct-clue" data-k="'+k+'">'+E(t)+'</button>'});
  el.innerHTML='<div class="ct-room"><header class="ct-top"><b>⚖️ The People v. '+E(sp.c.name)+'</b><span class="ct-hearts" role="img" aria-label="Credibility '+hp+' of 3">'+h+'</span><button class="ct-skip" data-a="skip">Accept the verdict</button></header>'+
  (phase=="intro"?
   '<div class="ct-intro"><div class="ct-gavel" aria-hidden="true">🔨</div><h2>Court is in session</h2><p>'+judge()+'</p><p class="mute">Break at least '+sp.need+' of '+n+' statements with a clue from your notebook. <b>Press</b> probes a statement, <b>Present</b> objects with a clue. Three wrong objections and the case is dismissed.</p><button class="choice" data-a="begin">Begin cross-examination</button></div>':
   '<div class="ct-main"><div class="ct-stand">'+CFFace.html(own,mood,cs,false)+'</div><div class="ct-box"><small>Statement '+(ix+1)+' of '+n+' · '+got+' of '+sp.need+' contradictions proven</small><p class="ct-line'+(s.done?" done":"")+'">“'+E(s.t)+'”</p><p class="ct-msg" aria-live="polite">'+E(msg)+'</p><div class="ct-btns"><button data-a="prev" aria-label="Previous statement">◀</button><button data-a="press">Press</button><button data-a="present">Present</button><button data-a="next" aria-label="Next statement">▶</button><button data-a="rest">Rest the case</button></div></div></div><ol class="ct-list">'+list+'</ol>'+
   (rOpen?'<div class="ct-rec"><h3>Court Record</h3><div class="ct-recs">'+(rl||'<p class="mute">Your notebook is empty.</p>')+'</div><button data-a="close">Close</button></div>':""))+'</div>'}
 function press(){var s=sp.items[ix],f=held(),c;
  if(s.done)msg="You already broke this statement.";
  else if(s.f===sp.bait&&f.indexOf(s.f)<0&&(c=CFLib.clue(cs,s.f))){rec.push(c.note);CFLib.snd("chime");mood="nervous";msg="The witness stumbles: “I only meant—”. New in your Court Record: “"+c.note+"”"}
  else if(f.indexOf(s.f)>=0){mood="nervous";CFLib.snd("tick");msg="The witness shifts. Something in your Court Record does not fit this statement."}
  else{mood="smug";msg="The witness stays calm. Nothing in your record challenges this."}
  render()}
 function present(k){var note=rec[k],s=sp.items[ix],j,nx=ix;rOpen=false;
  if(!note)return render();
  if(s.done){msg="You already broke this statement.";return render()}
  if(CFLib.flagsOf(cs,note).indexOf(s.f)>=0){s.done=1;got++;mood="angry";msg="Objection sustained. “"+note+"” contradicts the testimony.";render();objection();
   if(got>=sp.need)return later(verdict,1500);
   for(j=1;j<=n;j++)if(!sp.items[(ix+j)%n].done){nx=(ix+j)%n;break}
   return later(function(){ix=nx;mood="neutral";msg="";render()},1300)}
  hp--;mood="smug";msg="Overruled. That does not contradict this testimony.";CFLib.snd("buzz");render();shake();
  if(hp<=0)later(verdict,900)}
 function verdict(){busy=true;var win=got>=sp.need;CFLib.snd("gavel");
  el.insertAdjacentHTML("beforeend",'<div class="ct-stamp '+(win?"ok":"no")+'">'+(win?"GUILTY":"CASE DISMISSED")+'</div>');
  setTimeout(function(){end(win?"win":"lose")},1700)}
 function end(r){el.remove();
  if(r=="win"){if(!cs.S.trial_win)cs.S.trial_win={e:"Verdict: Guilty",k:"win",i:"⚖️",t:""};
   cs.S.trial_win.t="Under cross-examination "+sp.c.name+"’s story collapses, statement by statement. The judge convicts, and the case closes the hard way.";CF.go("trial_win")}
  else{by=id;CF.go(id);by=null}}
 el.addEventListener("click",function(ev){var b=ev.target.closest("button");if(!b||busy)return;var a=b.dataset.a,k=b.dataset.k;
  if(a=="skip")return end("lose");
  if(a=="begin"){phase="play";return render()}
  if(a=="goto"){ix=+k;msg="";mood="neutral";return render()}
  if(a=="prev"||a=="next"){ix=(ix+(a=="next"?1:n-1))%n;msg="";mood="neutral";return render()}
  if(a=="press")return press();
  if(a=="present"){rOpen=true;return render()}
  if(a=="close"){rOpen=false;return render()}
  if(a=="rest")return verdict();
  if(!a&&k!=null)present(+k)});
 document.body.appendChild(el);render()}

inject();
document.addEventListener("cf:home",function(){inject();closeAll()});
document.addEventListener("cf:case",closeAll);
document.addEventListener("cf:before",function(e){var id=e.detail.id,sc=e.detail.sc;
 if(!sc.e||id===by||id==="timeout"||sc.s||!(sc.k=="weak"||sc.k=="fail"))return;
 var sp=spec(CF.state());if(!sp)return;e.preventDefault();open(sp,id,sc)});
})();
