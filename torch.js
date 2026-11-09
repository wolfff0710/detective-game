/* fx/torch.js — Torch mode. Entering a dark scene opens a black room first: your cursor (or finger) is a torch cone, clues glint when lit, click the glint to continue.
   Needs engine edits: cancelable cf:before event + CF.go. Mark scenes per case with  dark:["sceneId"]  or edit DARK below. */
(function(){
"use strict";
var DARK={lighthouse:["cellar","lamp"],arctic:["gen","shed"],manor:["study"],starship:["cargo"]},
 FLAV=["Just a rusty nail.","Only a puddle catching the light.","A cobweb. Nothing more.","A dented tin cup. Not what you need.","Loose gravel. Keep looking."],
 on=true,lit={},by=null,run=null,btn=null;
try{on=localStorage.getItem("cf2_torch")!=="0"}catch(e){}
function g(i){return document.getElementById(i)}
function rnd(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function seed(t){var h=7;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%233280;return h||1}
function darkList(cs){return cs.dark||DARK[cs.id]||[]}
function room(a,r){var o='<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="240" fill="#14181d"/>',x,y;
 for(y=0;y<8;y++)for(x=-(y%2)*20;x<400;x+=40)o+='<rect x="'+(x+1)+'" y="'+(y*20+1)+'" width="38" height="18" fill="hsl(215,9%,'+(13+Math.floor(r()*9))+'%)"/>';
 o+='<rect y="160" width="400" height="80" fill="#0e1115"/>';
 for(x=-200;x<=600;x+=60)o+='<path d="M200 160L'+x+' 240" stroke="#ffffff10"/>';
 o+='<path d="M0 34H400M0 46H400" stroke="#2b333b" stroke-width="6"/>';
 [[60,150],[118,156],[300,152],[352,158]].forEach(function(b){o+='<ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="22" ry="28" fill="#2a2018"/><path d="M'+(b[0]-22)+' '+(b[1]-8)+'H'+(b[0]+22)+'M'+(b[0]-22)+' '+(b[1]+10)+'H'+(b[0]+22)+'" stroke="#463524" stroke-width="3"/>'});
 o+='<rect x="190" y="150" width="46" height="34" fill="#352a1e"/><path d="M190 165H236" stroke="#241b12"/><ellipse cx="'+(160+Math.floor(r()*60))+'" cy="210" rx="34" ry="7" fill="#3a5a6a" opacity=".35"/><rect width="400" height="240" fill="'+a.pal[1]+'" opacity=".14"/>';
 return o+'</svg>'}
function stop(){if(run){run.stop();run=null}}
function say(t){var p=g("ttxt");if(p)p.textContent=t}
function start(cs,id,sc){stop();
 var box=g("sc"),r=rnd(seed(cs.id+id)),a=CFArt.get(cs),
  back=sc.b?'<button class="choice" data-to="'+sc.b+'" data-set="">'+(sc.b==cs.hub?cs.hl:"Go back")+'</button>':"";
 box.innerHTML='<div class="tstage" aria-label="A dark room. Move the pointer to sweep your torch.">'+room(a,r)+'<canvas class="tdark"></canvas></div><p class="ttxt" id="ttxt" aria-live="polite">Pitch black. Sweep your torch (move the mouse, or drag a finger) and look for something that glints.</p><div class="ch"><button class="choice" data-t="lights">Switch on the lights</button>'+back+'<button class="choice tq" data-t="off">Disable torch mode</button></div>';
 var st=box.querySelector(".tstage"),cv=st.querySelector("canvas"),cx=cv.getContext&&cv.getContext("2d"),G=[],w=0,h=0,px=0,py=0,raf=0,ht=0,fin=0,ro=null,k,x,y,tries;
 for(k=0;k<3;k++){tries=0;do{x=.14+.72*r();y=.36+.52*r();tries++}while(tries<30&&G.some(function(q){return Math.hypot(q.x-x,q.y-y)<.22}));G.push({x:x,y:y,main:k==0,found:0})}
 function size(){w=cv.width=st.clientWidth||600;h=cv.height=st.clientHeight||300;if(!px){px=w*.5;py=h*.6}}
 function rad(){return Math.max(70,Math.min(w,h)*.27)}
 function pos(e){var q=st.getBoundingClientRect();px=e.clientX-q.left;py=e.clientY-q.top}
 function frame(ts){raf=requestAnimationFrame(frame);if(!cx)return;
  var R=rad(),ox=w*.5,oy=h+16,dx=px-ox,dy=py-oy,an=Math.atan2(dy,dx),len=Math.hypot(dx,dy)+R*.9,hf=.3,gr;
  cx.globalCompositeOperation="source-over";cx.fillStyle="rgba(0,0,0,.965)";cx.fillRect(0,0,w,h);
  cx.globalCompositeOperation="destination-out";
  gr=cx.createRadialGradient(ox,oy,8,ox,oy,len);gr.addColorStop(0,"rgba(0,0,0,.85)");gr.addColorStop(1,"rgba(0,0,0,.28)");cx.fillStyle=gr;
  cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(ox+Math.cos(an-hf)*len,oy+Math.sin(an-hf)*len);cx.lineTo(ox+Math.cos(an+hf)*len,oy+Math.sin(an+hf)*len);cx.closePath();cx.fill();
  gr=cx.createRadialGradient(px,py,0,px,py,R);gr.addColorStop(0,"rgba(0,0,0,1)");gr.addColorStop(.65,"rgba(0,0,0,.9)");gr.addColorStop(1,"rgba(0,0,0,0)");cx.fillStyle=gr;cx.beginPath();cx.arc(px,py,R,0,6.283);cx.fill();
  cx.globalCompositeOperation="source-over";
  G.forEach(function(q,i){var gx=q.x*w,gy=q.y*h,d=Math.hypot(gx-px,gy-py),s;if(d>R)return;s=q.found?4:7+3*Math.sin(ts/110+i);
   cx.globalAlpha=Math.max(0,(1-d/R)*(.55+.45*Math.sin(ts/130+i*2)));cx.fillStyle=q.found&&!q.main?"#9aa7ad":"#ffe9a0";cx.shadowColor="#ffd45e";cx.shadowBlur=q.found?0:14;
   cx.beginPath();cx.moveTo(gx,gy-s);cx.lineTo(gx+s*.28,gy-s*.28);cx.lineTo(gx+s,gy);cx.lineTo(gx+s*.28,gy+s*.28);cx.lineTo(gx,gy+s);cx.lineTo(gx-s*.28,gy+s*.28);cx.lineTo(gx-s,gy);cx.lineTo(gx-s*.28,gy-s*.28);cx.closePath();cx.fill()});
  cx.globalAlpha=1;cx.shadowBlur=0}
 function click(e){if(fin)return;pos(e);var R=rad();
  G.forEach(function(q){if(q.found||Math.hypot(q.x*w-px,q.y*h-py)>R*.55)return;q.found=1;
   if(q.main){say("✨ You found something!");fin=1;setTimeout(finish,950)}else say(FLAV[Math.floor(Math.random()*FLAV.length)])})}
 function finish(){stop();lit[id]=1;by=id;CF.go(id);by=null}
 function hint(){var m=G[0];say("Something glints toward the "+(m.y<.55?"upper":"lower")+" "+(m.x<.4?"left":m.x>.6?"right":"middle")+" of the room.")}
 st.addEventListener("pointermove",pos);st.addEventListener("pointerdown",pos);st.addEventListener("click",click);
 if(window.ResizeObserver){ro=new ResizeObserver(size);ro.observe(st)}
 size();ht=setTimeout(hint,11000);raf=requestAnimationFrame(frame);
 run={stop:function(){cancelAnimationFrame(raf);clearTimeout(ht);if(ro)ro.disconnect()},finish:finish}}
function paint(){btn.textContent="🔦";btn.classList.toggle("off",!on);btn.title="Torch mode: "+(on?"on":"off")}
function sync(cs){if(!btn){btn=document.createElement("button");btn.className="torchbtn";btn.setAttribute("aria-label","Toggle torch mode");
  btn.onclick=function(){on=!on;try{localStorage.setItem("cf2_torch",on?"1":"0")}catch(e){}paint()};document.body.appendChild(btn)}
 btn.hidden=!(cs&&darkList(cs).length);paint()}
document.addEventListener("cf:case",function(){lit={};stop();sync(CF.state().cs)});
document.addEventListener("cf:home",function(){stop();sync(null)});
document.addEventListener("cf:before",function(e){var cs=CF.state().cs,id=e.detail.id,sc=e.detail.sc;
 if(!cs||sc.e||!on||by===id||lit[id]||darkList(cs).indexOf(id)<0||!g("sc"))return;
 e.preventDefault();start(cs,id,sc)});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-t]");if(!b)return;
 if(b.dataset.t=="lights"&&run)run.finish();
 if(b.dataset.t=="off"){on=false;try{localStorage.setItem("cf2_torch","0")}catch(x){}if(btn)paint();if(run)run.finish()}});
})();
