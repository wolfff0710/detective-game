/* fx/ambient.js — canvas weather per case (art.fx): rain+lightning, snow, bubbles, neon, dust, fireflies, stars. Toggle button saved in localStorage. */
(function(){
"use strict";
var RM=matchMedia("(prefers-reduced-motion:reduce)").matches,cv,cx,btn,W=0,H=0,mode=null,P=[],raf=0,t0=0,flash=0,nb=2,bolt=null,on=true,i;
try{on=localStorage.getItem("cf2_fx")!=="0"}catch(e){}
function rnd(a,b){return a+Math.random()*(b-a)}
function strike(){var x=W*rnd(.15,.85),y=0,p=[[x,0]];while(y<H*.6){y+=rnd(20,50);x+=rnd(-25,25);p.push([x,y])}p.again=Math.random()<.25;return p}
function fill(n,f){P=[];for(var k=0;k<n;k++)P.push(f(k))}
var FX={
rain:{init:function(){fill(64,function(){var n=Math.random()<.35;return {n:n,x:rnd(-100,W+100),y:rnd(0,H),l:n?rnd(16,26):rnd(8,14),v:n?rnd(900,1200):rnd(520,760)}})},
 draw:function(dt){[0,1].forEach(function(n){cx.strokeStyle=n?"rgba(196,212,255,.24)":"rgba(160,186,240,.11)";cx.lineWidth=n?1.3:.8;cx.beginPath();
  P.forEach(function(p){if(!!p.n!==!!n)return;cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.l*.25,p.y+p.l);p.y+=p.v*dt;p.x-=p.v*dt*.25;if(p.y>H){p.y=-30;p.x=rnd(-100,W+100)}});cx.stroke()});
  nb-=dt;if(nb<=0){nb=rnd(16,32);flash=.5;bolt=strike()}
  if(flash>0){cx.fillStyle="rgba(205,218,255,"+(.1*flash).toFixed(3)+")";cx.fillRect(0,0,W,H);
   if(bolt){cx.strokeStyle="rgba(240,244,255,"+flash.toFixed(2)+")";cx.lineWidth=1.6;cx.beginPath();bolt.forEach(function(q,k){k?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])});cx.stroke()}
   flash-=dt*2.6;if(flash<=0){flash=0;if(bolt&&bolt.again){bolt.again=false;flash=.3}else bolt=null}}}},
snow:{init:function(){fill(50,function(){return {x:rnd(0,W),y:rnd(0,H),r:rnd(.8,2.4),v:rnd(18,50),s:rnd(0,6)}})},
 draw:function(dt,t){cx.fillStyle="rgba(255,255,255,.55)";cx.beginPath();P.forEach(function(p){p.y+=p.v*dt;p.x+=Math.sin(t*.8+p.s)*24*dt;if(p.y>H+5){p.y=-5;p.x=rnd(0,W)}cx.moveTo(p.x+p.r,p.y);cx.arc(p.x,p.y,p.r,0,6.283)});cx.fill()}},
bubbles:{init:function(){fill(14,function(){return {x:rnd(0,W),y:rnd(0,H),r:rnd(2,6),v:rnd(14,34),w:rnd(0,6)}})},
 draw:function(dt,t){cx.strokeStyle="rgba(160,232,255,.25)";cx.lineWidth=1;cx.beginPath();P.forEach(function(p){p.y-=p.v*dt;if(p.y<-20){p.y=H+20;p.x=rnd(0,W)}var x=p.x+Math.sin(t*1.2+p.w)*10;cx.moveTo(x+p.r,p.y);cx.arc(x,p.y,p.r,0,6.283)});cx.stroke()}},
neon:{init:function(){var col=["#ff4fa3","#3de0ff","#b98cff"];fill(5,function(k){var v=k%2==0,b={v:v,c:col[k%3],ph:rnd(0,9),sp:rnd(1.5,5),d:0};
  if(v){b.x=k%4==0?rnd(8,30):W-rnd(8,30);b.y=rnd(0,Math.max(10,H-160));b.l=rnd(60,160)}else{b.x=rnd(0,Math.max(10,W-200));b.y=k%3==0?rnd(8,30):H-rnd(8,30);b.l=rnd(80,200)}return b})},
 draw:function(dt,t){cx.lineWidth=2;cx.lineCap="round";P.forEach(function(s){var a=.5+.5*Math.sin(t*s.sp+s.ph);if(Math.random()<.0015)s.d=rnd(.1,.35);if(s.d>0){s.d-=dt;a=.04}
  cx.globalAlpha=.1+.28*a;cx.strokeStyle=s.c;cx.shadowColor=s.c;cx.shadowBlur=7;cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.v?s.x:s.x+s.l,s.v?s.y+s.l:s.y);cx.stroke()});cx.globalAlpha=1;cx.shadowBlur=0}},
dust:{init:function(){fill(26,function(){return {x:rnd(0,W),y:rnd(0,H),r:rnd(.6,1.6),vx:rnd(-6,6),vy:rnd(-4,7),a:rnd(.1,.28)}})},
 draw:function(dt){var gr=cx.createLinearGradient(0,0,W*.6,H);gr.addColorStop(0,"rgba(255,240,200,.035)");gr.addColorStop(1,"rgba(255,240,200,0)");cx.fillStyle=gr;cx.beginPath();cx.moveTo(0,0);cx.lineTo(W*.38,0);cx.lineTo(W*.85,H);cx.lineTo(W*.25,H);cx.fill();
  P.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y>H)p.y=0;if(p.y<0)p.y=H;cx.fillStyle="rgba(255,244,210,"+p.a+")";cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill()})}},
fireflies:{init:function(){fill(12,function(){return {x:rnd(0,W),y:rnd(0,H),vx:0,vy:0,ph:rnd(0,9)}})},
 draw:function(dt,t){P.forEach(function(p){p.vx=Math.max(-28,Math.min(28,p.vx+rnd(-40,40)*dt));p.vy=Math.max(-28,Math.min(28,p.vy+rnd(-40,40)*dt));p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;var a=Math.max(0,Math.sin(t*1.6+p.ph));if(a<.05)return;
  var gr=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,14);gr.addColorStop(0,"rgba(255,246,150,"+(.55*a).toFixed(2)+")");gr.addColorStop(1,"rgba(255,230,90,0)");cx.fillStyle=gr;cx.fillRect(p.x-14,p.y-14,28,28)})}},
stars:{init:function(){fill(34,function(){return {x:rnd(0,W),y:rnd(0,H),r:rnd(1,2),ph:rnd(0,9)}})},
 draw:function(dt,t){P.forEach(function(p){p.x+=5*dt;if(p.x>W)p.x=0;cx.fillStyle="rgba(255,255,255,"+(.2+.35*Math.abs(Math.sin(t*.6+p.ph))).toFixed(2)+")";cx.fillRect(p.x,p.y,p.r,p.r)})}}
};
function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;if(mode)FX[mode].init()}
function mk(){cv=document.createElement("canvas");cv.id="fxc";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);cx=cv.getContext("2d");
 btn=document.createElement("button");btn.className="fxbtn";btn.hidden=true;btn.setAttribute("aria-label","Toggle ambient effects");
 btn.onclick=function(){on=!on;try{localStorage.setItem("cf2_fx",on?"1":"0")}catch(e){}sync()};document.body.appendChild(btn);addEventListener("resize",size);size()}
function run(){if(!raf&&on&&mode){t0=performance.now();raf=requestAnimationFrame(frame)}}
function frame(ts){raf=0;if(!on||!mode){cx.clearRect(0,0,W,H);return}var dt=Math.min(.05,(ts-t0)/1000||0);t0=ts;cx.clearRect(0,0,W,H);FX[mode].draw(dt,ts/1000);raf=requestAnimationFrame(frame)}
function sync(){btn.textContent=on?"✨":"🚫";btn.title="Ambient effects: "+(on?"on":"off");if(on)run();else cx.clearRect(0,0,W,H)}
function set(m){if(RM)return;if(!cv)mk();mode=FX[m]?m:null;flash=0;bolt=null;nb=2;cx.clearRect(0,0,W,H);btn.hidden=!mode;cv.classList.toggle("on",!!mode);if(mode){FX[mode].init();sync()}}
document.addEventListener("cf:case",function(){set(CFArt.get(CF.state().cs).fx)});
document.addEventListener("cf:home",function(){set(null)});
})();
