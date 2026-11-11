/* fx/art.js — per-case SVG art (sky / mid / fore layers), theme + ambient mapping.
   Override per case by adding  art:{pal:[..4 hex..],sky,mid,fore,fx,theme,tex,flip,people:{Name:{skin,hair,ac,style}}}  to a case file. */
(function(){
"use strict";
var uid=0,CUR=0;
function hx(h){h=h.replace("#","");if(h.length==3)h=h.replace(/./g,"$&$&");return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function mix(a,b,t){var x=hx(a),y=hx(b);return "#"+[0,1,2].map(function(i){return ("0"+Math.round(x[i]+(y[i]-x[i])*t).toString(16)).slice(-2)}).join("")}
function rnd(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function seed(t){var h=7;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))%233280;return h||1}
function R(x,y,w,h,f,o){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"'+(o||"")+'/>'}
function P(d,f,o){return '<path d="'+d+'" fill="'+f+'"'+(o||"")+'/>'}
function C(x,y,r,f,o){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(o||"")+'/>'}
function W(l,w,h,f){var o=l.map(function(p){return R(p[0],p[1],w,h,f,' opacity="'+(((p[0]*7+p[1]*13)%5)?.9:.25)+'"')}).join("");return CUR?'<g filter="url(#gl'+CUR+')">'+o+"</g>":o}
function G(x,y,c,r,dx,dy,w,h,f){var l=[],i,j;for(j=0;j<r;j++)for(i=0;i<c;i++)l.push([x+i*dx,y+j*dy]);return W(l,w,h,f)}

/* pal = [skyTop, skyBottom, accent, ground/silhouette] */
var ART={
manor:{theme:"heritage",fx:"rain",pal:["#0e1220","#2b2742","#e3b95c","#0b0b12"],sky:"storm",mid:"mansion",fore:"fence"},
key:{theme:"school",fx:"dust",pal:["#3d6a94","#cfe6f2","#f2c14e","#273a2c"],sky:"day",mid:"school",fore:"grass"},
fair:{theme:"school",fx:"dust",pal:["#4a7fb5","#d7ecf6","#f28f3b","#2f4a36"],sky:"day",mid:"tent",fore:"floor"},
violin:{theme:"heritage",pal:["#2a1c3a","#b0627a","#f2c14e","#160e1c"],sky:"dusk",mid:"hall",fore:"floor"},
wedding:{theme:"festive",fx:"fireflies",pal:["#2b1638","#d9683a","#ffb02e","#1c0f22"],sky:"dusk",mid:"tent",fore:"grass"},
biryani:{theme:"school",pal:["#101b33","#3a4f7a","#ffb454","#0c1222"],sky:"night",mid:"dorm",fore:"grass"},
houseboat:{theme:"coast",pal:["#f2b36b","#7fd0c8","#fff0c2","#143c3a"],sky:"dawn",mid:"boat",fore:"water"},
arctic:{theme:"polar",fx:"snow",tex:"glass",pal:["#06121f","#14485a","#8ff0d0","#e8f4f8"],sky:"aurora",mid:"station",fore:"snow"},
auction:{theme:"heritage",pal:["#2b1d1a","#5a3c30","#e3b95c","#150e0c"],sky:"none",mid:"gallery",fore:"floor"},
lighthouse:{theme:"coast",tex:"concrete",pal:["#101a33","#4a6a8f","#9fe8ff","#0b1220"],sky:"dusk",mid:"lighthouse",fore:"rocks"},
starship:{theme:"neo",fx:"stars",tex:"metal",pal:["#02030a","#1b1040","#6ee7ff","#0a0d1c"],sky:"space",mid:"starship",fore:"none"},
mask:{theme:"festive",pal:["#1a1030","#c0505a","#ffd166","#150a1c"],sky:"dusk",mid:"shrine",fore:"floor"},
idol:{theme:"neo",fx:"neon",pal:["#0a0618","#3a1066","#ff4fa3","#07040f"],sky:"night",mid:"city",fore:"floor"},
train:{theme:"classic",tex:"metal",pal:["#080d18","#243a5a","#ffd27a","#05080f"],sky:"night",mid:"train",fore:"rail"},
deepdive:{theme:"abyss",fx:"bubbles",pal:["#031a2b","#0a4a6e","#7ff0ff","#021018"],sky:"sea",mid:"sub",fore:"rocks"},
neonbank:{theme:"neo",fx:"neon",pal:["#06101c","#0a3a5a","#3de0ff","#050a12"],sky:"night",mid:"tower",fore:"floor"},
raven:{theme:"heritage",pal:["#120a14","#3a1a3a","#c9c9d8","#0a060c"],sky:"night",mid:"tower",fore:"fence"},
mirror:{theme:"rift",flip:1,pal:["#14082a","#5a2a8a","#b98cff","#0a0414"],sky:"rift",mid:"tower",fore:"floor"}
};

function sky(a){var p=a.pal,id="cg"+(++uid),r=rnd(seed(a.id||"x")),t=a.sky,o="",i,n;
 o+='<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+p[0]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient><radialGradient id="mh'+id+'"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><radialGradient id="hz'+id+'"><stop offset="0" stop-color="'+p[2]+'" stop-opacity=".34"/><stop offset="1" stop-color="'+p[2]+'" stop-opacity="0"/></radialGradient></defs>'+R(0,0,400,240,"url(#"+id+")");
 if(!/day|space|none/.test(t))o+='<ellipse cx="200" cy="200" rx="300" ry="96" fill="url(#hz'+id+')"/>';
 if(/night|space|dusk|aurora|rift/.test(t)){n=t=="space"?90:t=="dusk"?18:50;for(i=0;i<n;i++)o+=C((r()*400).toFixed(0),(r()*(t=="dusk"?80:150)).toFixed(0),(.5+r()*1.1).toFixed(1),"#fff",' opacity="'+(.3+r()*.6).toFixed(2)+'"'+(i%3==0?' class="tw" style="animation-delay:-'+(r()*5).toFixed(1)+'s"':""))}
 if(t=="night"||t=="dusk")o+=C(322,46,54,"url(#mh"+id+")")+C(322,46,15,"#f4f1de",' opacity=".95"')+C(327,42,13,p[0],' opacity=".35"');
 if(t=="space")o+=C(320,64,40,p[1],' opacity=".9"')+'<ellipse cx="320" cy="64" rx="64" ry="9" fill="none" stroke="'+p[2]+'" stroke-opacity=".5" stroke-width="3" transform="rotate(-18 320 64)"/>';
 if(t=="day"){o+=C(332,44,22,"#fff6b8",' opacity=".95"');for(i=0;i<4;i++)o+='<ellipse cx="'+(60+i*95+r()*30).toFixed(0)+'" cy="'+(36+r()*50).toFixed(0)+'" rx="'+(30+r()*16).toFixed(0)+'" ry="'+(8+r()*5).toFixed(0)+'" fill="#fff" opacity=".85" class="cl" style="animation-delay:-'+(r()*30).toFixed(0)+'s"/>'}
 if(t=="dawn")o+=C(200,166,60,p[2],' opacity=".5"')+C(200,166,34,p[2],' opacity=".9"');
 if(t=="storm")for(i=0;i<6;i++)o+='<ellipse cx="'+(i*75)+'" cy="'+(30+r()*40).toFixed(0)+'" rx="'+(70+r()*30).toFixed(0)+'" ry="'+(22+r()*10).toFixed(0)+'" fill="#05060c" opacity=".7"/>';
 if(t=="aurora")o+=P("M0 80Q100 20 200 70T400 50V110Q300 130 200 100T0 120Z",p[2],' opacity=".28"')+P("M0 110Q120 60 220 100T400 80V130Q300 150 200 125T0 140Z","#b98cff",' opacity=".2"');
 if(t=="sea")for(i=0;i<5;i++)o+=P("M"+(40+i*80)+" 0L"+(i*80)+" 240L"+(i*80+50)+" 240Z","#fff",' opacity=".04"');
 if(t=="rift")for(i=0;i<6;i++)o+='<ellipse cx="200" cy="100" rx="'+(30+i*28)+'" ry="'+(14+i*12)+'" fill="none" stroke="'+p[2]+'" stroke-opacity="'+(.5-i*.07).toFixed(2)+'" stroke-width="2" transform="rotate('+(i*14-20)+' 200 100)"/>';
 if(t=="none")o+=P("M200 0L120 240L280 240Z","#fff",' opacity=".04"');
 return o}

var MID={
mansion:function(a){var s=a.pal[3],w=a.pal[2];return R(105,95,190,80,s)+P("M95 96L200 48L305 96Z",s)+R(78,70,32,105,s)+P("M72 72L94 36L116 72Z",s)+R(290,70,32,105,s)+P("M284 72L306 36L328 72Z",s)+R(185,30,30,30,s)+P("M180 32L200 8L220 32Z",s)+W([[120,110],[152,110],[240,110],[270,110],[86,88],[298,88],[192,38]],14,20,w)+W([[120,142],[152,142],[240,142],[270,142]],14,20,w)+P("M188 175V150Q200 132 212 150V175Z",w,' opacity=".8"')},
school:function(a){var s=a.pal[3],w=a.pal[2];return R(50,108,300,67,s)+R(170,62,60,113,s)+P("M162 64L200 34L238 64Z",s)+C(200,84,11,w)+R(199,14,2,22,s)+P("M201 14L218 19L201 24Z","#e04e39")+G(64,120,4,2,26,26,14,16,w)+G(244,120,4,2,26,26,14,16,w)+R(188,148,24,27,"#000",' opacity=".55"')},
tent:function(a){var s=a.pal[3],w=a.pal[2],o=R(130,150,140,25,s)+R(70,96,8,80,s)+R(322,96,8,80,s)+R(150,104,6,70,s,' opacity=".7"')+R(244,104,6,70,s,' opacity=".7"')+P("M56 98Q200 36 344 98L344 110Q200 52 56 110Z",w),i,t;for(i=0;i<16;i++){t=i/15;o+=C((56+288*t).toFixed(1),(110-116*t*(1-t)+10+(i%2)*8).toFixed(1),4,i%3?"#ff9f1c":"#ffd166")}return o},
hall:function(a){var s=a.pal[3],w=a.pal[2],o=R(70,100,260,75,s)+P("M60 102L200 58L340 102Z",s)+R(66,98,268,6,s)+C(200,86,8,w)+R(60,168,280,7,s)+R(70,162,260,6,s)+R(186,128,28,36,w,' opacity=".8"'),i;for(i=0;i<6;i++)o+=R(92+i*42,106,12,56,w,' opacity=".2"');return o},
dorm:function(a){var s=a.pal[3],w=a.pal[2];return R(80,70,240,105,s)+R(74,64,252,8,s)+R(260,36,34,28,s)+R(274,22,6,14,s)+G(96,84,7,3,32,28,16,18,w)},
boat:function(a){var s=a.pal[3],w=a.pal[2];function palm(x,f){return '<path d="M'+x+' 178Q'+(x+8*f)+' 120 '+(x+22*f)+' 84" stroke="'+s+'" stroke-width="6" fill="none"/>'+P("M"+(x+22*f)+" 84Q"+(x+2*f)+" 66 "+(x-26*f)+" 84Q"+(x-2*f)+" 76 "+(x+22*f)+" 84Z",s)+P("M"+(x+22*f)+" 84Q"+(x+50*f)+" 64 "+(x+66*f)+" 90Q"+(x+46*f)+" 78 "+(x+22*f)+" 84Z",s)+P("M"+(x+22*f)+" 84Q"+(x+30*f)+" 60 "+(x+18*f)+" 52Q"+(x+16*f)+" 68 "+(x+22*f)+" 84Z",s)}return palm(40,1)+palm(360,-1)+P("M72 160H328L300 184H100Z",s)+P("M92 160Q200 84 308 160Z",s)+R(120,164,160,4,w,' opacity=".5"')+W([[146,140],[186,134],[226,134]],20,14,w)+R(196,100,4,26,s)},
station:function(a){var s="#0a1520",w=a.pal[2];return P("M60 176Q60 128 120 128Q180 128 180 176Z",s)+R(190,138,80,38,s)+R(210,120,40,20,s)+R(228,66,3,56,s)+P("M231 66L249 72L231 78Z","#ff5252")+R(266,98,3,40,s)+R(252,104,32,2,s)+W([[96,150],[130,150],[200,148],[240,148],[222,126]],14,12,w)+P("M70 142Q120 116 170 142Q120 134 70 142Z","#e8f4f8",' opacity=".85"')+R(190,134,80,5,"#e8f4f8",' opacity=".85"')},
gallery:function(a){var s=a.pal[3],w=a.pal[2],o=R(0,52,400,123,"#000",' opacity=".25"')+P("M200 0L140 175H260Z","#fff",' opacity=".05"');[[34,76,60,44],[104,66,48,58],[248,66,48,58],[306,76,60,44]].forEach(function(f){o+=R(f[0]-3,f[1]-3,f[2]+6,f[3]+6,w)+R(f[0],f[1],f[2],f[3],"#1a110e")+R(f[0]+4,f[1]+4,f[2]-8,f[3]-8,"#41606f",' opacity=".8"')+P("M"+(f[0]+4)+" "+(f[1]+f[3]-12)+"Q"+(f[0]+f[2]/2)+" "+(f[1]+f[3]-26)+" "+(f[0]+f[2]-4)+" "+(f[1]+f[3]-12)+"V"+(f[1]+f[3]-4)+"H"+(f[0]+4)+"Z","#0e1d26")});return o+R(172,52,56,70,w)+R(176,56,48,62,"#1a110e")+R(180,60,40,54,"#52748a",' opacity=".9"')+P("M180 100Q200 82 220 100V114H180Z","#0e1d26")+R(150,158,100,10,s)},
lighthouse:function(a){var s=a.pal[3],w=a.pal[2];return P("M0 176Q60 140 140 150Q180 156 240 148Q320 140 400 176Z",s)+P("M178 150L186 70L214 70L222 150Z","#d9dde0")+P("M182 120L218 120L216 132L184 132Z","#c0392b")+P("M184 92L216 92L214 104L186 104Z","#c0392b")+R(184,58,32,12,s)+R(188,46,24,12,w)+P("M182 46L200 28L218 46Z",s)+P("M200 52L390 20L390 84Z",w,' opacity=".22"')+P("M200 52L10 28L10 78Z",w,' opacity=".12"')},
starship:function(a){var s=a.pal[3],w=a.pal[2];return P("M60 120Q130 92 250 100L340 118L250 140Q130 148 60 120Z",s)+R(230,86,40,18,s)+R(240,78,18,10,w,' opacity=".8"')+R(40,108,24,24,s)+P("M40 114L10 120L40 126Z",w,' opacity=".85"')+W([[100,114],[130,112],[160,112],[190,112]],18,6,w)+R(80,128,200,3,w,' opacity=".25"')},
shrine:function(a){var s=a.pal[3],w=a.pal[2],o=R(100,70,16,105,"#c23b3b")+R(284,70,16,105,"#c23b3b")+P("M84 76Q200 54 316 76V90Q200 70 84 90Z","#c23b3b")+R(112,102,176,8,"#c23b3b")+R(190,88,20,14,s)+R(90,166,220,9,s)+R(100,158,200,8,s);[[48,60],[150,48],[250,48],[352,60]].forEach(function(l){o+='<path d="M'+l[0]+' 0V'+(l[1]-10)+'" stroke="#000" stroke-opacity=".45"/><ellipse cx="'+l[0]+'" cy="'+l[1]+'" rx="8" ry="10" fill="'+w+'"/>'+R(l[0]-4,l[1]-12,8,3,"#2a1010")});return o},
city:function(a){var s=a.pal[3],w=a.pal[2],r=rnd(seed(a.id||"c")),o="",x=0,bw,bh,wy,wx;while(x<400){bw=26+Math.floor(r()*30);bh=50+Math.floor(r()*100);o+=R(x,175-bh,bw,bh,s,' stroke="#000" stroke-opacity=".4"');for(wy=175-bh+6;wy<168;wy+=12)for(wx=x+5;wx<x+bw-6;wx+=9)if(r()>.55)o+=R(wx,wy,4,6,r()>.5?w:"#a8f6ff",' opacity=".8"');x+=bw+2}return o+'<path d="M40 112H100M300 96V150M310 96H350" stroke="'+w+'" stroke-width="3" class="neon" fill="none"/>'},
train:function(a){var s=a.pal[3],w=a.pal[2],o="",i,x;for(i=0;i<3;i++){x=20+i*125;o+=R(x,120,118,46,s)+R(x,128,118,3,w,' opacity=".6"')+W([[x+10,136],[x+36,136],[x+62,136],[x+88,136]],18,14,w)+C(x+22,168,8,"#000")+C(x+96,168,8,"#000")+R(x+118,148,7,3,s)}return o},
sub:function(a){var s=a.pal[3],w=a.pal[2];return P("M70 176Q70 112 140 112Q210 112 210 176Z",s)+R(210,148,70,12,s)+P("M280 176Q280 132 320 132Q360 132 360 176Z",s)+R(136,92,8,22,s)+C(140,88,4,w)+C(112,144,7,w)+C(140,136,7,w)+C(168,144,7,w)+C(320,154,6,w)+P("M20 80Q40 70 72 80Q40 94 20 80Z","#e0b84a")+R(44,72,8,6,"#e0b84a")},
tower:function(a){var s=a.pal[3],w=a.pal[2];return R(165,40,70,135,s)+R(190,10,20,32,s)+R(198,0,4,12,w)+R(120,100,48,75,s)+R(232,90,52,85,s)+R(80,128,44,47,s)+R(284,120,40,55,s)+G(172,52,4,7,15,16,8,10,w)+G(128,110,3,5,14,14,8,9,w)+G(240,100,3,6,15,14,8,9,w)+G(86,136,3,3,12,13,7,8,w)+G(290,128,3,3,12,13,7,8,w)}
};

var FORE={
fence:function(a){var s=a.pal[3],o=R(0,178,400,62,s)+R(0,168,400,4,s)+R(0,190,400,4,s),x;for(x=2;x<400;x+=16)o+=P("M"+x+" 210V162L"+(x+3)+" 156L"+(x+6)+" 162V210Z",s);return o},
grass:function(a){var s=a.pal[3],o=R(0,180,400,60,s),x;for(x=0;x<400;x+=9)o+=P("M"+x+" 182L"+(x+3)+" "+(166+(x%5)*3)+"L"+(x+6)+" 182Z",s);return o},
floor:function(a){var s=a.pal[3],c=a.pal[2],o=R(0,174,400,66,s)+R(0,174,400,66,"#000",' opacity=".25"'),i;for(i=-6;i<=6;i++)o+='<path d="M200 174L'+(200+i*70)+' 240" stroke="'+c+'" stroke-opacity=".12" fill="none"/>';[188,204,224].forEach(function(y){o+='<path d="M0 '+y+'H400" stroke="'+c+'" stroke-opacity=".1"/>'});return o},
water:function(a){var s=a.pal[3],c=a.pal[2],o=R(0,172,400,68,s);[180,196,214,232].forEach(function(y){o+='<path d="M0 '+y+'Q25 '+(y-6)+' 50 '+y+'T100 '+y+'T150 '+y+'T200 '+y+'T250 '+y+'T300 '+y+'T350 '+y+'T400 '+y+'" stroke="'+c+'" stroke-opacity=".35" fill="none"/>'});return o},
snow:function(a){return P("M0 188Q80 168 160 184T320 180T400 172V240H0Z",a.pal[3])+P("M0 212Q120 196 220 210T400 204V240H0Z","#cfe6ee")},
rocks:function(a){return P("M0 240V200L30 180L70 196L110 176L150 198L190 184L230 200L280 178L330 196L370 182L400 196V240Z",a.pal[3])},
rail:function(a){var s=a.pal[3],o=R(0,184,400,56,s),x;for(x=0;x<400;x+=26)o+=R(x,196,22,5,"#000",' opacity=".45"');return o+'<path d="M0 192H400M0 206H400" stroke="'+a.pal[2]+'" stroke-opacity=".35" stroke-width="2"/>'},
none:function(){return ""}
};

function norm(d,id){var o={},k;for(k in d)o[k]=d[k];o.id=id;o.pal=o.pal||["#0a1114","#26373d","#5fb8aa","#0b0f12"];o.sky=o.sky||"night";o.mid=o.mid||"hall";o.fore=o.fore||"floor";return o}
function parts(a){var id=++uid,p=a.pal,sk,m,f,fog="";CUR=id;sk=sky(a);m=(MID[a.mid]||MID.hall)(a);CUR=0;f=(FORE[a.fore]||FORE.none)(a);
 m=m.replace(new RegExp('fill="'+p[3]+'"',"gi"),'fill="url(#sil'+id+')"');
 m='<defs><linearGradient id="sil'+id+'" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="180"><stop offset="0" stop-color="'+mix(p[3],p[1],.3)+'"/><stop offset=".55" stop-color="'+mix(p[3],p[1],.08)+'"/><stop offset="1" stop-color="'+p[3]+'"/></linearGradient><filter id="gl'+id+'" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'+m;
 if(a.fore!="none"&&a.sky!="space"){fog='<defs><radialGradient id="fg'+id+'"><stop offset="0" stop-color="'+mix(p[1],"#ffffff",.55)+'" stop-opacity=".30"/><stop offset="1" stop-color="'+mix(p[1],"#ffffff",.55)+'" stop-opacity="0"/></radialGradient></defs><g class="fog"><ellipse cx="70" cy="176" rx="190" ry="20" fill="url(#fg'+id+')"/><ellipse cx="250" cy="170" rx="210" ry="16" fill="url(#fg'+id+')"/><ellipse cx="380" cy="178" rx="150" ry="18" fill="url(#fg'+id+')"/></g>'}
 return [sk,m,fog+f]}
function svg(inner,flip){return '<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+(flip?'<g transform="translate(400 0) scale(-1 1)">'+inner+'</g>':inner)+'</svg>'}

window.CFArt={
 ART:ART,
 get:function(c){c=c||{};return norm(c.art||ART[c.id]||{},c.id)},
 layers:function(a){return parts(a).map(function(x){return svg(x,a.flip)})},
 flat:function(a){return svg(parts(a).join(""),a.flip)}
};
})();
