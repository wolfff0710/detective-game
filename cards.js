/* fx/cards.js — evidence pins become polaroids / receipts / evidence tags / torn notes by clue wording */
(function(){
"use strict";
var K=[["pol",/\b(?:photos?|footage|cctv|camera|clip|video|image|uv|scan|sketch|map|charts?|drone|screen)\b/i],
 ["rec",/\b(?:receipts?|invoices?|register|ledger|log|bills?|list|paperwork|statement|policy|slip|certificates?|contract|manual|notice|records?|calendar|page|signature|payments?|checksum|schedule)\b/i],
 ["tag",/\b(?:keys?|gloves?|boots?|(?:foot|boot)prints?|vials?|bottles?|glass(?:es)?|pen|tape|thumbprint|residue|ink|stains?|stained|knot|spanner|picks?|badge|fob|ring|cloth|jacket|trowel|mud|sandals?|handkerchief|drive|core|briefcase|grease|powder|foil|bangles|necklace|dial|iodine)\b/i]];
function ic(t){return /footage|cctv|video|clip|drone/i.test(t)?"🎞️":/\buv\b|scan/i.test(t)?"🔦":/sketch|map|chart/i.test(t)?"🗺️":"📷"}
function kind(t){for(var i=0;i<K.length;i++)if(K[i][1].test(t))return K[i][0];return "note"}
function run(){[].forEach.call(document.querySelectorAll("#pins .pin"),function(p,i){if(p.dataset.k)return;var t=p.textContent,k=kind(t);p.dataset.k=k;p.dataset.no=("0"+(i+1)).slice(-2);if(k=="pol")p.dataset.ic=ic(t)})}
window.CFCards={run:run};
document.addEventListener("cf:case",function(){var ps=document.getElementById("pins");if(!ps)return;new MutationObserver(run).observe(ps,{childList:true});run()});
})();
