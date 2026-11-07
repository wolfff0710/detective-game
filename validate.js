#!/usr/bin/env node
"use strict";
// Usage: node tools/validate.js [--prune]   (--prune deletes flags that are set but never read)
const fs=require("fs"),path=require("path"),vm=require("vm");
const {fmt}=require("./format");
const root=path.join(__dirname,"..");
const dir=path.join(root,"cases");
const prune=process.argv.includes("--prune");
const ctx=vm.createContext({window:{}});
const cases=[],fileOf={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith(".js")).sort()){
  const n=(ctx.window.CASES||[]).length;
  vm.runInContext(fs.readFileSync(path.join(dir,f),"utf8"),ctx,{filename:f});
  (ctx.window.CASES||[]).slice(n).forEach(c=>{cases.push(c);fileOf[c.id]=f});
}
let errors=0,warns=0;
const err=(c,m)=>{errors++;console.error("ERROR ["+c.id+"] "+m)};
const warn=(c,m)=>{warns++;console.warn("warn  ["+c.id+"] "+m)};
const L=s=>(s||"").split(",").map(x=>x.trim()).filter(Boolean);
const atoms=s=>L((s||"").replace(/\|/g,",")).map(x=>x.replace(/^!/,""));

const indexHtml=fs.readFileSync(path.join(root,"index.html"),"utf8");
const seen=new Set();
for(const c of cases){
  if(seen.has(c.id))err(c,"duplicate case id");seen.add(c.id);
  if(!indexHtml.includes("cases/"+fileOf[c.id]))err(c,"cases/"+fileOf[c.id]+" is not loaded by index.html");
  for(const k of ["id","title","icon","place","level","start","hub","hl"])if(!c[k])err(c,"missing field "+k);
  const S=c.S,ids=Object.keys(S);
  if(!S[c.start])err(c,"start scene missing");
  if(!S[c.hub])err(c,"hub scene missing");
  const set=new Set(ids.map(i=>"v_"+i)),read=new Set(),edges={};
  for(const id of ids){
    const s=S[id],out=[];
    const to=t=>{if(!S[t])err(c,id+": unknown target \""+t+"\"");out.push(t)};
    L(s.f).forEach(x=>set.add(x));
    (s.c||[]).forEach(ch=>{to(ch[1]);atoms(ch[2]).forEach(a=>read.add(a));L(ch[3]).forEach(x=>set.add(x))});
    if(s.b)to(s.b);
    (s.r||[]).forEach(r=>{atoms(r[0]).forEach(a=>read.add(a));to(r[1])});
    if(s.g){s.g[0].forEach(x=>read.add(x));s.g.slice(1).forEach(x=>to(x[1]))}
    if(s.r&&s.r[s.r.length-1][0]!=="")err(c,id+": router has no unconditional last branch");
    if(s.g&&s.g[s.g.length-1][0]!==0)err(c,id+": score router has no threshold 0");
    if(s.e){if(!s.k)err(c,id+": ending without k (win/weak/fail)")}
    else{
      if(!s.c&&!s.b&&!s.r&&!s.g)err(c,id+": dead end (no c, b, r or g)");
      else if(s.c&&!s.b&&!s.r&&!s.g&&s.c.every(x=>x[2]))warn(c,id+": every choice is conditional and no back link; can dead-end");
    }
    edges[id]=out;
  }
  for(const a of read)if(!set.has(a))err(c,"flag \""+a+"\" is read but never set");
  const reach=new Set([c.start]),q=[c.start];
  while(q.length)for(const t of edges[q.shift()]||[])if(S[t]&&!reach.has(t)){reach.add(t);q.push(t)}
  ids.filter(i=>!reach.has(i)).forEach(i=>err(c,"scene \""+i+"\" is unreachable from start"));
  if(!ids.some(i=>S[i].k==="win"&&reach.has(i)))err(c,"no reachable winning ending");
  const unread=[...set].filter(x=>!x.startsWith("v_")&&!read.has(x));
  if(unread.length){
    if(prune){
      for(const id of ids){if(!S[id].f)continue;const keep=L(S[id].f).filter(x=>!unread.includes(x));if(keep.length)S[id].f=keep.join(",");else delete S[id].f}
      fs.writeFileSync(path.join(dir,fileOf[c.id]),fmt(c));
      console.log("pruned ["+c.id+"]: "+unread.join(", "));
    }else warn(c,"flags set but never read: "+unread.join(", "));
  }
}
console.log(cases.length+" cases, "+errors+" errors, "+warns+" warnings");
process.exit(errors?1:0);
