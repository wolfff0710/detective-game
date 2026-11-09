/* fx/cover.js — SVG poster on every home-screen case card */
document.addEventListener("cf:home",function(){
 [].forEach.call(document.querySelectorAll(".folder"),function(f){var c=CF.C[+f.dataset.c],fi=f.querySelector(".fi");if(!c||!fi)return;
  var p=document.createElement("div");p.className="poster";
  p.innerHTML=CFArt.flat(CFArt.get(c))+'<span class="pi">'+(f.classList.contains("locked")?"🔒":c.icon)+'</span><span class="lv">'+c.level+'</span>';
  fi.replaceWith(p)})});
