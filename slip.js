/* fx/slip.js — Slip-catch moment. When a scene that sets a *slip flag loads: freeze, zoom on the slipped phrase in red, chime,
   fly a red string into the notebook and draw red strings on the Board. Load after stage.js and lib.js. */
(function(){
"use strict";
var PH={lighthouse:"smugglers’ chest",auction:"second canvas",arctic:"Four minutes with the lock open",wedding:"the emerald set",key:"brown envelope",fair:"Thirty-five grams of salt a litre",mask:"ribbon on its horns",houseboat:"a thin pick",violin:"blue cloth",idol:"the voice core is safe somewhere",biryani:"hidden gulab jamun",starship:"nine hours",train:"grey briefcase",deepdive:"Twenty minutes with the scrubber shut",neonbank:"Nine billion, down to the last credit, at 8:02 sharp",mirror:"raven pin",raven:"Not a violin, not an emerald, not a pair of bangles"},
 E=CFLib.esc,seen={},tm=[],RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
function g(i){return document.getElementById(i)}
function isSlip(sc){return CFLib.L(sc.f).some(function(x){return /slip$/.test(x)})}
function phrase(cs,sc){var p=PH[cs.id];if(p&&sc.t.indexOf(p)>=0)return p;var q=sc.t.match(/“[^”]+”/g);return q?q[q.length-1].replace(/[“”]/g,""):null}
function toast(m){var t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},1700)}
/* red strings from the slip pin to every proof pin you hold (only while the Board is open) */
function strings(){var st=CF.state(),cs=st.cs,bd=g("board"),sv=g("strings"),ps=g("pins");if(!cs||!bd||bd.hidden||!sv||!ps)return;
 [].forEach.call(sv.querySelectorAll(".slipstring"),function(x){x.remove()});
 var cu=CFLib.culprit(cs),sf=cu&&cu.flags.filter(function(f){return /slip$/.test(f)})[0];if(!sf||!st.fl[sf])return;
 var sc=CFLib.clue(cs,sf),si=sc?st.notes.indexOf(sc.note):-1,A=ps.children[si],k=0;if(!A)return;
 function pt(el){return [ps.offsetLeft+el.offsetLeft+el.offsetWidth/2,ps.offsetTop+el.offsetTop+8]}
 var a=pt(A);
 cu.flags.forEach(function(f){if(f===sf||!st.fl[f])return;var c=CFLib.clue(cs,f),j=c?st.notes.indexOf(c.note):-1,B=ps.children[j];if(!B||j===si)return;
  var b=pt(B),p=document.createElementNS("http://www.w3.org/2000/svg","path");
  p.setAttribute("class","slipstring");p.setAttribute("pathLength","1");p.style.animationDelay=(k++*.12)+"s";
  p.setAttribute("d","M"+a[0]+" "+a[1]+" Q"+(a[0]+b[0])/2+" "+(Math.max(a[1],b[1])+34+Math.abs(a[0]-b[0])*.06)+" "+b[0]+" "+b[1]);sv.appendChild(p)})}
function moment(cs,sc){var txt=g("txt"),ph=phrase(cs,sc),i=ph?sc.t.indexOf(ph):-1,idx=CF.state().notes.indexOf(sc.n),li=document.querySelectorAll("#notes li")[idx],bb=document.querySelector(".bbtn");
 if(!txt)return;txt.click();
 if(i>=0)txt.innerHTML=E(sc.t.slice(0,i))+'<mark class="slipm">'+E(ph)+'</mark>'+E(sc.t.slice(i+ph.length));
 CFLib.snd("chime");
 function pin(){if(li)li.classList.add("slipnote");if(bb)bb.classList.add("pulse-red");toast("🔴 Slip pinned to the board");strings()}
 if(RM){pin();return}
 var v=document.createElement("div");v.className="slipveil";
 v.innerHTML='<div class="slipcall"><small>🔴 They slipped</small><strong>“'+E(ph||"…")+'”</strong><em>Nobody told them that.</em></div><svg class="slipstr" aria-hidden="true"><path pathLength="1"/></svg>';
 document.body.appendChild(v);
 var call=v.querySelector(".slipcall"),path=v.querySelector("path");
 function end(){tm.forEach(clearTimeout);tm=[];v.remove();pin()}
 v.addEventListener("click",end);
 tm.push(setTimeout(function(){var a=call.getBoundingClientRect(),t=li?li.getBoundingClientRect():null;
  if(t){var x1=a.left+a.width/2,y1=a.top+a.height/2,x2=t.left+24,y2=t.top+t.height/2;
   path.setAttribute("d","M"+x1+" "+y1+" Q"+(x1+(x2-x1)*.2)+" "+(y2+120)+" "+x2+" "+y2);call.style.setProperty("--dx",(x2-x1)+"px");call.style.setProperty("--dy",(y2-y1)+"px");path.classList.add("go")}
  call.classList.add("fly")},2000));
 tm.push(setTimeout(end,2900))}
document.addEventListener("cf:case",function(){seen={};tm.forEach(clearTimeout);tm=[];var v=document.querySelector(".slipveil");if(v)v.remove()});
document.addEventListener("cf:scene",function(e){var cs=CF.state().cs,sc=e.detail.sc,k=cs.id+":"+e.detail.id;
 if(isSlip(sc)&&!seen[k]){seen[k]=1;moment(cs,sc)}strings()});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-board],[data-view]");if(!b)return;
 if(b.dataset.board!==undefined)b.classList.remove("pulse-red");setTimeout(strings,30)});
addEventListener("resize",function(){setTimeout(strings,60)});
})();
