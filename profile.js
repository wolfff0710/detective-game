/* fx/profile.js — animated rank-up overlay + 3D-tilt badge shelf */
(function(){
"use strict";
var RANK=["Rookie","Constable","Inspector","Chief Inspector","Legend"],pend=null;
function rd(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function sv(v){try{localStorage.setItem("cf2_rank",JSON.stringify(v))}catch(e){}}
function idx(){return Math.min(CF.C.filter(CF.wins).length,RANK.length-1)}
function star(cx,cy,r){var p=[],i,a;for(i=0;i<10;i++){a=-Math.PI/2+i*Math.PI/5;p.push((cx+Math.cos(a)*(i%2?r*.45:r)).toFixed(1)+","+(cy+Math.sin(a)*(i%2?r*.45:r)).toFixed(1))}return '<polygon points="'+p.join(" ")+'" fill="#ffe08a" stroke="#8a5a0a" stroke-width="1.5"/>'}
function show(){if(!pend)return;var p=pend,o=document.createElement("div"),i,b="",s="";pend=null;
 for(i=0;i<28;i++)b+='<span style="--a:'+(i*360/28)+'deg;--d:'+(140+Math.random()*130).toFixed(0)+'px"></span>';
 for(i=0;i<p.i;i++)s+=star(60+(i-(p.i-1)/2)*24,62,13);
 o.className="rankup";o.setAttribute("role","dialog");o.setAttribute("aria-label","Rank up: "+p.to);
 o.innerHTML='<div class="ru-rays"></div><div class="ru-burst">'+b+'</div><div class="ru-card"><div class="ru-chev"><i></i><i></i><i></i></div><small>Rank up</small>'+
  '<svg class="ru-badge" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" fill="#1b1608" stroke="#e3b95c" stroke-width="4"/><circle cx="60" cy="60" r="44" fill="none" stroke="#e3b95c" stroke-opacity=".4" stroke-dasharray="4 5"/>'+s+'</svg>'+
  '<s class="ru-old">'+p.from+'</s><h2 class="ru-new">'+p.to.split("").map(function(c,k){return '<span style="--i:'+k+'">'+(c==" "?"&nbsp;":c)+'</span>'}).join("")+'</h2><button class="ru-ok">Continue</button></div>';
 function done(){clearTimeout(t);o.remove()}var t=setTimeout(done,7000);o.addEventListener("click",done);document.body.appendChild(o)}
document.addEventListener("cf:home",function(){if(localStorage.getItem("cf2_rank")==null)sv(idx())});
document.addEventListener("cf:ending",function(e){if(e.detail.sc.k!="win")return;var i=idx(),p=rd("cf2_rank",0);sv(Math.max(i,p));
 if(i>p){pend={from:RANK[p],to:RANK[i],i:i};setTimeout(function(){if(!document.querySelector(".cine"))show()},2400)}});
document.addEventListener("cf:cine-close",function(){if(pend)setTimeout(show,350)});

var pp=document.getElementById("pp");
function tilt(e){var el=e.currentTarget,r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 el.style.transform="perspective(520px) rotateY("+((x-.5)*30).toFixed(1)+"deg) rotateX("+((.5-y)*26).toFixed(1)+"deg) translateZ(16px)";el.style.setProperty("--gx",(x*100).toFixed(0)+"%");el.style.setProperty("--gy",(y*100).toFixed(0)+"%")}
function rest(e){e.currentTarget.style.transform=""}
function shelf(){var b=pp.querySelector(".badges");if(!b||b.classList.contains("shelf"))return;b.classList.add("shelf");
 [].forEach.call(b.children,function(el){el.addEventListener("pointermove",tilt);el.addEventListener("pointerleave",rest)})}
if(pp){new MutationObserver(shelf).observe(pp,{childList:true});shelf()}
})();
