/* All reading state remains in the visitor's browser. */
(()=>{'use strict';
const D=window.READER_DATA,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],storeKey='cop-atlas:'+D.sourceHash.slice(0,12),E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={},current='chapter-00',reading=false,lastTrigger=null,scrollTimer=0,route='space',font=21,visited=new Set();
try{state=JSON.parse(localStorage.getItem(storeKey)||'{}');font=state.font||21;visited=new Set(state.visited||[])}catch{}
function persist(){try{localStorage.setItem(storeKey,JSON.stringify({...state,font,theme:document.documentElement.dataset.theme,visited:[...visited]}))}catch{}}
function applyFont(){document.documentElement.style.setProperty('--read-size',font+'px');$('#font-output').textContent=font+' px';$('#font-minus').disabled=font<=17;$('#font-plus').disabled=font>=28}
function applyTheme(t){document.documentElement.dataset.theme=t;$$('#settings-dialog [data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===t)))}
applyFont();applyTheme(state.theme==='night'?'night':'paper');
$('#edition-line').innerHTML=`序章 · 七章 · 结语 <span>／</span> ${Math.round(D.han/1000)} 千字 · ${D.noteCount} 条注释`;
$('#chapter-cards').innerHTML=D.chapters.map((c,i)=>`<a class="chapter-card" href="#${c.id}"><span class="card-number">${String(i).padStart(2,'0')} <i>↗</i></span><h3>${E(c.short)}</h3><p>${E(c.region)}</p><span class="card-meta">${c.minutes} MIN</span></a>`).join('');
$('#reader-navigation').innerHTML=D.chapters.map(c=>`<div class="toc-chapter" data-toc="${c.id}"><a href="#${c.id}"><small>${String(c.number).padStart(2,'0')}</small><span>${E(c.short)}</span></a><div class="toc-section-links">${c.sections.filter(x=>x.level===2).map(s=>`<a href="#${s.id}">${E(s.title)}</a>`).join('')}</div></div>`).join('');
$('#gallery-grid').innerHTML=D.gallery.map((im,i)=>`<figure class="gallery-item"><button class="image-button" data-image="${E(im.file)}" data-caption="${E(im.title)}" data-source="${E(im.source_page)}" data-source-label="${E(im.source_label)}" aria-label="放大：${E(im.title)}"><img src="${E(im.file)}" alt="${E(im.alt)}" loading="lazy" width="${im.width}" height="${im.height}"></button><figcaption><span>${E(im.title)}${im.provenance==='user-supplied'?`<small class="image-kind">${E(im.source_label)}</small>`:''}</span><a href="${E(im.source_page)}" target="_blank" rel="noopener noreferrer" aria-label="${E(im.title)}图片出处"><small>FIG. ${String(i+1).padStart(2,'0')} ↗</small></a></figcaption></figure>`).join('');
const paths={
 'chapter-00':[['胸中结晶','chapter-03-1'],['迟到的发现','chapter-07-3']],
 'chapter-01':[['闭心与挂念','chapter-03-3'],['门前的不同声音','chapter-05-1']],
 'chapter-02':[['不同的容器','chapter-03-2'],['回到人间','chapter-07-4']],
 'chapter-03':[['起初的两块石头','chapter-00-2'],['胸石不在了','chapter-07-3']],
 'chapter-04':[['愿望的回声','chapter-05-2'],['把愿望说出来','chapter-07-1']],
 'chapter-05':[['乌尔米娅的请求','chapter-01-3'],['沉默的同伴','chapter-07-2']],
 'chapter-06':[['器物与封存','chapter-03-2'],['世界留下来以后','chapter-08']],
 'chapter-07':[['回看门前的终结','chapter-05-2'],['返回日常的关系','chapter-01-3']],
 'chapter-08':[['回到第一块石头','chapter-00-2'],['听见道谢','chapter-07-4']]};
function setCurrent(id){if(!id.startsWith('chapter-'))return;const ch=D.chapters.find(c=>c.id===id);if(!ch)return;current=id;if(reading)visited.add(id);$$('[data-toc]').forEach(e=>{const active=e.dataset.toc===id;e.classList.toggle('active',active);e.querySelector('a').setAttribute('aria-current',active?'location':'false')});$('#current-chapter-label').textContent=ch.short;$('#return-paths').innerHTML=paths[id].map(([label,target],i)=>`<a class="path-link" href="#${target}">${E(label)} <span>↗</span><small>RETURN ${String(i+1).padStart(2,'0')}</small></a>`).join('')}
function setView(read){reading=read;$('#reader-view').hidden=!read;$('#home-view').hidden=read;document.body.classList.toggle('is-reading',read);if(!read){document.body.classList.remove('toc-open');$('.page-progress i').style.width='0%'}$('#back-top').hidden=!read}
function navigate(id,restore=false){
 document.body.classList.remove('toc-open');
 const home=['home','atlas','contents','archive'].includes(id)||!id;setView(!home);
 if(home){if(id==='home'||!id)window.scrollTo({top:0,behavior:'instant'});else document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});document.title='原初的失乐园 · 拓扑阅读图册';drawMap();return}
 const target=document.getElementById(id);
 if(!target){setView(false);window.scrollTo({top:0,behavior:'instant'});return}
 const ch=target.closest('[data-chapter]');if(ch)setCurrent(ch.dataset.chapter);else{const appendix=target.closest('.reading-appendix');if(appendix)$('#current-chapter-label').textContent=({notes:'完整注释',bibliography:'参考文献',materials:'材料与版本说明'})[appendix.id]||'注释与书目'}
 target.scrollIntoView({behavior:'instant',block:'start'});if(id==='manuscript')target.focus({preventScroll:true});
 document.title=(D.chapters.find(c=>c.id===current)?.short||'注释与书目')+' · 原初的失乐园';
 if(restore&&state.bookmark?.id===id){const y=target.getBoundingClientRect().top+window.scrollY+(state.bookmark.offset||0);window.scrollTo({top:Math.max(0,y),behavior:'instant'})}
}
function go(id){if(location.hash==='#'+id)navigate(id);else location.hash=id}
for(const panel of [...$$('.table-scroll'),$('#atlas-graph')]){panel.tabIndex=0;panel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();panel.scrollLeft+=e.key==='ArrowRight'?80:-80}})}
function drawMap(){
 const r=D.routes[route];$('#route-title').textContent=r.title;$('#route-description').textContent=r.description;
 const curve=(a,b,ret)=>{const A=r.nodes[a],B=r.nodes[b],mx=(A[2]+B[2])/2;return ret?`M${A[2]},${A[3]} C${A[2]},430 ${B[2]},435 ${B[2]},${B[3]}`:`M${A[2]},${A[3]} C${mx},${A[3]} ${mx},${B[3]} ${B[2]},${B[3]}`};
 const contours=`<g aria-hidden="true"><path class="contour" d="M20 120Q180 -15 350 130T700 180T970 100M15 145Q180 15 350 150T700 200T970 120M25 165Q180 50 350 170T700 220T970 140M20 350Q180 195 345 300T700 280T985 330M25 375Q180 225 345 320T700 300T985 350M30 400Q180 255 345 340T700 320T985 370"/><path class="map-grid" d="M50 40H950M50 400H950M70 30V420M930 30V420M50 220H950M500 30V420"/><circle class="contour" cx="500" cy="220" r="134"/><circle class="contour" cx="500" cy="220" r="126"/><text x="906" y="46" class="compass">N</text><path class="contour" d="M912 56V88M900 74H924M912 57l-4 9h8z"/><text x="69" y="417" class="compass">VANA’DIEL · RELATIONS</text></g>`;
 $('#atlas-graph').innerHTML=`<svg class="atlas-svg" viewBox="0 0 1000 450" role="group" aria-label="${E(r.title)}的文章关系图">${contours}${r.edges.map(([a,b])=>`<path class="route-line" d="${curve(a,b,false)}"/>`).join('')}${r.returns.map(([a,b])=>`<path class="return-line" d="${curve(a,b,true)}"/>`).join('')}${r.nodes.map(([label,id,x,y],i)=>`<a href="#${id}" class="map-node ${visited.has(id.split('-').slice(0,2).join('-'))?'visited':''}" aria-label="${E(label)}：进入文章对应位置"><rect x="${x-37}" y="${y-37}" width="74" height="90" fill="transparent"/><circle class="node-halo" cx="${x}" cy="${y}" r="23"/><circle class="node-ring" cx="${x}" cy="${y}" r="15"/><path class="node-core" d="M${x} ${y-6}l6 6-6 6-6-6z"/><text class="node-label" x="${x}" y="${y+45}" text-anchor="middle">${E(label)}</text><text class="node-code" x="${x}" y="${y-32}" text-anchor="middle">${String(i+1).padStart(2,'0')}</text></a>`).join('')}</svg>`;
}
$$('[data-route]').forEach(b=>b.addEventListener('click',()=>{route=b.dataset.route;$$('[data-route]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));drawMap()}));
$$('[data-route]').forEach((b,i)=>b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const list=$$('[data-route]');const t=list[(i+(e.key==='ArrowRight'?1:list.length-1))%list.length];t.focus();t.click()}}));
function openDialog(id,trigger){lastTrigger=trigger||document.activeElement;const d=document.getElementById(id);d.showModal();if(id==='search-dialog')$('#search-input').focus()}
$$('dialog').forEach(d=>{d.querySelector('.close-dialog').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>lastTrigger?.focus?.({preventScroll:true}))});
document.addEventListener('click',e=>{
 const image=e.target.closest('[data-image]');if(image){$('#large-image').src=image.dataset.image;$('#large-image').alt=image.dataset.caption;$('#large-caption').textContent=image.dataset.caption;$('#large-source').href=image.dataset.source;$('#large-source').textContent='来源：'+(image.dataset.sourceLabel||'图像档案')+' ↗';openDialog('image-dialog',image);return}
 const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);
 if(id.startsWith('reader-')&&D.notes[id]&&!a.classList.contains('note-full-link')){e.preventDefault();$('#note-heading').textContent='注释 '+id.replace('reader-c','').replace('-n','-');$('#note-content').innerHTML=D.notes[id].replace(/id="[^"]+"/g,'');$('.note-full-link').href='#'+id;openDialog('note-dialog',a);return}
 e.preventDefault();const dialog=a.closest('dialog');if(dialog)dialog.close();go(id);
});
$('#search-open').addEventListener('click',e=>openDialog('search-dialog',e.currentTarget));$('#settings-open').addEventListener('click',e=>openDialog('settings-dialog',e.currentTarget));
$('#font-minus').addEventListener('click',()=>{font=Math.max(17,font-1);applyFont();persist()});$('#font-plus').addEventListener('click',()=>{font=Math.min(28,font+1);applyFont();persist()});$$('#settings-dialog [data-theme]').forEach(b=>b.addEventListener('click',()=>{applyTheme(b.dataset.theme);persist()}));
$('#focus-toggle').addEventListener('click',e=>{const on=document.body.classList.toggle('focus-mode');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'恢复目录':'专注阅读'});
$('#mobile-toc').addEventListener('click',()=>{document.body.classList.toggle('toc-open');if(document.body.classList.contains('toc-open'))$('.reader-toc a').focus()});
$('#manuscript').addEventListener('click',()=>document.body.classList.remove('toc-open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('toc-open');if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();if(!$('#search-dialog').open)openDialog('search-dialog')}});
const searchable=$$('#manuscript .text-paragraph,#manuscript h3,#manuscript h4,#manuscript li,#manuscript tr').filter(e=>e.textContent.trim()).map((e,i)=>{if(!e.id)e.id='search-item-'+i;const ch=e.closest('[data-chapter]');return{id:e.id,text:e.textContent,chapter:D.chapters.find(c=>c.id===ch?.dataset.chapter)?.short||'注释与书目'}});
let searchTimer;
$('#search-input').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const q=$('#search-input').value.trim();if(!q){$('#search-results').innerHTML='';$('#search-status').textContent='搜索正文、注释与参考文献';return}const hits=searchable.filter(e=>e.text.toLocaleLowerCase().includes(q.toLocaleLowerCase()));$('#search-status').textContent=`找到 ${hits.length} 处${hits.length>60?' · 显示前 60 处':''}`;$('#search-results').innerHTML=hits.slice(0,60).map(e=>{const n=e.text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()),before=e.text.slice(Math.max(0,n-32),n),match=e.text.slice(n,n+q.length),after=e.text.slice(n+q.length,n+q.length+95);return`<a class="search-result" href="#${e.id}"><small>${E(e.chapter)}</small><p>${n>32?'…':''}${E(before)}<mark>${E(match)}</mark>${E(after)}…</p></a>`}).join('')},100)});
function remember(manual=false){if(!reading)return;const candidates=$$('#manuscript .text-paragraph');const p=candidates.find(p=>{const r=p.getBoundingClientRect();return r.bottom>100&&r.top<window.innerHeight})||document.getElementById(current);state.bookmark={id:p.id,offset:window.scrollY-(p.getBoundingClientRect().top+window.scrollY),chapter:current};persist();$('#resume-button').hidden=false;if(manual){$('#bookmark-status').textContent='此处已记录，下次可继续阅读。'}}
$('#bookmark-button').addEventListener('click',()=>remember(true));$('#resume-button').hidden=!state.bookmark;
$('#resume-button').addEventListener('click',()=>{if(!state.bookmark)return;const id=state.bookmark.id;if(location.hash==='#'+id)navigate(id,true);else{history.pushState(null,'','#'+id);navigate(id,true)}});
window.addEventListener('scroll',()=>{if(!reading)return;const available=document.documentElement.scrollHeight-window.innerHeight;$('.page-progress i').style.width=(available?Math.min(100,window.scrollY/available*100):0)+'%';clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>remember(),400);const chapters=$$('.reading-chapter');const active=chapters.findLast?chapters.findLast(c=>c.getBoundingClientRect().top<160):[...chapters].reverse().find(c=>c.getBoundingClientRect().top<160);if(active&&active.dataset.chapter!==current)setCurrent(active.dataset.chapter)},{passive:true});
window.addEventListener('pagehide',()=>remember());$('#back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));window.addEventListener('hashchange',()=>navigate(decodeURIComponent(location.hash.slice(1))));window.addEventListener('popstate',()=>navigate(decodeURIComponent(location.hash.slice(1))));
drawMap();navigate(decodeURIComponent(location.hash.slice(1)));setCurrent(current);
})();
