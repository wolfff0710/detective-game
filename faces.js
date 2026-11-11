/* fx/faces.js (global CFFace, to avoid clashing with portraits.js) — procedural suspect faces. Mood follows how the player talks to them. */
(function(){
"use strict";
var SK=["#f6d3b3","#e8b88a","#c98e5f","#a8693c","#7a4a2a"],HC=["#17130f","#33241a","#5b3a22","#8a5a2b","#bdbdbd","#d8b25a"],
CL=["#2f4858","#7a3b3b","#3b6b4a","#59487a","#7a5a2f","#2b5f7a","#444b57"],ST=["short","long","bun","curly","side","short"],AC=["none","glasses","none","beard","none","hat"],
LBL={neutral:"Guarded",soft:"Open",angry:"Hostile",sad:"Hurt",nervous:"Rattled",smug:"Smug"},
M={neutral:{e:4.2,p:0,bl:[42,43,55,43],br:[65,43,78,43],m:"M52 70L68 70"},
 soft:{e:4.4,p:0,bl:[42,42,55,41],br:[65,41,78,42],m:"M51 67Q60 76 69 67"},
 angry:{e:2.6,p:0,bl:[41,39,55,45],br:[65,45,79,39],m:"M52 74Q60 66 68 74"},
 sad:{e:3.6,p:0,bl:[42,46,55,41],br:[65,41,78,46],m:"M53 74Q60 68 67 74"},
 nervous:{e:5.2,p:2,bl:[42,39,55,38],br:[65,38,78,39],m:"M51 71Q55.5 68 60 71T69 71"},
 smug:{e:2.8,p:1.5,bl:[42,43,55,44],br:[65,38,78,41],m:"M52 71Q62 74 70 65"}},
cache={},fu=0;
function lite(c,t){var h=c.replace('#','');var n=[0,2,4].map(function(i){var v=parseInt(h.slice(i,i+2),16);return ('0'+Math.round(v+(255-v)*t).toString(16)).slice(-2)});return '#'+n.join('')}
function dark(c,t){var h=c.replace('#','');var n=[0,2,4].map(function(i){var v=parseInt(h.slice(i,i+2),16);return ('0'+Math.round(v*(1-t)).toString(16)).slice(-2)});return '#'+n.join('')}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function hs(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h}
function any(e,l){return l.some(function(x){return e.indexOf(x)>=0})}
function R(x,y,w,h,f,o){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"'+(o||"")+'/>'}
function P(d,f,o){return '<path d="'+d+'" fill="'+f+'"'+(o||"")+'/>'}
function C(x,y,r,f,o){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(o||"")+'/>'}

function hint(e){var o={};e=e||"";
 if(any(e,["🤖"]))o.robot=1;
 if(any(e,["👩","👵","👧","👰","♀"]))o.f=1;
 if(any(e,["🧓","👵","👴"]))o.old=1;
 if(any(e,["🧒","👧"]))o.child=1;
 if(any(e,["🧔"]))o.ac="beard";
 if(any(e,["🧑‍🏫","👨‍🏫","👩‍🏫","🧑‍🔬","👩‍🔬","👨‍🔬","🩺","🧮","🔬","🧐"]))o.ac="glasses";
 if(any(e,["🛡️","👮","🔦","🚩","🎫"]))o.ac="cap";
 if(any(e,["🎩"]))o.ac="hat";
 if(any(e,["🧑‍✈️"]))o.ac="captain";
 if(any(e,["👨‍🍳","🍵","🍲"]))o.ac="chef";
 if(any(e,["🎧","🧑‍💻","🎮"]))o.ac="headset";
 return o}
function params(name,emoji,ov){var h=hs(name),o=hint(emoji),p={skin:SK[h%5],hair:HC[(h>>>3)%6],cloth:CL[(h>>>6)%7],style:ST[(h>>>9)%6],ac:AC[(h>>>12)%6],big:1},k;
 if(o.f){p.style=["long","bun","long","side"][(h>>>4)%4];if(p.ac=="beard")p.ac="none"}else if(p.style=="long")p.style="short";
 if(o.old)p.hair="#bdbdbd";
 if(o.child){p.big=.88;p.style="short";p.ac="none"}
 if(o.ac)p.ac=o.ac;if(o.robot)p.robot=1;
 for(k in ov)p[k]=ov[k];return p}

function robot(m){var c={neutral:"#59e1ff",soft:"#7cffb2",angry:"#ff5252",sad:"#6a8cff",nervous:"#ffd166",smug:"#ff7ad9"}[m]||"#59e1ff",a=m=="angry"?8:m=="sad"?-6:0;
 return P("M12 120Q14 92 46 88H74Q106 92 108 120Z","#4a5a67")+R(52,78,16,12,"#38444e")+R(32,24,56,56,"#9fb2bf",' rx="12"')+R(32,24,56,56,"none",' rx="12" stroke="#5d7080" stroke-width="2"')+R(59,10,2,16,"#5d7080")+C(60,9,4,m=="angry"?"#ff5252":"#ffd166")+R(40,40,40,20,"#0b1a22",' rx="6"')+R(44,46,12,8,c,' rx="2" transform="rotate('+a+' 50 50)"')+R(64,46,12,8,c,' rx="2" transform="rotate('+(-a)+' 70 50)"')+(m=="sad"?'<path d="M46 72Q60 66 74 72" stroke="#5d7080" stroke-width="3" fill="none"/>':'<path d="M46 70H74M50 66V74M58 66V74M66 66V74" stroke="#5d7080" stroke-width="2" fill="none"/>')}

function face(p,m,name){var d=M[m]||M.neutral,k="#1b1410",s=p.skin,hc=p.hair,bc=(hc=="#bdbdbd"||hc=="#d8b25a")?"#6a5a45":hc,o='<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(name)+'">',st=p.style;
 if(p.robot)return o+robot(m)+'</svg>';
 var u=++fu;o+='<defs><radialGradient id="sk'+u+'" cx=".42" cy=".34" r=".8"><stop offset="0" stop-color="'+lite(s,.2)+'"/><stop offset=".6" stop-color="'+s+'"/><stop offset="1" stop-color="'+dark(s,.16)+'"/></radialGradient><linearGradient id="cl'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+lite(p.cloth,.12)+'"/><stop offset="1" stop-color="'+dark(p.cloth,.3)+'"/></linearGradient></defs>';o+='<g transform="translate(60 120) scale('+p.big+') translate(-60 -120)">';
 if(st=="long")o+=P("M30 50Q22 100 38 106L82 106Q98 100 90 50Z",hc);
 o+=P("M12 120Q14 90 46 86H74Q106 90 108 120Z",'url(#cl'+u+')')+P("M50 86L60 102L70 86Z","#eee")+R(52,76,16,14,s,' rx="4"')+R(52,76,16,14,"#000",' rx="4" opacity=".14"')+C(33,54,4.5,s)+C(87,54,4.5,s)+'<ellipse cx="60" cy="52" rx="27" ry="31" fill="url(#sk'+u+')"/><path d="M34 60Q36 82 60 84Q84 82 86 60Q82 74 60 76Q38 74 34 60Z" fill="#000" opacity=".09"/>';
 [49,71].forEach(function(x){o+='<ellipse cx="'+x+'" cy="52" rx="5" ry="'+d.e+'" fill="#fff"/>'+C(x+d.p,52,Math.min(2.4,d.e-.4),k)+C(x+d.p-.8,51.1,.85,"#fff")+'<path d="M'+(x-5.4)+' '+(52-d.e+.5)+'Q'+x+' '+(52-d.e-1.8)+' '+(x+5.4)+' '+(52-d.e+.5)+'" stroke="#000" stroke-opacity=".34" stroke-width="1.2" fill="none"/>'});
 o+='<path d="M'+d.bl[0]+' '+d.bl[1]+'L'+d.bl[2]+' '+d.bl[3]+'M'+d.br[0]+' '+d.br[1]+'L'+d.br[2]+' '+d.br[3]+'" stroke="'+bc+'" stroke-width="2.8" stroke-linecap="round" fill="none"/>';
 o+='<path d="M60 54Q57 62 61 63" stroke="#000" stroke-opacity=".28" stroke-width="1.6" stroke-linecap="round" fill="none"/>';
 if(m=="angry")o+='<ellipse cx="41" cy="63" rx="5" ry="3" fill="#e05a4a" opacity=".35"/><ellipse cx="79" cy="63" rx="5" ry="3" fill="#e05a4a" opacity=".35"/>';
 if(p.ac=="beard")o+=P("M34 58Q36 90 60 92Q84 90 86 58Q78 78 60 78Q42 78 34 58Z",hc);
 o+='<path d="'+d.m+'" stroke="#6a2b2b" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
 if(m=="sad")o+=P("M46 58Q49 64 46 67Q43 64 46 58Z","#7fd6ff");
 if(m=="nervous")o+=P("M88 34Q92 42 88 47Q84 42 88 34Z","#7fd6ff");
 if(st=="short"||st=="bun"||st=="long"||st=="curly")o+=P("M33 50Q30 20 60 19Q90 20 87 50Q80 34 60 33Q40 34 33 50Z",hc);
 if(st=="side")o+=P("M32 52Q28 18 62 18Q92 20 88 46Q70 30 46 36Q38 40 32 52Z",hc);
 if(st=="bun")o+=C(60,14,9,hc);
 o+='<path d="M34 50Q60 38 86 50Q78 41 60 40Q42 41 34 50Z" fill="#000" opacity=".1"/><path d="M41 29Q60 20 80 30" stroke="#fff" stroke-opacity=".17" stroke-width="3" stroke-linecap="round" fill="none"/>';
 if(st=="curly")[[36,40],[42,26],[54,20],[66,20],[78,26],[84,40]].forEach(function(q){o+=C(q[0],q[1],11,hc)});
 var a=p.ac;
 if(a=="glasses")o+='<circle cx="49" cy="52" r="8" fill="#fff" fill-opacity=".12" stroke="#222" stroke-width="2"/><circle cx="71" cy="52" r="8" fill="#fff" fill-opacity=".12" stroke="#222" stroke-width="2"/><path d="M57 52H63" stroke="#222" stroke-width="2"/>';
 if(a=="hat")o+='<ellipse cx="60" cy="30" rx="37" ry="7" fill="#2b2b33"/>'+P("M38 30Q40 8 60 8Q80 8 82 30Z","#2b2b33")+R(38,24,44,5,"#8a2b2b");
 if(a=="cap"||a=="captain"){o+=P("M32 34Q34 12 60 12Q86 12 88 34Z",a=="cap"?"#27384a":"#f5f5f0")+P("M30 34Q60 40 96 34L96 38Q60 44 30 38Z","#14202c")+C(60,22,3.2,"#e3b95c");if(a=="captain")o+=R(32,28,56,6,"#1c2b4a")}
 if(a=="chef")o+=P("M36 30Q28 14 42 12Q46 0 60 4Q74 0 78 12Q92 14 84 30Z","#fff",' stroke="#ddd"')+R(36,28,48,5,"#ddd");
 if(a=="headset")o+='<path d="M33 48Q32 14 60 14Q88 14 87 48" stroke="#222" stroke-width="5" fill="none"/>'+R(28,46,8,16,"#222",' rx="3"')+R(84,46,8,16,"#222",' rx="3"')+'<path d="M34 62Q38 76 52 76" stroke="#222" stroke-width="3" fill="none"/>'+C(53,76,3,"#222");
 return o+'</g></svg>'}

function person(l){var m=/^(?:Talk to|Question|Speak to|Chat with|Confront|Ask)\s+(.+?)(?:,|\s+with\b|\s+about\b|$)/.exec(l);return m?m[1]:null}
function owners(cs){var S=cs.S,hub=S[cs.hub],out={};if(!hub)return out;
 (hub.c||[]).forEach(function(ch){var name=person(ch[0]),root=ch[1];if(!name||!S[root]||/^(ac_|end_)/.test(root)||root=="accuse")return;
  var seen={},q=[root],em=S[root].i||"";
  while(q.length){var id=q.shift(),s=S[id];if(seen[id]||id==cs.hub||id=="accuse"||!s||s.e)continue;seen[id]=1;
   if(!out[id])out[id]={name:name,emoji:em,root:id==root};
   (s.c||[]).forEach(function(x){q.push(x[1])});(s.r||[]).forEach(function(x){q.push(x[1])});
   if(s.g)s.g.slice(1).forEach(function(x){q.push(x[1])})}})
 return out}

function mood(sc,own){var L=(sc.f||"").split(","),t=sc.t||"";
 if(/prove it|on what evidence|do you have anything/i.test(t))return "smug";
 if(/tears|cries|sob|crumples|eyes fill|lip trembles/i.test(t))return "sad";
 if(L.some(function(x){return /(gone|closed|burnt|cleared)$/.test(x.trim())})||/storm|slam|glare|turns? (his|her)? ?back|walks? out|refuses|locks|snaps?|shuts|stalks|erupt|get off/i.test(t))return "angry";
 if(/pale|goes still|goes white|go(es)? quiet|tremble|shak|cannot explain|too (quickly|fast|lightly|easy)|tugs|flush|drain|freezes|hides|hand drifts|stops smiling|swallow/i.test(t)||L.indexOf("slip")>=0)return "nervous";
 return own.root?"neutral":"soft"}

window.CFFace={
 owner:function(cs,id){var c=cache[cs.id]||(cache[cs.id]=owners(cs));return c[id]||null},
 mood:mood,
 html:function(own,m,cs,shift){var ov=cs.art&&cs.art.people&&cs.art.people[own.name],p=params(own.name,own.emoji,ov);
  return '<div class="portrait m-'+m+(shift?' shift':'')+'">'+face(p,m,own.name)+'</div><div class="plate m-'+m+'"><b>'+esc(own.name)+'</b><i>'+LBL[m]+'</i></div>'}
};
})();
