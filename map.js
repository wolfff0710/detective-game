/* fx/map.js — floor-plan tab on the Board: rooms from hub choices, ticks for searched, grey for unvisited, dashed for locked */
(function(){
"use strict";
var last=null,SKIP=/^(Talk|Question|Speak|Chat|Confront|Ask|Make your|Not yet|Offer|Persuade|Take|Quietly|Show|Bluff)/i;
function g(i){return document.getElementById(i)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function clean(l){return cap(l.replace(/^(Examine|Inspect|Search|Check|Visit|Climb to|Read|Review|Restore|Row out to|Go to|Enter|Watch|Step onto|Step into)\s+/i,"").replace(/^(the|a|an)\s+/i,""))}
function wrap(s,n){var l=[""];s.split(" ").forEach(function(w){var c=l[l.length-1];if(c&&(c+" "+w).length>n)l.push(w);else l[l.length-1]=(c+" "+w).trim()});var o=l.slice(0,2);if(l.length>2)o[1]+="…";return o}
function reach(S,t,hub){var seen={},q=[t],ids=[],clues=[];
 while(q.length){var i=q.shift(),s=S[i];if(seen[i]||i==hub||i=="accuse"||!s||s.e)continue;seen[i]=1;ids.push(i);if(s.n)clues.push(i);
  (s.c||[]).forEach(function(x){q.push(x[1])});(s.r||[]).forEach(function(x){q.push(x[1])})}
 return {ids:ids,clues:clues}}
function rooms(cs){var S=cs.S,hub=S[cs.hub],out=[];
 (hub.c||[]).forEach(function(ch){var t=ch[1];if(!S[t]||t=="accuse"||/^(ac_|end_|secret_)/.test(t)||SKIP.test(ch[0])||out.some(function(r){return r.id==t}))return;
  var r=reach(S,t,cs.hub);out.push({id:t,label:clean(ch[0]),cond:ch[2]||"",ids:r.ids,clues:r.clues,icon:S[t].i||"🚪"})});
 return out}
function locked(c){if(!c)return false;var f=c.indexOf("|")>=0?c:c.split(",").map(function(x){return x.trim()}).filter(function(x){return x&&x.indexOf("!v_")!==0}).join(",");return f?!CF.has(f):false}
function render(){var box=g("mapv"),s=CF.state(),cs=s.cs;if(!box||box.hidden||!cs)return;
 var fl=s.fl,R=rooms(cs),n=R.length,pad=12,W=600,rh=104,ch=84,t=Math.ceil(n/2),b=n-t,H=pad*2+(t?rh:0)+ch+(b?rh:0),cy=pad+(t?rh:0),o="",found=0,all=0,here=null,hub=(cs.hl||"Main area").replace(/^(Back to|Return to|Go back to)\s+(the\s+)?/i,"");
 if(!n){box.innerHTML='<p class="empty">No rooms to map in this case.</p>';return}
 R.forEach(function(r){if(r.ids.indexOf(last)>=0)here=r});
 o+='<rect class="hall" x="'+pad+'" y="'+cy+'" width="'+(W-2*pad)+'" height="'+ch+'" rx="8"/><text class="hl" x="'+W/2+'" y="'+(cy+ch/2-(here?2:-6))+'" text-anchor="middle">'+esc(cs.S[cs.hub].i||"")+" "+esc(cap(hub))+'</text>'+(here?'':'<text class="you" x="'+W/2+'" y="'+(cy+ch/2+20)+'" text-anchor="middle">📍 You are here</text>');
 function row(list,y,top){var w=(W-2*pad-(list.length-1)*8)/list.length;
  list.forEach(function(r,i){var x=pad+i*(w+8),lk=locked(r.cond)&&!fl["v_"+r.id],v=!!fl["v_"+r.id],f=r.clues.filter(function(c){return fl["v_"+c]}).length,cl=lk?"l":v?"v":"u",ls=lk?["???"]:wrap(r.label,Math.max(10,Math.floor(w/9)));
   found+=f;all+=r.clues.length;if(here===r)cl+=" y";
   o+='<g class="rm '+cl+'"><rect class="rr" x="'+x+'" y="'+y+'" width="'+w+'" height="'+rh+'" rx="8"/><rect class="dr" x="'+(x+w/2-12)+'" y="'+(top?y+rh-3:y-1)+'" width="24" height="4"/>'+
    '<text class="ri" x="'+(x+w/2)+'" y="'+(y+40)+'" text-anchor="middle">'+(lk?"🔒":r.icon)+'</text>'+
    ls.map(function(x2,k){return '<text class="rl" x="'+(x+w/2)+'" y="'+(y+62+k*15)+'" text-anchor="middle">'+esc(x2)+'</text>'}).join("")+
    (!lk&&r.clues.length?'<text class="rp" x="'+(x+w/2)+'" y="'+(y+rh-9)+'" text-anchor="middle">'+f+'/'+r.clues.length+' clues</text>':"")+
    (v?'<circle class="tk" cx="'+(x+w-15)+'" cy="'+(y+15)+'" r="10"/><path class="tm" d="M'+(x+w-20)+' '+(y+15)+'l4 4 8-9"/>':"")+
    (here===r?'<text class="pin" x="'+(x+14)+'" y="'+(y+20)+'">📍</text>':"")+'</g>'})}
 if(t)row(R.slice(0,t),pad,true);if(b)row(R.slice(t),cy+ch,false);
 box.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Floor plan of '+esc(cs.place)+'">'+o+'</svg><p class="mute">✓ searched · grey = not visited yet · dashed = locked until you find a lead</p>';
 var bs=g("bstat");if(bs)bs.textContent=found+" of "+all+" clues found across "+n+" locations"}
document.addEventListener("cf:case",function(){var tabs=document.querySelector("#board .tabs"),bd=g("board");if(!tabs||!bd)return;last=null;
 var b=document.createElement("button");b.dataset.view="map";b.textContent="🗺️ Map";tabs.appendChild(b);
 var m=document.createElement("div");m.id="mapv";m.className="mapv";m.hidden=true;bd.appendChild(m)});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".tabs button"),m=g("mapv");if(!b||!m)return;m.hidden=b.dataset.view!="map";render()});
document.addEventListener("cf:scene",function(e){last=e.detail.id;render()});
})();
