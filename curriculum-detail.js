(() => {
  'use strict';

  const state = { open: false, snapshot: null };
  const copy = {
    zh: {
      back:'返回课程列表', requirement:'课程要求', unit:'教材单元', placement:'课程位置', related:'相关数学概念', codes:'课程标准代码', interpretation:'中文理解', next:'继续深入', compare:'与中国课程对照', compareTopic:'进入概念对照', source:'课程依据',
      englandSource:'英格兰 National Curriculum 数学课程', usSource:'Common Core State Standards for Mathematics（美国比较基线）', cnSource:'人教版义务教育小学数学修订教材编排',
      englandNote:'这里显示的是英格兰课程要求，不代表苏格兰、威尔士或北爱尔兰使用相同课程。', usNote:'Common Core 在 MathBridge 中作为美国比较基线，不代表所有州采用完全相同的课程。', cnNote:'这里显示的是人教版教材编排，不代表中国所有学校都使用相同教材。',
      useHint:'先理解这一课程要求本身，再进入“对照”查看它与中国教材位置、教学方法和课堂应用之间的关系。', noConcepts:'这个单元目前没有已映射的 MathBridge 概念。', open:'打开课程详情',
      grade:n=>`中国 ${n} 年级`, year:n=>`英格兰 Year ${n}`, usGrade:n=>`美国 Grade ${n}`
    },
    en: {
      back:'Back to curriculum', requirement:'Curriculum requirement', unit:'Textbook unit', placement:'Curriculum placement', related:'Related mathematical concepts', codes:'Standard codes', interpretation:'Comparison note', next:'Go deeper', compare:'Compare with China', compareTopic:'Open concept comparison', source:'Curriculum basis',
      englandSource:'National Curriculum in England: mathematics', usSource:'Common Core State Standards for Mathematics (US comparison baseline)', cnSource:'Verified revised PEP primary mathematics textbook sequence',
      englandNote:'This is the curriculum for England; it is not presented as the statutory curriculum for Scotland, Wales or Northern Ireland.', usNote:'MathBridge uses Common Core as a US comparison baseline; it does not represent every state curriculum.', cnNote:'This is the revised PEP textbook sequence; it is not used by every school in China.',
      useHint:'Understand the curriculum requirement itself first, then use Compare to examine its relationship with Chinese textbook placement, pedagogy and classroom application.', noConcepts:'No MathBridge concepts are currently mapped to this unit.', open:'Open curriculum details',
      grade:n=>`China Grade ${n}`, year:n=>`England Year ${n}`, usGrade:n=>`US Grade ${n}`
    }
  };

  const lang=()=>document.documentElement.lang==='en'?'en':'zh';
  const tx=()=>copy[lang()];
  const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function context(){
    return {
      system:document.querySelector('[data-curriculum-system].active')?.dataset.curriculumSystem||'CN',
      level:Number(document.querySelector('[data-curriculum-level].active')?.dataset.curriculumLevel||0)
    };
  }

  function systemMeta(system,level){
    const c=tx();
    if(system==='England')return{placement:c.year(level),source:c.englandSource,note:c.englandNote};
    if(system==='US')return{placement:c.usGrade(level),source:c.usSource,note:c.usNote};
    return{placement:c.grade(level),source:c.cnSource,note:c.cnNote};
  }

  function buildWesternSnapshot(item){
    const {system,level}=context();
    const textEls=Array.from(item.querySelectorAll('.curriculum-item-text'));
    const guideEl=textEls.find(el=>/中文对照说明|Chinese comparison note/i.test(el.textContent));
    const guide=guideEl?.textContent?.replace(/^.*?[:：]\s*/,'').trim()||'';
    const requirementEl=textEls.find(el=>el!==guideEl);
    const requirement=requirementEl?.textContent?.replace(/^课程要求摘要[:：]\s*/,'').trim()||'';
    const compare=item.querySelector('[data-compare-concept]');
    return {
      type:'western',system,level,
      title:item.querySelector('.curriculum-item-title')?.textContent?.trim()||'',
      alt:item.querySelector('.curriculum-item-alt')?.textContent?.trim()||'',
      requirement,guide,
      codes:Array.from(item.querySelectorAll('.curriculum-codes .curriculum-code')).map(el=>el.textContent.trim()).filter(Boolean),
      related:Array.from(item.querySelectorAll('.curriculum-concept-links .curriculum-code')).map(el=>el.textContent.trim()).filter(Boolean),
      conceptId:compare?.dataset.compareConcept||''
    };
  }

  function buildChinaSnapshot(unit){
    const {level}=context();
    return {
      type:'china',system:'CN',level,
      title:unit.querySelector('.curriculum-unit-title')?.textContent?.trim()||'',
      order:unit.querySelector('.curriculum-unit-num')?.textContent?.trim()||'',
      semesterHeading:unit.closest('.curriculum-semester')?.querySelector('.curriculum-semester-head')?.textContent?.trim()||'',
      concepts:Array.from(unit.querySelectorAll('[data-cn-compare-concept]')).map(button=>({id:button.dataset.cnCompareConcept,label:button.textContent.trim()}))
    };
  }

  function detailHeader(snapshot){
    const c=tx(),meta=systemMeta(snapshot.system,snapshot.level),kind=snapshot.type==='china'?c.unit:c.requirement;
    return `<div class="curriculum-detail-top"><button type="button" class="curriculum-back" data-curriculum-back>← ${esc(c.back)}</button><span class="curriculum-detail-kind">${esc(kind)}</span></div><section class="curriculum-detail-hero"><div class="curriculum-eyebrow">MathBridge · ${esc(kind)}</div><h1>${esc(snapshot.title)}</h1>${snapshot.alt?`<div class="curriculum-detail-alt">${esc(snapshot.alt)}</div>`:''}<div class="curriculum-context-row"><span class="curriculum-context-chip">${esc(meta.placement)}</span>${snapshot.semesterHeading?`<span class="curriculum-context-chip">${esc(snapshot.semesterHeading)}</span>`:''}${snapshot.order?`<span class="curriculum-context-chip">${esc(snapshot.order)}</span>`:''}</div></section>`;
  }

  function westernDetail(snapshot){
    const c=tx(),meta=systemMeta(snapshot.system,snapshot.level);
    const related=snapshot.related.length?snapshot.related:(snapshot.alt?[snapshot.alt]:[]);
    return `${detailHeader(snapshot)}
      <div class="curriculum-detail-grid">
        <section class="curriculum-detail-card curriculum-detail-primary"><div class="curriculum-detail-label">${esc(c.requirement)}</div><p>${esc(snapshot.requirement)}</p>${snapshot.codes.length?`<div class="curriculum-detail-label detail-gap">${esc(c.codes)}</div><div class="curriculum-codes">${snapshot.codes.map(code=>`<span class="curriculum-code">${esc(code)}</span>`).join('')}</div>`:''}</section>
        <aside class="curriculum-detail-card"><div class="curriculum-detail-label">${esc(c.placement)}</div><p>${esc(meta.placement)}</p><div class="curriculum-detail-label detail-gap">${esc(c.source)}</div><p>${esc(meta.source)}</p></aside>
      </div>
      ${snapshot.guide?`<section class="curriculum-detail-card"><div class="curriculum-detail-label">${esc(c.interpretation)}</div><p>${esc(snapshot.guide)}</p></section>`:''}
      ${related.length?`<section class="curriculum-detail-card"><div class="curriculum-detail-label">${esc(c.related)}</div><div class="curriculum-related-list">${related.map(x=>`<span>${esc(x)}</span>`).join('')}</div></section>`:''}
      <section class="curriculum-detail-card curriculum-detail-next"><div><div class="curriculum-detail-label">${esc(c.next)}</div><p>${esc(c.useHint)}</p></div>${snapshot.conceptId?`<button type="button" class="curriculum-detail-compare" data-detail-compare="${esc(snapshot.conceptId)}">${esc(c.compare)}</button>`:''}</section>
      <details class="curriculum-sources curriculum-detail-source"><summary>${esc(c.source)}</summary><div class="curriculum-source-body"><div><strong>${esc(meta.source)}</strong></div><div>${esc(meta.note)}</div></div></details>`;
  }

  function chinaDetail(snapshot){
    const c=tx(),meta=systemMeta('CN',snapshot.level);
    return `${detailHeader(snapshot)}
      <div class="curriculum-detail-grid">
        <section class="curriculum-detail-card curriculum-detail-primary"><div class="curriculum-detail-label">${esc(c.unit)}</div><h2>${esc(snapshot.title)}</h2><p>${esc(meta.note)}</p></section>
        <aside class="curriculum-detail-card"><div class="curriculum-detail-label">${esc(c.placement)}</div><p>${esc(meta.placement)} · ${esc(snapshot.semesterHeading)}${snapshot.order?` · ${esc(snapshot.order)}`:''}</p><div class="curriculum-detail-label detail-gap">${esc(c.source)}</div><p>${esc(meta.source)}</p></aside>
      </div>
      <section class="curriculum-detail-card"><div class="curriculum-detail-label">${esc(c.related)}</div>${snapshot.concepts.length?`<div class="curriculum-detail-concepts">${snapshot.concepts.map(x=>`<button type="button" data-detail-cn-compare="${esc(x.id)}"><span>${esc(x.label)}</span><small>${esc(c.compareTopic)} →</small></button>`).join('')}</div>`:`<p>${esc(c.noConcepts)}</p>`}</section>
      <section class="curriculum-detail-card curriculum-detail-next"><div><div class="curriculum-detail-label">${esc(c.next)}</div><p>${esc(c.useHint)}</p></div></section>
      <details class="curriculum-sources curriculum-detail-source"><summary>${esc(c.source)}</summary><div class="curriculum-source-body"><div><strong>${esc(meta.source)}</strong></div><div>${esc(meta.note)}</div></div></details>`;
  }

  function openDetail(snapshot){
    const root=document.getElementById('curriculumContent');if(!root)return;
    state.open=true;state.snapshot=snapshot;root.dataset.detailOpen='1';
    root.innerHTML=snapshot.type==='china'?chinaDetail(snapshot):westernDetail(snapshot);
    const u=new URL(location.href);u.searchParams.set('view','curriculum');u.searchParams.set('detail','1');history.replaceState(null,'',u);
    root.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function closeDetail(){
    state.open=false;state.snapshot=null;
    const root=document.getElementById('curriculumContent');if(root)delete root.dataset.detailOpen;
    document.querySelector('[data-curriculum-level].active')?.click();
    const u=new URL(location.href);u.searchParams.delete('detail');history.replaceState(null,'',u);
  }

  function triggerExistingCompare(selector){
    closeDetail();
    requestAnimationFrame(()=>document.querySelector(selector)?.click());
  }

  function markInteractive(){
    if(state.open)return;
    document.querySelectorAll('.curriculum-item,.curriculum-unit').forEach(el=>{
      el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',tx().open);el.classList.add('curriculum-clickable');
    });
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('[data-curriculum-back]')){closeDetail();return;}
    const detailCompare=event.target.closest('[data-detail-compare]');
    if(detailCompare){triggerExistingCompare(`[data-compare-concept="${CSS.escape(detailCompare.dataset.detailCompare)}"]`);return;}
    const detailCn=event.target.closest('[data-detail-cn-compare]');
    if(detailCn){triggerExistingCompare(`[data-cn-compare-concept="${CSS.escape(detailCn.dataset.detailCnCompare)}"]`);return;}

    const item=event.target.closest('.curriculum-item');
    if(item&&!event.target.closest('.curriculum-compare-btn')){openDetail(buildWesternSnapshot(item));return;}
    const unit=event.target.closest('.curriculum-unit');
    if(unit&&!event.target.closest('[data-cn-compare-concept]')){openDetail(buildChinaSnapshot(unit));return;}
    if(state.open&&event.target.closest('[data-curriculum-system], [data-curriculum-level]'))state.open=false;
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&state.open){closeDetail();return;}
    if((event.key==='Enter'||event.key===' ')&&event.target.matches('.curriculum-item,.curriculum-unit')){event.preventDefault();event.target.click();}
  });

  const app=document.getElementById('curriculumApp');
  if(app)new MutationObserver(markInteractive).observe(app,{childList:true,subtree:true});
  markInteractive();
})();