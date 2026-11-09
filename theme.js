/* fx/theme.js — per-world theme: accent, fonts, texture, folder + stamp style. Pairs with theme.css */
(function(){
"use strict";
var ACC={classic:"#5fb8aa",heritage:"#d9a84e",school:"#f29e4c",festive:"#f2a33a",coast:"#3fb6a8",polar:"#7fd6ff",abyss:"#5fe0ff",neo:"#ff4fa3",rift:"#b98cff"},
TEX={classic:"paper",heritage:"velvet",school:"lined",festive:"paper",coast:"concrete",polar:"glass",abyss:"glass",neo:"scan",rift:"scan"};
var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Fredoka:wght@400;600&family=Orbitron:wght@500;700&family=Playfair+Display:wght@500;700&family=Share+Tech+Mono&display=swap";document.head.appendChild(l);
function name(c){var w=CF.worldOf(c).id;return ACC[w]?w:(CFArt.get(c).theme||"classic")}
document.addEventListener("cf:case",function(){var cs=CF.state().cs,n=name(cs),a=document.getElementById("app");
 a.dataset.theme=n;a.dataset.tex=CFArt.get(cs).tex||TEX[n]||"paper";document.body.dataset.theme=n;
 if(CF.worldOf(cs).id=="x")a.style.setProperty("--acc",ACC[n])});
document.addEventListener("cf:home",function(){var a=document.getElementById("app");a.dataset.theme="home";a.dataset.tex="";document.body.dataset.theme="home";
});
})();
