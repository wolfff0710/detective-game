(function(){
"use strict";
var C=window.CASES||[],app=document.getElementById("app"),cs,ci,fl,notes,editing=false,tw=null,
RANK=["Rookie","Constable","Inspector","Chief Inspector","Legend"],
LOGO='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fb8aa"/><stop offset="1" stop-color="#e3b95c"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#0a1114"/><circle cx="28" cy="28" r="15" fill="#121c20" stroke="url(#g)" stroke-width="4"/><path d="M19 31c0-6 4-10 9-10s9 4 9 10M22.5 33c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5M26 35c0-2.5.8-4 2-4s2 1.5 2 4" fill="none" stroke="#5fb8aa" stroke-width="2" stroke-linecap="round"/><path d="M39 39l14 14" stroke="#e3b95c" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="14" r="4" fill="#d4574b"/></svg>';
function g(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function has(r){if(!r)return true;return r.split("|").some(function(p){return p.split(",").every(function(x){x=x.trim();return x[0]=="!"?!fl[x.slice(1)]:!!fl[x]})})}
function setf(s){if(s)s.split(",").forEach(function(x){fl[x.trim()]=1})}
function got(c){try{return JSON.parse(localStorage.getItem("cf2_"+c.id))||[]}catch(e){return[]}}
function total(c){return Object.keys(c.S).filter(function(k){return c.S[k].e&&!c.S[k].s}).length}
function nsf(c){return got(c).filter(function(x){return !c.S[x]||!c.S[x].s}).length}
function sf(c){return got(c).length-nsf(c)}
function wins(c){return got(c).some(function(x){return c.S[x]&&c.S[x].k=="win"})}
function prof(){try{return JSON.parse(localStorage.getItem("cf2_profile"))||{}}catch(e){return{}}}
function toast(m){var t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},1700)}
function say(m){g("live").textContent=m}
function stopType(){if(tw){clearInterval(tw.id);tw=null}}
function skipType(){if(tw){clearInterval(tw.id);tw.el.textContent=tw.t;tw=null}}
function typeIn(el,t){stopType();if(matchMedia("(prefers-reduced-motion:reduce)").matches){el.textContent=t;return}var i=0;tw={el:el,t:t,id:setInterval(function(){i+=3;if(i>=t.length)skipType();else el.textContent=t.slice(0,i)},14)}}
function confetti(){var d=document.createElement("div");d.className="cf";for(var i=0;i<36;i++){var s=document.createElement("span");s.textContent=["🎉","✨","🔍","⭐","💎"][i%5];s.style.left=Math.random()*100+"%";s.style.animationDelay=Math.random()*.8+"s";s.style.fontSize=(16+Math.random()*18)+"px";d.appendChild(s)}document.body.appendChild(d);setTimeout(function(){d.remove()},3500)}
function stamp(t,c){var d=document.createElement("div");d.className="bigstamp "+c;d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2400)}
function flash(){var q=document.createElement("div");q.className="fl";document.body.appendChild(q);setTimeout(function(){q.remove()},600)}
function renderProf(){var p=prof(),e=editing,n=C.filter(wins).length,r=RANK[Math.min(n,RANK.length-1)],en=C.reduce(function(t,c){return t+got(c).length},0),h;
 if(e||!p.name){h='<h2>Your detective profile</h2><div class="fields"><label>Name<input id="pn" maxlength="30" value="'+esc(p.name)+'"></label><label>Title or job<input id="pt" maxlength="40" value="'+esc(p.title)+'"></label><label>Motto<input id="pm" maxlength="60" value="'+esc(p.motto)+'"></label></div><p class="mute">Saved only in this browser. Avoid private details.</p><div class="btns"><button data-save="1">Save profile</button>'+(p.name?'<button data-cancel="1">Cancel</button>':'')+'</div>'}
 else{h='<div class="me"><div class="av">'+esc(p.name.charAt(0).toUpperCase())+'</div><div class="info"><b>'+esc(p.name)+'</b> <span class="mute">'+r+'</span><i>'+esc(p.title)+'</i>'+(p.motto?'<i>“'+esc(p.motto)+'”</i>':'')+'<span class="mute">Cases solved '+n+' of '+C.length+'. Endings found '+en+'.</span></div><button data-edit="1">Edit</button></div>'}
 g("pp").innerHTML=h;g("pb").textContent=p.name?p.name.charAt(0).toUpperCase():"?"}
function home(){stopType();cs=null;var h='<div class="brand">'+LOGO+'<h1>Case Files</h1></div><p class="lead">Every choice branches the story. Question suspects, search rooms, and decide how hard to push: some doors close for good. Find every ending.</p><div class="folders">';
 C.forEach(function(c,i){h+='<button class="folder" data-c="'+i+'" style="animation-delay:'+(i*80)+'ms"><div class="fi">'+c.icon+'</div><h3>'+c.title+'</h3><p>'+c.place+'</p><p>Difficulty: '+c.level+'</p><p>Endings found: '+nsf(c)+' of '+total(c)+(sf(c)?' ★ secret found':'')+'</p>'+(wins(c)?'<span class="stamp">SOLVED</span>':'<span class="stamp new">OPEN</span>')+'</button>'});
 app.innerHTML=h+'</div>'}
function openCase(i){stopType();cs=C[i];ci=i;fl={};notes=[];
 app.innerHTML='<div class="top"><button class="back" data-home="1">← All cases</button><button class="back" data-restart="1">↺ Restart</button></div><h1>'+cs.icon+' '+cs.title+'</h1><div class="grid"><section class="panel" id="sc"></section><section class="panel"><h2>Notebook</h2><ul id="notes"></ul><p id="none" class="mute">No clues yet.</p></section></div>';
 window.scrollTo(0,0);go(cs.start)}
function go(id){stopType();var sc=cs.S[id];fl["v_"+id]=1;
 if(sc.r)for(var i=0;i<sc.r.length;i++)if(has(sc.r[i][0]))return go(sc.r[i][1]);
 if(sc.g){var n=sc.g[0].filter(function(x){return fl[x]}).length;for(var j=1;j<sc.g.length;j++)if(n>=sc.g[j][0])return go(sc.g[j][1])}
 setf(sc.f);
 if(sc.n&&notes.indexOf(sc.n)<0){notes.push(sc.n);toast("Clue noted")}
 var u=g("notes");while(u.children.length<notes.length){var li=document.createElement("li");li.textContent=notes[u.children.length];u.appendChild(li)}
 g("none").hidden=notes.length>0;
 if(sc.e)return ending(sc,id);
 var ch=(sc.c||[]).filter(function(c){return has(c[2])});
 if(sc.b)ch=ch.concat([[sc.b==cs.hub?cs.hl:"Go back",sc.b]]);
 g("sc").innerHTML='<div class="ic" aria-hidden="true">'+(sc.i||cs.icon)+'</div><p id="txt" aria-hidden="true"></p><div class="ch">'+ch.map(function(c,k){return '<button class="choice" style="animation-delay:'+(350+k*90)+'ms" data-to="'+c[1]+'" data-set="'+(c[3]||"")+'">'+esc(c[0])+'</button>'}).join("")+'</div>';
 say(sc.t);typeIn(g("txt"),sc.t)}
function ending(sc,id){var d=got(cs);if(d.indexOf(id)<0){d.push(id);try{localStorage.setItem("cf2_"+cs.id,JSON.stringify(d))}catch(e){}}
 if(sc.k=="win"){confetti();stamp(sc.s?"SECRET ENDING":"CASE CLOSED","ok")}else{flash();stamp(sc.k=="weak"?"NO CONVICTION":"WRONG CALL","no")}
 g("sc").innerHTML='<div class="ic" aria-hidden="true">'+(sc.i||"🏁")+'</div><h2>'+esc(sc.e)+'</h2><p class="endt" id="txt" aria-hidden="true"></p><p class="mute">Clues gathered: '+notes.length+'. Endings found: '+nsf(cs)+' of '+total(cs)+(sf(cs)?' plus a secret ★':'')+'.</p>'+(sc.s?'<p class="mute">★ Secret ending unlocked!</p>':'')+'<div class="ch"><button class="choice" data-restart="1">Replay and take a different path</button><button class="choice" data-home="1">All cases</button></div>';
 say(sc.e+". "+sc.t);typeIn(g("txt"),sc.t);renderProf()}
document.addEventListener("click",function(ev){var pp=g("pp");if(!pp.hidden&&!ev.target.closest("#pf"))pp.hidden=true;
 if(ev.target.closest("#txt")){skipType();return}
 var b=ev.target.closest("button");if(!b)return;var d=b.dataset;
 if(d.pt){pp.hidden=!pp.hidden;return}
 if(d.save){try{localStorage.setItem("cf2_profile",JSON.stringify({name:g("pn").value.trim(),title:g("pt").value.trim(),motto:g("pm").value.trim()}))}catch(e){}editing=false;renderProf();return}
 if(d.edit){editing=true;renderProf();return}
 if(d.cancel){editing=false;renderProf();return}
 if(d.c!==undefined){openCase(+d.c);return}
 if(d.home){home();return}
 if(d.restart){openCase(ci);return}
 if(d.to){setf(d.set);go(d.to)}
});
document.addEventListener("pointerout",function(e){var f=e.target.closest&&e.target.closest(".folder");if(f)f.style.transform=""});
document.addEventListener("pointermove",function(e){var f=e.target.closest&&e.target.closest(".folder");if(f){var r=f.getBoundingClientRect();f.style.transform="perspective(600px) rotateY("+(((e.clientX-r.left)/r.width-.5)*14)+"deg) rotateX("+(-((e.clientY-r.top)/r.height-.5)*10)+"deg) translateY(-4px)"}document.body.style.setProperty("--mx",e.clientX+"px");document.body.style.setProperty("--my",e.clientY+"px")});
renderProf();if(!prof().name)g("pp").hidden=false;home();
})();
