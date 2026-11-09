/* fx/lib.js — shared helpers for court / culprit / slip: case analysis + tiny WebAudio sounds. Load after faces.js. */
(function(){
"use strict";
var cache={},ac=null;
function L(s){return (s||"").split(",").map(function(x){return x.trim()}).filter(Boolean)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function sents(t){var s=t.replace(/\b(Dr|Mr|Mrs|Ms|Prof|St)\./g,"$1\u0001"),m=s.match(/[^.!?]+(?:[.!?]+["”]?|$)\s*/g)||[s];return m.map(function(x){return x.replace(/\u0001/g,".").trim()}).filter(Boolean)}
function muted(){try{return localStorage.getItem("cf2_fx")==="0"}catch(e){return false}}
function tone(f,t0,d,type,v){var o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+t0;o.type=type||"sine";o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.05)}
var SND={chime:function(){tone(1318.5,0,.9);tone(1975.5,.12,.9);tone(2637,.26,1.1,"sine",.08)},
 thud:function(){tone(110,0,.35,"sine",.4);tone(70,.02,.4,"triangle",.3)},
 gavel:function(){SND.thud();setTimeout(SND.thud,260)},
 buzz:function(){tone(150,0,.28,"sawtooth",.1)},
 tick:function(){tone(1800,0,.05,"square",.04)}};
function snd(k){if(muted())return;try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;ac=ac||new A();if(ac.state=="suspended")ac.resume();SND[k]()}catch(e){}}

/* who is the culprit? follow the first accuse choice whose ac_* chain reaches a score router (g) */
function culprit(cs){var o=cache[cs.id]||(cache[cs.id]={});if("c" in o)return o.c;var S=cs.S,res=null;
 ((S.accuse||{}).c||[]).some(function(ch){if(!/^ac_/.test(ch[1]))return false;var s=S[ch[1]],n=0;while(s&&!s.g&&n++<4)s=s.r?S[s.r[s.r.length-1][1]]:null;
  if(s&&s.g){var need=Math.min.apply(null,s.g.slice(1).filter(function(x){return S[x[1]]&&S[x[1]].k=="win"&&x[0]>0}).map(function(x){return x[0]}));
   res={name:ch[0].split(",")[0],flags:s.g[0].slice(),need:isFinite(need)?need:Math.ceil(s.g[0].length/2)};return true}return false});
 return (o.c=res)}
/* first scene that sets a flag and carries a clue note */
function clue(cs,flag){var S=cs.S,k;for(k in S)if(S[k].n&&L(S[k].f).indexOf(flag)>=0)return {note:S[k].n,id:k};return null}
/* every flag a clue note sets (a note can prove several things) */
function flagsOf(cs,note){var S=cs.S,k,o=[];for(k in S)if(S[k].n===note)L(S[k].f).forEach(function(x){if(x.indexOf("v_")!==0&&o.indexOf(x)<0)o.push(x)});return o}
function suspects(cs,name){var o=[];((cs.S.accuse||{}).c||[]).forEach(function(ch){var n=ch[0].split(",")[0];if(/^(ac_|end_)/.test(ch[1])&&n!==name&&o.indexOf(n)<0)o.push(n)});return o}
function who(cs,name){var k,o;for(k in cs.S){o=CFFace.owner(cs,k);if(o&&o.name===name)return o}return {name:name,emoji:"",root:true}}
window.CFLib={L:L,esc:esc,sents:sents,snd:snd,culprit:culprit,clue:clue,flagsOf:flagsOf,suspects:suspects,who:who};
})();
