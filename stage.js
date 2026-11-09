/* fx/stage.js — parallax SVG stage above every scene + suspect portraits on talk screens */
(function(){
"use strict";
var tx=0,ty=0,cx=0,cy=0,last=null,RM=matchMedia("(prefers-reduced-motion:reduce)").matches,D=[.008,.02,.045];
function g(i){return document.getElementById(i)}
document.addEventListener("cf:scene",function(e){
 var s=CF.state(),cs=s.cs,box=g("sc");if(!box||!cs)return;
 var id=e.detail.id,sc=e.detail.sc,a=CFArt.get(cs),own=CFFace.owner(cs,id),hub=id===cs.hub,m=own?CFFace.mood(sc,own):null,ic=box.querySelector(".ic"),
  shift=!!(own&&last&&last.c===cs.id&&last.n===own.name&&last.m!==m),st=document.createElement("div");
 st.className="stage "+(hub?"lg":own?"sm has-p":"sm");st.setAttribute("aria-hidden","true");
 st.innerHTML=CFArt.layers(a).map(function(x,i){return '<div class="layer" data-d="'+D[i]+'">'+x+'</div>'}).join("")+'<div class="vig"></div>'+
  (own?CFFace.html(own,m,cs,shift):hub?"":'<div class="prop">'+(sc.i||cs.icon)+'</div>');
 box.insertBefore(st,box.firstChild);if(ic)ic.hidden=true;
 last=own?{c:cs.id,n:own.name,m:m}:null});
if(!RM){
 addEventListener("pointermove",function(e){tx=e.clientX/innerWidth*2-1;ty=e.clientY/innerHeight*2-1},{passive:true});
 addEventListener("deviceorientation",function(e){if(e.gamma==null)return;tx=Math.max(-1,Math.min(1,e.gamma/30));ty=Math.max(-1,Math.min(1,(e.beta-45)/30))});
 (function loop(){cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;var s=document.querySelector(".stage");
  if(s){var w=s.clientWidth;[].forEach.call(s.querySelectorAll(".layer"),function(l){var d=+l.dataset.d;l.style.transform="translate3d("+(-cx*d*w).toFixed(1)+"px,"+(-cy*d*w*.5).toFixed(1)+"px,0)"})}
  requestAnimationFrame(loop)})()}
})();
