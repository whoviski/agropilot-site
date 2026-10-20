(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ul=document.querySelector('#topnav ul'),bg=document.querySelector('.burger');
bg.addEventListener('click',()=>{const o=ul.classList.toggle('open');bg.setAttribute('aria-expanded',o)});
ul.addEventListener('click',e=>{if(e.target.tagName==='A'){ul.classList.remove('open');bg.setAttribute('aria-expanded',false)}});
const secs=[...document.querySelectorAll('section[id]')],links=[...ul.querySelectorAll('a')];
if('IntersectionObserver'in window){const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(s=>ro.observe(s));
const ao=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});secs.forEach(s=>ao.observe(s))}else document.querySelectorAll('.reveal').forEach(s=>s.classList.add('in'));
const lb=document.getElementById('lb'),li=lb.querySelector('img'),lp=lb.querySelector('p'),close=()=>{lb.hidden=true;li.src=''};
document.querySelectorAll('main img,section img').forEach(i=>i.addEventListener('click',()=>{li.src=i.src;li.alt=i.alt;lp.textContent=i.alt;lb.hidden=false}));
lb.addEventListener('click',e=>{if(e.target!==li)close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
const c=document.getElementById('fx');if(!c||rm)return;const x=c.getContext('2d');let w,h,P=[];
const rs=()=>{w=c.width=c.offsetWidth;h=c.height=c.offsetHeight;P=Array.from({length:Math.min(60,w/20|0)},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1}))};rs();addEventListener('resize',rs);
let vis=true;new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(c);
(function f(){requestAnimationFrame(f);if(!vis||document.hidden)return;x.clearRect(0,0,w,h);for(const p of P){p.x=(p.x+p.vx+w)%w;p.y=(p.y+p.vy+h)%h;x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()}
for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<110){x.strokeStyle='rgba(255,255,255,'+(.25*(1-d/110))+')';x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}})();})();
(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;const f=(v,d)=>v.toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});
const run=el=>{const to=+el.dataset.to,d=+el.dataset.dec,s=el.dataset.suf||'';if(rm){el.textContent=f(to,d)+s;return}const t0=performance.now();(function st(t){const k=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-k,3);el.textContent=f(to*e,d)+s;if(k<1)requestAnimationFrame(st)})(t0)};
const cs=document.querySelectorAll('[data-to]');if('IntersectionObserver'in window){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);o.unobserve(e.target)}}),{threshold:.5});cs.forEach(c=>o.observe(c))}
document.querySelectorAll('.faq details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('.faq details').forEach(x=>{if(x!==d)x.open=false})}))})();
