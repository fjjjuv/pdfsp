
const OPS={
 replace_text:{need:["target","text"],json:{op:"replace_text",target:"text:'invoice #42'",text:"invoice #43"},desc:"Replaces the text content of a targeted element. The selector resolves semantically — coordinates are legal but fragile."},
 set_textbox:{need:["target","text"],json:{op:"set_textbox",target:"e12",text:"New paragraph text, reflowed."},desc:"Replaces text inside the element's own box with reflow — preferred for paragraphs."},
 delete:{need:["target"],json:{op:"delete",target:"e7"},desc:"Removes an element from the scene. Its canonical inverse is a re-insert, enabling rollback."},
 insert:{need:["at","element"],json:{op:"insert",at:"before:e12",element:{type:"text",text:"Note:",font:"body"}},desc:"Inserts a new element at a position anchor. The response reports the new element's id."},
 insert_text:{need:["page","x","y","text"],json:{op:"insert_text",page:0,x:50,y:120,text:"Stamp"},desc:"Raw text insertion at coordinates — for simple legacy ops."},
 insert_image:{need:["page","rect","src"],json:{op:"insert_image",page:0,rect:[50,50,200,100],src:"logo.png"},desc:"Places an image in a rectangle on a page."},
 restyle:{need:["target","role"],json:{op:"restyle",target:"e12",role:"h1"},desc:"Re-styles an element per the document's Design DNA (see PDFAD)."},
 move:{need:["target","to"],json:{op:"move",target:"e5",to:"after:e20"},desc:"Relocates an element within the scene."},
 fill_field:{need:["label","text"],json:{op:"fill_field",label:"Total",text:"1 250,00 €"},desc:"Fills a form field or dotted-line field by label."}
};
const sel=document.getElementById('op'),out=document.getElementById('opout'),nf=document.getElementById('need'),dc=document.getElementById('desc');
Object.keys(OPS).forEach(k=>{const o=document.createElement('option');o.value=o.textContent=k;sel.appendChild(o)});
function show(){const o=OPS[sel.value];out.textContent=JSON.stringify(o.json,null,2);nf.innerHTML=o.need.map(n=>'<code>'+n+'</code>').join(' ');dc.textContent=o.desc}
sel.addEventListener('change',show);show();
