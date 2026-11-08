(function(){
"use strict";
var C=window.CASES||[],STORY=window.STORY||{need:4,leads:{}},app=document.getElementById("app"),cs,ci,fl,notes,cur,left=0,bview="cork",tlShown=0,curW="all",shown=0,editing=false,tw=null,
RANK=["Rookie","Constable","Inspector","Chief Inspector","Legend"],
TITLES=/^(Dr|Mr|Mrs|Ms|Prof|Lady|Captain|Director|Chef|Maestro|Cook)\.?$/,
LOGO='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fb8aa"/><stop offset="1" stop-color="#e3b95c"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#0a1114"/><circle cx="28" cy="28" r="15" fill="#121c20" stroke="url(#g)" stroke-width="4"/><path d="M19 31c0-6 4-10 9-10s9 4 9 10M22.5 33c0-4.5 2.5-7.5 5.5-7.5s5.5 3 5.5 7.5M26 35c0-2.5.8-4 2-4s2 1.5 2 4" fill="none" stroke="#5fb8aa" stroke-width="2" stroke-linecap="round"/><path d="M39 39l14 14" stroke="#e3b95c" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="14" r="4" fill="#d4574b"/></svg>';
function g(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function has(r){if(!r)return true;return r.split("|").some(function(p){return p.split(",").every(function(x){x=x.trim();return x[0]=="!"?!fl[x.slice(1)]:!!fl[x]})})}
function setf(s){if(s)s.split(",").forEach(function(x){fl[x.trim()]=1})}
function rd(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function st(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function got(c){return rd("cf2_"+c.id,[])}
function prof(){return rd("cf2_profile",{})}
function leads(){return rd("cf2_leads",[])}
function ach(){return rd("cf2_ach",[])}
function att(c){return rd("cf2_att_"+c.id,0)}
function nLeads(){return Object.keys(STORY.leads).length}
function byId(id){return C.filter(function(x){return x.id==id})[0]}
function worldOf(c){var W=STORY.worlds||[];for(var i=0;i<W.length;i++)if(W[i].cases.indexOf(c.id)>=0)return W[i];return {id:"x",name:"",icon:"",color:"#5fb8aa"}}
function lockMsg(c){var gt=(STORY.gate||{})[c.id];if(!gt)return"";if(gt.win){var t=byId(gt.win);return t&&wins(t)?"":"Beat “"+(t?t.title:gt.win)+"” to open the Rift."}var lv=leads();if(lv.length>=gt.leads)return"";return"Solve all "+gt.leads+" connected cases first. Still to solve: "+C.filter(function(x){return STORY.leads[x.id]&&lv.indexOf(x.id)<0}).map(function(x){return x.title}).join(", ")}
function locked(c){return !!lockMsg(c)}
function addLead(id){var l=leads();if(l.indexOf(id)>=0)return false;l.push(id);st("cf2_leads",l);return true}
function total(c){return Object.keys(c.S).filter(function(k){return c.S[k].e&&!c.S[k].s}).length}
function nsf(c){return got(c).filter(function(x){return !c.S[x]||!c.S[x].s}).length}
function sf(c){return got(c).length-nsf(c)}
function wins(c){return got(c).some(function(x){return c.S[x]&&c.S[x].k=="win"})}
var ACH=[
{id:"first",n:"First Case Closed",i:"🔍",d:"Win any case.",t:function(){return C.some(wins)}},
{id:"master",n:"Master Detective",i:"🏆",d:"Reach a Master Detective ending.",t:function(){return C.some(function(c){return got(c).indexOf("win_master")>=0})}},
{id:"peace",n:"Peacemaker",i:"🕊️",d:"Find a secret ending.",t:function(){return C.some(function(c){return sf(c)>0})}},
{id:"gentle",n:"Gentle Touch",i:"🤝",d:"Win without shutting anyone down.",ev:"gentle"},
{id:"first_try",n:"First-Attempt Solve",i:"⚡",d:"Win a case on your first attempt.",ev:"first"},
{id:"complete",n:"Case Complete",i:"📁",d:"Find every ending in one case.",t:function(){return C.some(function(c){return total(c)>0&&nsf(c)>=total(c)&&sf(c)>0})}},
{id:"five",n:"Five Down",i:"⭐",d:"Win 5 cases.",t:function(){return C.filter(wins).length>=5}},
{id:"allsecret",n:"Found Every Secret Ending",i:"🗝️",d:"Find the secret ending in every case.",t:function(){return C.length>0&&C.every(function(c){return sf(c)>0})}},
{id:"sweep",n:"Clean Sweep",i:"🎖️",d:"Win every case.",t:function(){return C.length>0&&C.every(wins)}},
{id:"speed",n:"Beat the Clock",i:"⏱️",d:"Win a timed case with 3 or more moves to spare.",ev:"speed"},
{id:"chrono",n:"Chronologist",i:"🕒",d:"Build a timeline of 5 or more timestamped clues.",ev:"chrono"},
{id:"rift",n:"Rift Walker",i:"🌀",d:"Win a case in the Rift.",t:function(){return C.some(function(c){return worldOf(c).id=="rift"&&wins(c)})}},
{id:"travel",n:"Multiverse Traveller",i:"🌌",d:"Win a case in every universe.",t:function(){var W=STORY.worlds||[];return W.length>0&&W.every(function(w){return w.cases.some(function(id){var c=byId(id);return c&&wins(c)})})}},
{id:"boss",n:"Raven Down",i:"👑",d:"Beat the final case.",t:function(){return C.some(function(c){return c.boss&&wins(c)})}}
];
function checkAch(ev){var have=ach(),add=[];ACH.forEach(function(a){if(have.indexOf(a.id)>=0)return;if(a.ev?!!(ev&&ev[a.ev]):a.t()){have.push(a.id);add.push(a)}});
 if(add.length){st("cf2_ach",have);add.forEach(function(a,k){setTimeout(function(){toast("🏅 "+a.n)},700+k*1900)})}}
function toast(m){var t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},1700)}
function say(m){g("live").textContent=m}
function stopType(){if(tw){clearInterval(tw.id);tw=null}}
function skipType(){if(tw){clearInterval(tw.id);tw.el.textContent=tw.t;tw=null}}
function typeIn(el,t){stopType();if(matchMedia("(prefers-reduced-motion:reduce)").matches){el.textContent=t;return}var i=0;tw={el:el,t:t,id:setInterval(function(){i+=3;if(i>=t.length)skipType();else el.textContent=t.slice(0,i)},14)}}
function confetti(){var d=document.createElement("div");d.className="cf";for(var i=0;i<36;i++){var s=document.createElement("span");s.textContent=["🎉","✨","🔍","⭐","💎"][i%5];s.style.left=Math.random()*100+"%";s.style.animationDelay=Math.random()*.8+"s";s.style.fontSize=(16+Math.random()*18)+"px";d.appendChild(s)}document.body.appendChild(d);setTimeout(function(){d.remove()},3500)}
function stamp(t,c){var d=document.createElement("div");d.className="bigstamp "+c;d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2400)}
function flash(){var q=document.createElement("div");q.className="fl";document.body.appendChild(q);setTimeout(function(){q.remove()},600)}
function names(c){var s={};Object.keys(c.S).forEach(function(k){(c.S[k].c||[]).forEach(function(ch){if(/^(ac_|end_)/.test(ch[1]))ch[0].split(",")[0].split(/\s+/).forEach(function(w){if(/^[A-Z][a-z]/.test(w)&&!TITLES.test(w))s[w]=1})})});return Object.keys(s)}
function links(list){var e=[],seen={};names(cs).forEach(function(n){var re=new RegExp("\\b"+n+"\\b"),prev=-1;list.forEach(function(t,i){if(re.test(t)){if(prev>=0&&!seen[prev+"-"+i]){seen[prev+"-"+i]=1;e.push([prev,i])}prev=i}})});return e}
function renderBoard(still){var bd=g("board");if(!cs||!bd||bd.hidden)return;if(bview=="tl")return renderTL(still);var p=g("pins"),sv=g("strings"),ck=g("cork"),from=still?notes.length:shown,L=links(notes),pts=[],i,el,d="",nk=0,pl=notes.length-from;
 p.innerHTML=notes.length?notes.map(function(t,i){var nw=i>=from;return '<div class="pin'+(nw?' new':'')+'" data-i="'+i+'" style="--r:'+(((i*37)%9-4)*.8)+'deg;--d:'+(nw?(i-from)*110:0)+'ms"><i class="tack"></i><span>'+esc(t)+'</span></div>'}).join(""):'<p class="empty">Gather clues to pin them here.</p>';
 for(i=0;i<notes.length;i++){el=p.children[i];pts.push([p.offsetLeft+el.offsetLeft+el.offsetWidth/2,p.offsetTop+el.offsetTop+8])}
 L.forEach(function(e,k){var a=pts[e[0]],b=pts[e[1]],my=Math.max(a[1],b[1])+30+Math.abs(a[0]-b[0])*.06,nw=Math.max(e[0],e[1])>=from,dl=nw?(pl>0?pl*110:0)+350+(nk++)*130:0;
  d+='<path pathLength="1" class="'+(nw?'new':'')+'" data-a="'+e[0]+'" data-b="'+e[1]+'" style="--d:'+dl+'ms;--s:-'+(k*1.3).toFixed(1)+'s" d="M'+a[0]+" "+a[1]+" Q"+(a[0]+b[0])/2+" "+my+" "+b[0]+" "+b[1]+'"/>'});
 sv.setAttribute("width",ck.clientWidth);sv.setAttribute("height",ck.clientHeight);sv.innerHTML=d;
 g("bstat").textContent=notes.length+" clue"+(notes.length==1?"":"s")+" pinned, "+L.length+" string"+(L.length==1?"":"s");
 shown=notes.length}
function tparse(t){var m=t.match(/\b(\d{1,2}):(\d{2})\s?(AM|PM)?\b/i),h,mi,ap,lit=false;
 if(m){h=+m[1];mi=+m[2];ap=m[3]&&m[3].toUpperCase();lit=/^0\d/.test(m[1])||h>12}
 else{m=t.match(/\b(\d{1,2})\s?(AM|PM)\b/i);if(m){h=+m[1];mi=0;ap=m[2].toUpperCase()}else if(/\bmidnight\b/i.test(t))return{m:0,l:"midnight"};else return null}
 if(ap)h=h%12+(ap=="PM"?12:0);else if(!lit&&h>=6)h=h%12+12;
 return{m:h*60+mi,l:m[0].trim()}}
function renderTL(still){var el=g("tl"),its=[],out="",from=still?notes.length:tlShown,nn=0,prev=null,nm=names(cs);
 notes.forEach(function(t,i){var p=tparse(t);if(p)its.push({i:i,m:p.m,l:p.l,t:t})});
 if(its.some(function(x){return x.m>=1020}))its.forEach(function(x){if(x.m<360)x.m+=1440});
 its.sort(function(a,b){return a.m-b.m||a.i-b.i});
 its.forEach(function(x,k){var nw=x.i>=from,gp=prev===null?0:x.m-prev,chips=nm.filter(function(n){return new RegExp("\\b"+n+"\\b").test(x.t)}).map(function(n){return "<em>"+esc(n)+"</em>"}).join("");
  if(gp>=45)out+='<div class="tl-gap"><span>⏳ '+(gp>=60?Math.floor(gp/60)+"h ":"")+(gp%60?gp%60+"m ":"")+'with no recorded clue</span></div>';
  out+='<div class="tl-item'+(k%2?" r":"")+(nw?" new":"")+'" style="--d:'+(nw?(nn++)*140:0)+'ms"><span class="tl-dot"></span><div class="tl-time">'+esc(x.l)+'</div><div class="tl-card">'+esc(x.t)+(chips?'<div class="chips">'+chips+'</div>':'')+'</div></div>';prev=x.m});
 el.innerHTML=its.length?'<div class="tl-line"></div>'+out:'<p class="empty">Clues that mention a time appear here in order.</p>';
 g("bstat").textContent=its.length+" of "+notes.length+" clues have a timestamp";tlShown=notes.length;
 if(its.length>=5)checkAch({chrono:true})}
function warp(c,fn){if(matchMedia("(prefers-reduced-motion:reduce)").matches){fn();return}var w=document.createElement("div");w.className="warp";w.style.setProperty("--c",worldOf(c).color);document.body.appendChild(w);setTimeout(fn,430);setTimeout(function(){w.remove()},1100)}
function hud(){var h=g("clk");if(!h)return;if(!cs.moves){h.hidden=true;return}h.hidden=false;h.className="clock"+(left<=2?" low":"");h.innerHTML='<span>⏱ '+left*cs.step+' min '+esc(cs.tl)+'</span><i><b style="width:'+Math.round(left/cs.moves*100)+'%"></b></i>'}
function renderProf(){var p=prof(),e=editing,n=C.filter(wins).length,r=RANK[Math.min(n,RANK.length-1)],en=C.reduce(function(t,c){return t+got(c).length},0),h,hv=ach();
 if(e||!p.name){h='<h2>Your detective profile</h2><div class="fields"><label>Name<input id="pn" maxlength="30" value="'+esc(p.name)+'"></label><label>Title or job<input id="pt" maxlength="40" value="'+esc(p.title)+'"></label><label>Motto<input id="pm" maxlength="60" value="'+esc(p.motto)+'"></label></div><p class="mute">Saved only in this browser. Avoid private details.</p><div class="btns"><button data-save="1">Save profile</button>'+(p.name?'<button data-cancel="1">Cancel</button>':'')+'</div>'}
 else{h='<div class="me"><div class="av">'+esc(p.name.charAt(0).toUpperCase())+'</div><div class="info"><b>'+esc(p.name)+'</b> <span class="mute">'+r+'</span><i>'+esc(p.title)+'</i>'+(p.motto?'<i>“'+esc(p.motto)+'”</i>':'')+'<span class="mute">Cases solved '+n+' of '+C.length+'. Endings found '+en+'.</span></div><button data-edit="1">Edit</button></div>'
 +'<p class="mute">🪶 Raven file: '+leads().length+' of '+nLeads()+' leads</p><h2 class="bh">Badges '+hv.length+' of '+ACH.length+'</h2><div class="badges">'+ACH.map(function(a){var on=hv.indexOf(a.id)>=0;return '<div class="badge'+(on?'':' off')+'"><span>'+(on?a.i:"🔒")+'</span><b>'+esc(a.n)+'</b><small>'+esc(a.d)+'</small></div>'}).join("")+'</div>'}
 g("pp").innerHTML=h;g("pb").textContent=p.name?p.name.charAt(0).toUpperCase():"?"}
function orb(w){var l=w?w.cases.map(byId).filter(Boolean):C,n=l.filter(wins).length;return '<button class="orb'+((w?w.id:"all")==curW?" on":"")+'" data-w="'+(w?w.id:"all")+'" style="--c:'+(w?w.color:"#5fb8aa")+'"><span class="oi">'+(w?w.icon:"✨")+'</span><b>'+(w?w.name:"All")+'</b><small>'+n+' of '+l.length+' solved</small></button>'}
function home(){stopType();cs=null;app.style.removeProperty("--acc");renderProf();var lv=leads(),W=STORY.worlds||[],cw=W.filter(function(w){return w.id==curW})[0],list=cw?cw.cases.map(byId).filter(Boolean):C,
 h='<div class="brand">'+LOGO+'<h1>Case Files</h1></div><p class="lead">Every choice branches the story. Question suspects, search rooms, and decide how hard to push: some doors close for good. Find every ending.</p><p class="mute rf">🪶 Raven file: '+lv.length+' of '+nLeads()+' leads. '+(lv.length>=STORY.need?'The final case is open.':'Solve the '+(STORY.need-lv.length)+' remaining connected cases (marked 🪶) to unlock the final case.')+'</p><div class="mv"><div class="orbs">'+orb(null)+W.map(orb).join("")+'</div><p class="wdesc"'+(cw?' style="--c:'+cw.color+'"':'')+'>'+(cw?cw.icon+' <b>'+esc(cw.name)+'</b>. '+esc(cw.desc):'The multiverse holds '+W.length+' universes and '+C.length+' cases. Pick a universe to travel there.')+'</p></div><div class="folders">';
 list.forEach(function(c,i){var lk=lockMsg(c),ld=STORY.leads[c.id],wd=worldOf(c);h+='<button class="folder'+(lk?' locked':'')+'" data-c="'+C.indexOf(c)+'" style="animation-delay:'+(i*80)+'ms;border-top-color:'+wd.color+'"><div class="fi">'+(lk?'🔒':c.icon)+'</div><h3>'+c.title+'</h3><p>'+c.place+'</p><p>'+wd.icon+' '+wd.name+' · '+c.level+(c.moves?' · ⏱ '+c.moves*c.step+' min':'')+'</p>'+(lk?'<p>'+esc(lk)+'</p>':'<p>Endings found: '+nsf(c)+' of '+total(c)+(sf(c)?' ★ secret found':'')+'</p>')+(ld?'<p>🪶 Connected to the final case: '+(lv.indexOf(c.id)>=0?'solved':'not yet')+'</p>':'')+(lk?'<span class="stamp new">LOCKED</span>':wins(c)?'<span class="stamp">SOLVED</span>':'<span class="stamp new">OPEN</span>')+'</button>'});
 app.innerHTML=h+'</div>'}
function openCase(i){stopType();cs=C[i];ci=i;fl={};notes=[];shown=0;tlShown=0;bview="cork";cur=null;left=cs.moves||0;app.style.setProperty("--acc",worldOf(cs).color);st("cf2_att_"+cs.id,att(cs)+1);
 if(cs.boss)leads().forEach(function(id){var L=STORY.leads[id];if(L){fl["lead_"+id]=1;notes.push(L.n)}});
 app.innerHTML='<div class="top"><button class="back" data-home="1">← All cases</button><button class="back" data-restart="1">↺ Restart</button></div><h1>'+cs.icon+' '+cs.title+'</h1><div class="grid"><section class="panel" id="sc"></section><section class="panel"><div class="clock" id="clk" hidden></div><h2>Notebook</h2><button class="bbtn" data-board="1">📌 Board &amp; timeline</button><ul id="notes"></ul><p id="none" class="mute">No clues yet.</p></section></div><section class="panel board" id="board" hidden><div class="tabs"><button class="on" data-view="cork">📌 Evidence board</button><button data-view="tl">🕒 Timeline</button></div><p class="mute" id="bstat"></p><div class="cork" id="cork"><svg id="strings" aria-hidden="true"></svg><div id="pins"></div></div><div class="tline" id="tl" hidden></div></section>';
 window.scrollTo(0,0);go(cs.start)}
function go(id){stopType();var sc=cs.S[id];fl["v_"+id]=1;
 if(sc.r)for(var i=0;i<sc.r.length;i++)if(has(sc.r[i][0]))return go(sc.r[i][1]);
 if(sc.g){var n=sc.g[0].filter(function(x){return fl[x]}).length;for(var j=1;j<sc.g.length;j++)if(n>=sc.g[j][0])return go(sc.g[j][1])}
 setf(sc.f);
 if(sc.n&&notes.indexOf(sc.n)<0){notes.push(sc.n);toast("Clue noted")}
 var u=g("notes");while(u.children.length<notes.length){var li=document.createElement("li");li.textContent=notes[u.children.length];u.appendChild(li)}
 g("none").hidden=notes.length>0;renderBoard();cur=sc;hud();
 if(sc.e)return ending(sc,id);
 var ch=(sc.c||[]).filter(function(c){return has(c[2])});
 if(sc.b)ch=ch.concat([[sc.b==cs.hub?cs.hl:"Go back",sc.b]]);
 g("sc").innerHTML='<div class="ic" aria-hidden="true">'+(sc.i||cs.icon)+'</div><p id="txt" aria-hidden="true"></p><div class="ch">'+ch.map(function(c,k){return '<button class="choice" style="animation-delay:'+(350+k*90)+'ms" data-to="'+c[1]+'" data-set="'+(c[3]||"")+'">'+esc(c[0])+'</button>'}).join("")+'</div>';
 say(sc.t);typeIn(g("txt"),sc.t)}
function ending(sc,id){var d=got(cs),co=STORY.leads[cs.id],win=sc.k=="win",nl=false,clean;
 if(d.indexOf(id)<0){d.push(id);st("cf2_"+cs.id,d)}
 if(win&&co)nl=addLead(cs.id);
 if(win){confetti();stamp(sc.s?"SECRET ENDING":"CASE CLOSED","ok")}else{flash();stamp(sc.k=="weak"?"NO CONVICTION":"WRONG CALL","no")}
 g("sc").innerHTML='<div class="ic" aria-hidden="true">'+(sc.i||"🏁")+'</div><h2>'+esc(sc.e)+'</h2><p class="endt" id="txt" aria-hidden="true"></p>'+(win&&co?'<p class="coda"><b>Raven file.</b> '+esc(co.coda)+(nl?' <em>New lead added: '+leads().length+' of '+nLeads()+'.</em>':'')+'</p>':'')+'<p class="mute">Clues gathered: '+notes.length+'. Endings found: '+nsf(cs)+' of '+total(cs)+(sf(cs)?' plus a secret ★':'')+'.</p>'+(sc.s?'<p class="mute">★ Secret ending unlocked!</p>':'')+'<div class="ch"><button class="choice" data-restart="1">Replay and take a different path</button><button class="choice" data-home="1">All cases</button></div>';
 say(sc.e+". "+sc.t);typeIn(g("txt"),sc.t);renderProf();
 clean=!Object.keys(fl).some(function(k){return k.indexOf("v_")!==0&&/(gone|closed|burnt)$/.test(k)});
 checkAch({gentle:win&&clean,first:win&&att(cs)===1,speed:win&&!!cs.moves&&left>=3});
 if(nl&&leads().length==STORY.need)setTimeout(function(){toast("🪶 Final case unlocked")},2600)}
document.addEventListener("click",function(ev){var pp=g("pp");if(!pp.hidden&&!ev.target.closest("#pf"))pp.hidden=true;
 if(ev.target.closest("#txt")){skipType();return}
 var b=ev.target.closest("button");if(!b)return;var d=b.dataset;
 if(d.pt){pp.hidden=!pp.hidden;return}
 if(d.save){st("cf2_profile",{name:g("pn").value.trim(),title:g("pt").value.trim(),motto:g("pm").value.trim()});editing=false;renderProf();return}
 if(d.edit){editing=true;renderProf();return}
 if(d.cancel){editing=false;renderProf();return}
 if(d.view){bview=d.view;g("cork").hidden=bview!="cork";g("tl").hidden=bview!="tl";Array.prototype.forEach.call(document.querySelectorAll(".tabs button"),function(x){x.classList.toggle("on",x.dataset.view==bview)});shown=0;tlShown=0;renderBoard();return}
 if(d.w){curW=d.w;home();return}
 if(d.board){var bd=g("board");bd.hidden=!bd.hidden;if(!bd.hidden){shown=0;tlShown=0}renderBoard();if(!bd.hidden)bd.scrollIntoView({block:"start"});return}
 if(d.c!==undefined){var k=C[+d.c],lm=lockMsg(k);if(lm){toast("🔒 "+lm);return}warp(k,function(){openCase(+d.c)});return}
 if(d.home){home();return}
 if(d.restart){openCase(ci);return}
 if(d.to){if(cs.moves&&d.to!==cs.hub&&d.to!=="accuse"&&cur!==cs.S.accuse&&!(cur&&d.to===cur.b)){if(left<=0){go("timeout");return}left--}setf(d.set);go(d.to)}
});
window.addEventListener("resize",function(){renderBoard(true)});
document.addEventListener("mouseover",function(e){var sv=g("strings");if(!sv)return;var pn=e.target.closest&&e.target.closest(".pin"),i=pn?pn.dataset.i:null,any=false;
 Array.prototype.forEach.call(sv.querySelectorAll("path"),function(x){var h=pn&&(x.dataset.a==i||x.dataset.b==i);x.classList.toggle("hot",!!h);if(h)any=true});sv.classList.toggle("dim",any)});
document.addEventListener("pointerout",function(e){var f=e.target.closest&&e.target.closest(".folder");if(f)f.style.transform=""});
document.addEventListener("pointermove",function(e){var f=e.target.closest&&e.target.closest(".folder");if(f){var r=f.getBoundingClientRect();f.style.transform="perspective(600px) rotateY("+(((e.clientX-r.left)/r.width-.5)*14)+"deg) rotateX("+(-((e.clientY-r.top)/r.height-.5)*10)+"deg) translateY(-4px)"}var ck=e.target.closest&&e.target.closest("#cork");if(ck){var q=ck.getBoundingClientRect();ck.style.setProperty("--cx",(e.clientX-q.left)+"px");ck.style.setProperty("--cy",(e.clientY-q.top)+"px")}document.body.style.setProperty("--mx",e.clientX+"px");document.body.style.setProperty("--my",e.clientY+"px")});
renderProf();if(!prof().name)g("pp").hidden=false;home();
})();
