"use strict";
// Serialises a case: one header field per line, one scene per line (clean git diffs).
exports.fmt=function(c){
  const head=Object.keys(c).filter(k=>k!=="S").map(k=>"  "+k+":"+JSON.stringify(c[k])).join(",\n");
  const scenes=Object.keys(c.S).map(k=>"    "+JSON.stringify(k)+":"+JSON.stringify(c.S[k])).join(",\n");
  return "(window.CASES=window.CASES||[]).push({\n"+head+",\n  S:{\n"+scenes+"\n  }\n});\n";
};
