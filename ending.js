/* fx/ending.js — full-screen cinematic ending: art backdrop, staggered lines, unique stamp per ending type */
(function(){
"use strict";
var LBL={master:["MASTER DETECTIVE","★★★★★"],win:["CASE CLOSED",""],secret:["SECRET ENDING","★"],weak:["NO CONVICTION",""],fail:["WRONG CALL",""],time:["TIME’S UP",""]};
document.body.classList.add("cinematic");
function g(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function sents(t){var s=t.replace(/\b(Dr|Mr|Mrs|Ms|Prof|St)\./g,"$1\u0001"),m=s.match(/[^.!?]+(?:[.!?]+["”]?|$)\s*/g)||[s];return m.map(function(x){return x.replace(/\u0001/g,".").trim()}).filter(Boolean)}
function close(){var c=document.querySelector(".cine");if(c){c.remove();document.dispatchEvent(new CustomEvent("cf:cine-close"))}}
document.addEventListener("cf:ending",function(e){
 close();var cs=CF.state().cs,sc=e.detail.sc,id=e.detail.id,box=g("sc"),
  k=sc.s?"secret":id=="win_master"?"master":sc.k=="win"?"win":sc.k=="weak"?"weak":id=="timeout"?"time":"fail",
  ln=sents(sc.t),n=ln.length,sd=(.9+n*.75+.3).toFixed(2),coda=box&&box.querySelector(".coda"),st=box&&box.querySelector(".mute"),o=document.createElement("div");
 o.className="cine k-"+k;o.setAttribute("role","dialog");o.setAttribute("aria-label",sc.e);
 o.innerHTML='<div class="bg" aria-hidden="true">'+CFArt.flat(CFArt.get(cs))+'</div><div class="grade" aria-hidden="true"></div>'+
  '<div class="card"><div class="cicon" aria-hidden="true">'+(sc.i||"🏁")+'</div><h2>'+esc(sc.e)+'</h2>'+
  '<p class="clines">'+ln.map(function(x,i){return '<span class="line" style="--i:'+i+'">'+esc(x)+' </span>'}).join("")+'</p>'+
  (coda?'<p class="ccoda" style="--i:'+n+'">'+coda.innerHTML+'</p>':"")+'<div class="cepi"></div>'+
  '<div class="cstamp" style="--sd:'+sd+'s"><b>'+LBL[k][0]+'</b><span>'+LBL[k][1]+'</span></div>'+
  '<p class="cmeta" style="--sd:'+sd+'s">'+(st?esc(st.textContent):"")+'</p>'+
  '<div class="cbtn" style="--sd:'+sd+'s"><button class="choice" data-restart="1">Replay and take a different path</button><button class="choice" data-home="1">All cases</button></div></div>'+
  '<button class="cx" aria-label="Close ending screen">✕</button>';
 o.addEventListener("click",function(ev){if(ev.target.closest("[data-restart],[data-home]"))setTimeout(function(){if(o.isConnected){o.remove();document.dispatchEvent(new CustomEvent("cf:cine-close"))}},0);else if(ev.target.closest(".cx"))close()});
 document.body.appendChild(o)});
document.addEventListener("cf:home",close);document.addEventListener("cf:case",close);
document.addEventListener("keydown",function(e){if(e.key=="Escape")close()});
})();
