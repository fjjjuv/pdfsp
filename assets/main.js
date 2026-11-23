
// nav burger
const b=document.querySelector('.burger'),nv=document.querySelector('nav');
if(b)b.addEventListener('click',()=>nv.classList.toggle('open'));
// copy buttons
document.querySelectorAll('pre').forEach(p=>{
  const btn=document.createElement('button');btn.textContent='copy';
  btn.addEventListener('click',()=>{navigator.clipboard.writeText(p.innerText);btn.textContent='copied!';setTimeout(()=>btn.textContent='copy',1400)});
  const w=document.createElement('div');w.className='copy';p.parentNode.insertBefore(w,p);w.appendChild(p);w.appendChild(btn);
});
// TOC scrollspy
const art=document.querySelector('article');
if(art){
  const toc=document.querySelector('.toc');const links=[];
  art.querySelectorAll('h2,h3').forEach((h,i)=>{
    if(!h.id)h.id='s'+i;
    const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;
    if(h.tagName==='H3')a.className='l3';toc.appendChild(a);links.push([h,a]);
  });
  const spy=()=>{let act=links[0];for(const[h,a]of links)if(h.getBoundingClientRect().top<90)act=[h,a];
    links.forEach(([h,a])=>a.classList.toggle('on',act&&act[1]===a));};
  document.addEventListener('scroll',spy,{passive:true});spy();
}
