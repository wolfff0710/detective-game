/* emoji.js — swaps emoji characters for bundled Twemoji vector icons so symbols look identical (and never show as empty boxes) on every device.
   Reads window.CF_EMOJI (emoji-data.js). Text glyphs such as ♥ ★ ✓ ◀ ▶ are left alone so CSS can colour them. */
(function(){
"use strict";
var D=window.CF_EMOJI;if(!D||!window.MutationObserver)return;
var RX=/\p{Extended_Pictographic}[\u{1F3FB}-\u{1F3FF}]?\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*/gu,
 QUICK=/\p{Extended_Pictographic}/u,SKIP="#txt,#live,[data-noemo],script,style,textarea,input,title",NS="http://www.w3.org/2000/svg";
function key(s){var a=Array.from(s).map(function(c){return c.codePointAt(0)});if(a.indexOf(0x200d)<0)a=a.filter(function(c){return c!==0xfe0f});return a.map(function(c){return c.toString(16)}).join("-")}
function mk(k,s){var v=document.createElementNS(NS,"svg"),u=document.createElementNS(NS,"use");v.setAttribute("class","emo");v.setAttribute("viewBox","0 0 36 36");v.setAttribute("role","img");v.setAttribute("aria-label",s);u.setAttribute("href","#e-"+k);v.appendChild(u);return v}
function sprite(){var s=document.createElementNS(NS,"svg"),h="",k;s.setAttribute("width","0");s.setAttribute("height","0");s.setAttribute("aria-hidden","true");s.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
 for(k in D)h+='<symbol id="e-'+k+'" viewBox="0 0 36 36">'+D[k]+'</symbol>';s.innerHTML=h;document.body.insertBefore(s,document.body.firstChild)}
function fix(n){var t=n.nodeValue,p=n.parentNode,f,last=0,m,hit=false,k;if(!p||!QUICK.test(t))return;
 if(p.closest){if(p.closest(SKIP))return;if(p.closest("svg"))return}
 f=document.createDocumentFragment();RX.lastIndex=0;
 while((m=RX.exec(t))){k=key(m[0]);if(!D[k])continue;hit=true;if(m.index>last)f.appendChild(document.createTextNode(t.slice(last,m.index)));f.appendChild(mk(k,m[0]));last=m.index+m[0].length}
 if(!hit)return;if(last<t.length)f.appendChild(document.createTextNode(t.slice(last)));p.replaceChild(f,n)}
function scan(root){if(!root)return;if(root.nodeType===3){fix(root);return}if(root.nodeType!==1||!root.closest||root.closest("svg.emo"))return;
 var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),a=[],n;while((n=w.nextNode()))a.push(n);a.forEach(fix)}
function start(){sprite();scan(document.body);
 new MutationObserver(function(rs){rs.forEach(function(r){if(r.type==="characterData")fix(r.target);else[].forEach.call(r.addedNodes,scan)})}).observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
window.CFEmoji={scan:scan};
})();
