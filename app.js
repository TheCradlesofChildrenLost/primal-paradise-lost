/* Complete text is rendered at build time; reading preferences stay on this device. */
(()=>{'use strict';
// Hash routes and paragraph bookmarks own scroll restoration, including back/forward.
if('scrollRestoration' in history)history.scrollRestoration='manual';
const D=window.READER_DATA, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storeKey='cop-reader:v2', appendixLabels={abstract:'摘要',materials:'材料与版本说明',notes:'完整注释',bibliography:'参考文献'};
const sections=$$('#manuscript > section');
let state={},current='chapter-00',activeSection=null,reading=false,route='space',scrollTimer=0,scrollFrame=0,navigating=false,noteTrigger=null;
try{
 state=JSON.parse(localStorage.getItem(storeKey)||'null');
 if(!state){
  const legacyKeys=Object.keys(localStorage).filter(k=>k.startsWith('cop-atlas:'));
  const legacy=legacyKeys.map(k=>({key:k,value:JSON.parse(localStorage.getItem(k)||'{}')})).sort((a,b)=>(b.value.updatedAt||0)-(a.value.updatedAt||0));
  state=legacy[0]?.value||{};
  if(state.bookmark&&!state.bookmark.text){state.bookmark={id:state.bookmark.chapter||'chapter-00',chapter:state.bookmark.chapter||'chapter-00',offset:0};}
 }
}catch{state={}}
let font=Math.min(28,Math.max(17,state.font||(matchMedia('(max-width:760px)').matches?19:20))),mode=state.mode==='continuous'?'continuous':'chapter',leading=state.leading==='airy'?'airy':'standard';
const visited=new Set(state.visited||[]);
function persist(){try{localStorage.setItem(storeKey,JSON.stringify({...state,font,mode,leading,theme:document.documentElement.dataset.theme,visited:[...visited],sourceHash:D.sourceHash,updatedAt:Date.now()}))}catch{}}
function adjustLayout(change){
 const anchor=activeSection&&([...activeSection.querySelectorAll('.text-paragraph')].find(p=>p.getBoundingClientRect().bottom>90)||activeSection);
 const top=anchor?.getBoundingClientRect().top;change();if(reading&&anchor)window.scrollBy({top:anchor.getBoundingClientRect().top-top,behavior:'instant'});requestAnimationFrame(updateReading);
}
function applyFont(){document.documentElement.style.setProperty('--read-size',font+'px');$('#font-output').textContent=font+' px';$('#font-minus').disabled=font<=17;$('#font-plus').disabled=font>=28;}
function applyTheme(t){document.documentElement.dataset.theme=t;$$('#settings-dialog [data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===t)));}
function applyLeading(){document.documentElement.style.setProperty('--leading',leading==='airy'?'2.35':'2.05');$$('[data-leading]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.leading===leading)));}
function applyVisibility(){sections.forEach(s=>s.hidden=mode==='chapter'&&s!==activeSection);$$('[data-reading-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readingMode===mode)));}
applyFont();applyTheme(state.theme==='night'?'night':'paper');applyLeading();
$('#edition-line').innerHTML=`序章 · 七章 · 终章 <span>／</span> ${Math.round(D.han/1000)} 千字 · ${D.noteCount} 条注释`;
$('#chapter-cards').innerHTML=D.chapters.map(c=>`<a class="chapter-card${visited.has(c.id)?' visited':''}" href="#${c.id}"><span class="card-number">${String(c.number).padStart(2,'0')}</span><div><h3>${E(c.short)}</h3><p>${E(c.title.split('：').slice(1).join('：'))}</p><span class="card-region">${E(c.region)}</span></div><span class="card-meta">约 ${c.minutes} 分钟 ↗</span></a>`).join('');
$('#reader-navigation').innerHTML=D.chapters.map(c=>`<div class="toc-chapter" data-toc="${c.id}"><a href="#${c.id}"><small>${String(c.number).padStart(2,'0')}</small><span>${E(c.short)}</span></a><div class="toc-section-links">${c.sections.filter(x=>x.level===2).map(s=>`<a href="#${s.id}">${E(s.title)}</a>`).join('')}</div></div>`).join('');
$('#gallery-grid').innerHTML=D.gallery.map((im,i)=>`<figure class="gallery-item"><button class="image-button" data-image="${E(im.file)}" data-caption="${E(im.title)}" data-source="${E(im.source_page)}" data-source-label="${E(im.source_label)}" aria-label="放大：${E(im.title)}"><img src="${E(im.file)}" alt="${E(im.alt)}" loading="lazy" width="${im.width}" height="${im.height}"></button><figcaption><span>${E(im.title)}${im.provenance==='user-supplied'?`<small class="image-kind">${E(im.source_label)}</small>`:''}</span><a href="${E(im.source_page)}" target="_blank" rel="noopener noreferrer" aria-label="${E(im.title)}图片出处"><small>FIG. ${String(i+1).padStart(2,'0')} ↗</small></a></figcaption></figure>`).join('');
const abstractNext=document.createElement('a');abstractNext.href='#chapter-00';abstractNext.className='appendix-next';abstractNext.textContent='翻开序章 →';$('#abstract').append(abstractNext);
const paths={
 'chapter-00':[['胸中结晶','chapter-03-1'],['迟到的发现','chapter-07-3']],
 'chapter-01':[['闭心与挂念','chapter-03-3'],['门前的不同声音','chapter-05-1']],
 'chapter-02':[['不同的容器','chapter-03-2'],['天上之海','chapter-06-1']],
 'chapter-03':[['起初的两块石头','chapter-00-2'],['胸石不在了','chapter-07-3']],
 'chapter-04':[['愿望的回声','chapter-05-2'],['把愿望说出来','chapter-07-1']],
 'chapter-05':[['乌尔米娅的请求','chapter-01-3'],['沉默的同伴','chapter-07-2']],
 'chapter-06':[['器物与封存','chapter-03-2'],['世界保留下来以后','chapter-08']],
 'chapter-07':[['回看门前的终结','chapter-05-2'],['合流终局','chapter-08-2']],
 'chapter-08':[['回到第一块石头','chapter-00-2'],['听见道谢','chapter-07-4']]};
function setCurrent(section){
 activeSection=section;const ch=D.chapters.find(c=>c.id===section?.id);current=section?.id||'chapter-00';
 if(ch&&reading)visited.add(current);
 $$('[data-toc]').forEach(e=>{const active=e.dataset.toc===current;e.classList.toggle('active',active);e.querySelector('a').setAttribute('aria-current',active?'location':'false');});
 $$('.toc-links a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+current?'location':'false'));
 const label=ch?.short||appendixLabels[current]||'正文';
 $('#current-chapter-label').textContent=label;document.title=label+' · 原初的失乐园';
 $('#return-paths').innerHTML=(paths[current]||[]).map(([label,target],i)=>`<a class="path-link" href="#${target}">${E(label)} <span>↗</span><small>RETURN ${String(i+1).padStart(2,'0')}</small></a>`).join('');
}
function closeToc(){document.body.classList.remove('toc-open');$('#toc-scrim').hidden=true;$('#mobile-toc').setAttribute('aria-expanded','false');}
function closeNote(){if($('#note-dialog').open)$('#note-dialog').close();}
function setView(read){reading=read;$('#reader-view').hidden=!read;$('#home-view').hidden=read;document.body.classList.toggle('is-reading',read);$('#back-top').hidden=!read;if(!read){$('.page-progress i').style.width='0%';closeNote();}}
function navigate(id,bookmark){
 clearTimeout(scrollTimer);navigating=true;closeToc();closeNote();
 if(id==='manuscript')id='abstract';
 const home=['home','spaces','atlas','contents','archive'].includes(id)||!id;setView(!home);
 if(home){if(id==='home'||!id)window.scrollTo({top:0,behavior:'instant'});else document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});document.title='原初的失乐园';drawMap();navigating=false;return;}
 const target=document.getElementById(id),section=target?.closest('#manuscript > section');
 if(!target||!section){setView(false);window.scrollTo({top:0,behavior:'instant'});document.title='原初的失乐园';navigating=false;return;}
 setCurrent(section);applyVisibility();
 target.scrollIntoView({behavior:'instant',block:'start'});
 if(bookmark&&Number.isFinite(bookmark.offset)){window.scrollBy({top:target.getBoundingClientRect().top+bookmark.offset,behavior:'instant'});}
 requestAnimationFrame(()=>{navigating=false;updateReading();});
}
function go(id){if(location.hash==='#'+id)navigate(id);else location.hash=id;}
function currentHeading(){return activeSection?[...activeSection.querySelectorAll('h3')].filter(h=>h.getBoundingClientRect().top<190).at(-1):null;}
function updateReading(){
 if(!reading||navigating)return;
 if(mode==='continuous'){
  const section=sections.filter(s=>s.getBoundingClientRect().top<190).at(-1)||sections[0];
  if(section!==activeSection)setCurrent(section);
 }
 if(!activeSection)return;
 const r=activeSection.getBoundingClientRect(),travel=Math.max(1,r.height-window.innerHeight+90),ratio=Math.max(0,Math.min(1,(90-r.top)/travel));
 $('#chapter-progress').textContent=(activeSection.dataset.chapter?'本章 ':'')+Math.round(ratio*100)+'%';$('.page-progress i').style.width=(ratio*100)+'%';
 const h=currentHeading();$$('.toc-section-links a').forEach(a=>a.setAttribute('aria-current',h&&a.hash==='#'+h.id?'location':'false'));
}
const sectionAnchors=$$('#manuscript a[id]').filter(a=>/^chapter-\d\d-\d+$/.test(a.id));
function stableAnchor(el){const local=sectionAnchors.filter(a=>a.closest('#manuscript > section')===activeSection);return local.filter(a=>a.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING).at(-1)?.id||activeSection?.id;}
function remember(manual=false){
 if(!reading||navigating||!activeSection)return;
 const candidates=[...activeSection.querySelectorAll('.text-paragraph')];
 const p=candidates.find(p=>{const r=p.getBoundingClientRect();return r.bottom>90&&r.top<innerHeight;})||currentHeading()||activeSection;
 const offset=-p.getBoundingClientRect().top;
 state.bookmark={id:p.id,anchor:stableAnchor(p),offset,chapter:current,text:p.classList.contains('text-paragraph')?p.textContent.slice(0,120):'',sourceHash:D.sourceHash};persist();
 $('#resume-button').hidden=false;$('#resume-button').textContent='续读 · '+(D.chapters.find(c=>c.id===current)?.short||appendixLabels[current]||'正文')+' →';
 if(manual)$('#bookmark-status').textContent='已记住此处。';
}
function resume(){
 let b={...state.bookmark};if(!b.id)return;
 if(b.sourceHash!==D.sourceHash){
  const ch=document.getElementById(b.chapter);const match=b.text&&[...(ch?.querySelectorAll('.text-paragraph')||[])].find(p=>p.textContent.startsWith(b.text));
  b.id=match?.id||b.anchor||b.chapter||'chapter-00';b.offset=0;
 }
 if(!document.getElementById(b.id)){b.id=b.chapter||'chapter-00';b.offset=0;}
 history.pushState(null,'','#'+b.id);navigate(b.id,b);
}
for(const panel of [...$$('.table-scroll'),$('#atlas-graph')]){panel.tabIndex=0;panel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();panel.scrollLeft+=e.key==='ArrowRight'?80:-80;}});}
function drawMap(){
 const r=D.routes[route];$('#route-title').textContent=r.title;$('#route-description').textContent=r.description;
 const curve=(a,b,ret)=>{const A=r.nodes[a],B=r.nodes[b],mx=(A[2]+B[2])/2;return ret?`M${A[2]},${A[3]} C${A[2]},430 ${B[2]},435 ${B[2]},${B[3]}`:`M${A[2]},${A[3]} C${mx},${A[3]} ${mx},${B[3]} ${B[2]},${B[3]}`};
 const contours=`<g aria-hidden="true"><path class="contour" d="M20 120Q180 -15 350 130T700 180T970 100M15 145Q180 15 350 150T700 200T970 120M25 165Q180 50 350 170T700 220T970 140M20 350Q180 195 345 300T700 280T985 330M25 375Q180 225 345 320T700 300T985 350M30 400Q180 255 345 340T700 320T985 370"/><path class="map-grid" d="M50 40H950M50 400H950M70 30V420M930 30V420M50 220H950M500 30V420"/><text x="906" y="46" class="compass">N</text><path class="contour" d="M912 56V88M900 74H924M912 57l-4 9h8z"/><text x="69" y="417" class="compass">VANA’DIEL · RELATIONS</text></g>`;
 $('#atlas-graph').innerHTML=`<svg class="atlas-svg" viewBox="0 0 1000 450" role="group" aria-label="${E(r.title)}的文章关系图">${contours}${r.edges.map(([a,b])=>`<path class="route-line" d="${curve(a,b,false)}"/>`).join('')}${r.returns.map(([a,b])=>`<path class="return-line" d="${curve(a,b,true)}"/>`).join('')}${r.nodes.map(([label,id,x,y],i)=>`<a href="#${id}" class="map-node ${visited.has(id.split('-').slice(0,2).join('-'))?'visited':''}" aria-label="${E(label)}：进入文章对应位置"><rect x="${x-37}" y="${y-37}" width="74" height="90" fill="transparent"/><circle class="node-halo" cx="${x}" cy="${y}" r="23"/><circle class="node-ring" cx="${x}" cy="${y}" r="15"/><path class="node-core" d="M${x} ${y-6}l6 6-6 6-6-6z"/><text class="node-label" x="${x}" y="${y+45}" text-anchor="middle">${E(label)}</text><text class="node-code" x="${x}" y="${y-32}" text-anchor="middle">${String(i+1).padStart(2,'0')}</text></a>`).join('')}</svg>`;
}
$$('[data-route]').forEach((b,i)=>{b.addEventListener('click',()=>{route=b.dataset.route;$$('[data-route]').forEach(x=>{x.setAttribute('aria-selected',String(x===b));x.tabIndex=x===b?0:-1;});drawMap();});b.tabIndex=i? -1:0;b.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const list=$$('[data-route]'),t=list[(i+(e.key==='ArrowRight'?1:list.length-1))%list.length];t.focus();t.click();}});});
const dialogTriggers=new WeakMap(),dialogPositions=new WeakMap();
function readingPosition(){if(!reading||!activeSection)return null;const el=[...activeSection.querySelectorAll('.text-paragraph,h3,h4')].find(e=>e.getBoundingClientRect().bottom>90)||activeSection;return {el,top:el.getBoundingClientRect().top};}
function restorePosition(pos){if(pos&&reading&&pos.el.getClientRects().length)window.scrollBy({top:pos.el.getBoundingClientRect().top-pos.top,behavior:'instant'});}
function openDialog(id,trigger){const d=document.getElementById(id);dialogTriggers.set(d,trigger||document.activeElement);if(d.open)return;const pos=readingPosition();dialogPositions.set(d,pos);d.showModal();restorePosition(pos);if(id==='search-dialog')$('#search-input').focus({preventScroll:true});}
$$('dialog').forEach(d=>{
 d.querySelector('.close-dialog').addEventListener('click',()=>d.close());
 d.addEventListener('click',e=>{if(e.target===d&&d.id!=='note-dialog'){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 d.addEventListener('close',()=>{if(d.id==='note-dialog'){$$('.note-active').forEach(a=>a.classList.remove('note-active'));noteTrigger?.focus({preventScroll:true});}else {dialogTriggers.get(d)?.focus?.({preventScroll:true});restorePosition(dialogPositions.get(d));requestAnimationFrame(updateReading);}});
});
function openNote(id,trigger){
 noteTrigger=trigger;$$('.note-active').forEach(a=>a.classList.remove('note-active'));trigger.classList.add('note-active');
 $('#note-heading').textContent='注释 '+id.replace('reader-c','').replace('-n','-');$('#note-content').innerHTML=D.notes[id].replace(/id="[^"]+"/g,'');$('.note-full-link').href='#'+id;
 const d=$('#note-dialog');if(!d.open)d.show();d.scrollTop=0;d.querySelector('.close-dialog').focus({preventScroll:true});
}
$('#note-return').addEventListener('click',()=>{const a=noteTrigger;closeNote();a?.scrollIntoView({behavior:'instant',block:'center'});});
document.addEventListener('click',e=>{
 const image=e.target.closest('[data-image]');if(image){$('#large-image').src=image.dataset.image;$('#large-image').alt=image.dataset.caption;$('#large-caption').textContent=image.dataset.caption;$('#large-source').href=image.dataset.source;$('#large-source').textContent='来源：'+(image.dataset.sourceLabel||'图像档案')+' ↗';openDialog('image-dialog',image);return;}
 const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);
 if(id.startsWith('reader-')&&D.notes[id]&&!a.classList.contains('note-full-link')){e.preventDefault();openNote(id,a);return;}
 e.preventDefault();const dialog=a.closest('dialog');if(dialog)dialog.close();go(id);
});
$('#reader-settings').addEventListener('click',e=>openDialog('settings-dialog',e.currentTarget));
$('#search-open').addEventListener('click',e=>openDialog('search-dialog',e.currentTarget));$('#settings-open').addEventListener('click',e=>openDialog('settings-dialog',e.currentTarget));
$('#font-minus').addEventListener('click',()=>{adjustLayout(()=>{font=Math.max(17,font-1);applyFont();});persist();});$('#font-plus').addEventListener('click',()=>{adjustLayout(()=>{font=Math.min(28,font+1);applyFont();});persist();});
$$('#settings-dialog [data-theme]').forEach(b=>b.addEventListener('click',()=>{applyTheme(b.dataset.theme);persist();}));
$$('[data-leading]').forEach(b=>b.addEventListener('click',()=>{adjustLayout(()=>{leading=b.dataset.leading;applyLeading();});persist();}));
$$('[data-reading-mode]').forEach(b=>b.addEventListener('click',()=>{remember();const bookmark=state.bookmark;mode=b.dataset.readingMode;persist();applyVisibility();if(reading&&bookmark)navigate(bookmark.id,bookmark);}));
$('#focus-toggle').addEventListener('click',e=>{const on=document.body.classList.toggle('focus-mode');e.currentTarget.setAttribute('aria-pressed',String(on));e.currentTarget.textContent=on?'恢复目录':'专注阅读';});
$('#toc-search').addEventListener('click',()=>{closeToc();openDialog('search-dialog',$('#mobile-toc'));});
$('#mobile-toc').addEventListener('click',()=>{const open=!document.body.classList.contains('toc-open');document.body.classList.toggle('toc-open',open);$('#toc-scrim').hidden=!open;$('#mobile-toc').setAttribute('aria-expanded',String(open));if(open)$('#toc-close').focus();});
$('#toc-close').addEventListener('click',()=>{closeToc();$('#mobile-toc').focus();});$('#toc-scrim').addEventListener('click',()=>{closeToc();$('#mobile-toc').focus();});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(document.body.classList.contains('toc-open')){closeToc();$('#mobile-toc').focus();}closeNote();}
 if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();if(!$('#search-dialog').open)openDialog('search-dialog');}
 if(e.key==='Tab'&&document.body.classList.contains('toc-open')){const links=[...$('#reading-toc').querySelectorAll('a,button')].filter(a=>a.getClientRects().length);if(e.shiftKey&&document.activeElement===links[0]){e.preventDefault();links.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();links[0].focus();}}
});
const searchable=$$('#manuscript .text-paragraph,#manuscript h3,#manuscript h4,#manuscript li,#manuscript tr').filter(e=>e.textContent.trim()).map((e,i)=>{if(!e.id)e.id='search-item-'+i;const section=e.closest('#manuscript > section');return{id:e.id,text:e.textContent,chapter:D.chapters.find(c=>c.id===section?.id)?.short||appendixLabels[section?.id]||'正文'};});
let searchTimer;
$('#search-input').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const q=$('#search-input').value.trim();if(!q){$('#search-results').innerHTML='';$('#search-status').textContent='搜索正文、注释与参考文献';return;}const hits=searchable.filter(e=>e.text.toLocaleLowerCase().includes(q.toLocaleLowerCase()));$('#search-status').textContent=`找到 ${hits.length} 处${hits.length>60?' · 显示前 60 处':''}`;$('#search-results').innerHTML=hits.slice(0,60).map(e=>{const n=e.text.toLocaleLowerCase().indexOf(q.toLocaleLowerCase()),before=e.text.slice(Math.max(0,n-32),n),match=e.text.slice(n,n+q.length),after=e.text.slice(n+q.length,n+q.length+95);return`<a class="search-result" href="#${e.id}"><small>${E(e.chapter)}</small><p>${n>32?'…':''}${E(before)}<mark>${E(match)}</mark>${E(after)}…</p></a>`;}).join('');},100);});
$('#bookmark-button').addEventListener('click',()=>remember(true));$('#resume-button').hidden=!state.bookmark;$('#resume-button').addEventListener('click',resume);
$('#share-position').addEventListener('click',async()=>{const id=currentHeading()?.id||current;try{const url=new URL(location.href);url.hash=id;url.search='';await navigator.clipboard.writeText(url.href);$('#share-position').textContent='本节链接已复制';setTimeout(()=>$('#share-position').textContent='复制此节链接 ↗',2200);}catch{$('#bookmark-status').textContent='可复制地址栏中的章节链接。';}});
window.addEventListener('scroll',()=>{if(!reading||navigating)return;cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(updateReading);clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>remember(),500);},{passive:true});
window.addEventListener('resize',()=>updateReading(),{passive:true});
window.addEventListener('pagehide',()=>remember());$('#back-top').addEventListener('click',()=>activeSection?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'}));
window.addEventListener('hashchange',()=>navigate(decodeURIComponent(location.hash.slice(1))));
window.addEventListener('beforeprint',()=>sections.forEach(s=>s.hidden=false));window.addEventListener('afterprint',applyVisibility);
drawMap();navigate(decodeURIComponent(location.hash.slice(1)));
})();
