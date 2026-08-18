(() => {
  'use strict';

  const state = { mode:'compare', system:'CN', level:3, query:'', ready:false };
  const data = {
    concepts:new Map(), pep:null, pepUnitMap:null, sources:new Map(),
    englandProgressions:[], usProgressions:[], crossSystemDocs:[], zhComparisons:new Map()
  };

  const docs = {
    englandProgressions:[
      'database/research/england_primary_number_progression_verified.json',
      'database/research/england_operations_progression_verified.json'
    ],
    usProgressions:[
      'database/research/us_common_core_number_progression_verified.json',
      'database/research/us_common_core_operations_progression_verified.json'
    ],
    crossSystem:[
      'database/research/number_place_value_verified.json',
      'database/research/number_upper_primary_curriculum_verified.json',
      'database/research/algebraic_thinking_curriculum_verified.json',
      'database/research/geometry_curriculum_verified.json',
      'database/research/measurement_curriculum_verified.json',
      'database/research/statistics_probability_curriculum_verified.json',
      'database/research/mathematical_practices_cross_system_verified.json'
    ]
  };

  const copy = {
    zh:{
      compare:'对照 Compare', curriculum:'课程 Curriculum', title:'小学数学课程',
      subtitle:'先看每个体系实际学什么，再进入概念对照，理解教学顺序、方法和原因。',
      system:'课程体系', level:'年级 / Year', search:'搜索课程内容',
      systems:{CN:'中国 · 人教版',England:'英国 · 英格兰',US:'美国 · Common Core'},
      cnNote:'这里显示已核实的人教版修订教材编排。人教版是教材对照层之一，不代表中国所有学校都使用同一教材。',
      englandNote:'英国模式使用英格兰 National Curriculum 的 Year 1–6 法定课程要求；不把英格兰要求描述成整个英国统一课程。',
      usNote:'美国模式以 Common Core 作为比较基线，并不代表美国所有州使用同一课程。California / Texas 差异仍在对照模式中单独显示。',
      sourceLanguage:'英国/美国课程摘要保留核实后的英文原意；中文概念名称用于快速浏览。',
      upper:'上册', lower:'下册', unit:'单元', items:n=>`${n} 项课程内容`,
      compareTopic:'进入对照', sourceDetails:'来源与课程依据', noResults:'没有匹配的课程内容。',
      originalSummary:'课程要求摘要', chineseGuide:'中文对照说明',
      domains:{number:'数与运算',algebra:'代数思维',geometry:'图形与几何',measurement:'测量',statistics:'统计与概率',practices:'数学思维与实践',other:'其他'}
    },
    en:{
      compare:'Compare', curriculum:'Curriculum', title:'Primary mathematics curriculum',
      subtitle:'Browse what each system actually teaches first, then move into concept comparison to examine sequence, pedagogy and rationale.',
      system:'Curriculum system', level:'Year / Grade', search:'Search curriculum',
      systems:{CN:'China · revised PEP',England:'England',US:'US · Common Core'},
      cnNote:'This view shows the verified revised PEP sequence. PEP is one textbook comparison layer and is not used by every school in China.',
      englandNote:'UK mode uses the statutory National Curriculum in England for Years 1–6; it is not presented as one curriculum for all UK nations.',
      usNote:'US mode uses Common Core as a comparison baseline. It is not a national curriculum and does not represent every state.',
      sourceLanguage:'Curriculum summaries are concise source-grounded paraphrases rather than full reproduced standards.',
      upper:'Upper', lower:'Lower', unit:'Unit', items:n=>`${n} curriculum items`,
      compareTopic:'Compare topic', sourceDetails:'Sources & curriculum basis', noResults:'No matching curriculum content.',
      originalSummary:'Curriculum summary', chineseGuide:'Chinese comparison note',
      domains:{number:'Number & operations',algebra:'Algebraic thinking',geometry:'Geometry',measurement:'Measurement',statistics:'Statistics & probability',practices:'Mathematical thinking & practices',other:'Other'}
    }
  };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
  const tx = () => copy[lang()];
  const json = async path => { const r=await fetch(path,{cache:'no-cache'}); if(!r.ok) throw new Error(`${r.status} ${path}`); return r.json(); };

  function flattenTaxonomy(taxonomy){
    for(const domain of taxonomy.domains||[]){
      for(const sub of domain.subdomains||[]){
        for(const concept of sub.concepts||[]){
          data.concepts.set(concept.id,{...concept,domain_id:domain.id,domain_cn:domain.name_cn,domain_en:domain.name_en,subdomain_cn:sub.name_cn,subdomain_en:sub.name_en});
        }
      }
    }
  }

  function conceptName(id){
    const c=data.concepts.get(id);
    if(!c) return id || '';
    return lang()==='zh' ? (c.name_cn||c.name_en||id) : (c.name_en||c.name_cn||id);
  }
  function conceptAlt(id){
    const c=data.concepts.get(id);
    if(!c) return '';
    return lang()==='zh' ? (c.name_en||'') : (c.name_cn||'');
  }

  function domainKeyForConcept(id){
    const c=data.concepts.get(id); const raw=String(c?.domain_id||c?.domain_en||'').toLowerCase();
    if(/number|operation|fraction|decimal|factor/.test(raw)) return 'number';
    if(/algebra|pattern|ratio|proportion/.test(raw)) return 'algebra';
    if(/geometry|shape|position|transform/.test(raw)) return 'geometry';
    if(/measure/.test(raw)) return 'measurement';
    if(/statistic|probab|data/.test(raw)) return 'statistics';
    if(/practice|reason|problem|model/.test(raw)) return 'practices';
    return 'other';
  }

  function humanize(key){ return String(key).replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase()); }

  async function loadChineseComparisons(){
    try{
      const manifest=await json('database/comparisons/bilingual_coverage_manifest.json');
      const files=[...new Set((manifest.domains||[]).flatMap(d=>d.zh_files||[]))];
      const loaded=await Promise.all(files.map(f=>json(`database/comparisons/${f}`)));
      loaded.forEach(doc=>(doc.records||[]).forEach(r=>data.zhComparisons.set(r.concept_id,r)));
    }catch(_){ /* curriculum browser remains usable without this helper layer */ }
  }

  async function loadData(){
    const [taxonomy,pep,pepUnitMap,sources,...rest]=await Promise.all([
      json('database/concept_taxonomy.json'),
      json('database/research/cn_pep_current_sequence_verified_2026.json'),
      json('database/research/cn_pep_unit_concept_map_2026.json'),
      json('database/sources.json'),
      ...docs.englandProgressions.map(json),...docs.usProgressions.map(json),...docs.crossSystem.map(json)
    ]);
    flattenTaxonomy(taxonomy); data.pep=pep; data.pepUnitMap=pepUnitMap;
    (sources.sources||[]).forEach(s=>data.sources.set(s.id,s));
    let offset=0;
    data.englandProgressions=rest.slice(offset,offset+=docs.englandProgressions.length);
    data.usProgressions=rest.slice(offset,offset+=docs.usProgressions.length);
    data.crossSystemDocs=rest.slice(offset);
    await loadChineseComparisons();
    state.ready=true; renderCurriculum();
  }

  function buildShell(){
    if(document.getElementById('productNavWrap')) return;
    const header=document.querySelector('.topbar');
    const nav=document.createElement('div'); nav.id='productNavWrap'; nav.className='product-nav-wrap';
    nav.innerHTML=`<div class="product-nav" role="navigation" aria-label="MathBridge mode"><button type="button" data-product-mode="compare" class="active"></button><button type="button" data-product-mode="curriculum"></button></div>`;
    header?.insertAdjacentElement('afterend',nav);

    const app=document.createElement('section'); app.id='curriculumApp'; app.className='curriculum-app';
    app.innerHTML=`<div class="curriculum-layout"><aside class="curriculum-sidebar"><div class="curriculum-sidebar-section"><div class="curriculum-label" id="curriculumSystemLabel"></div><div class="curriculum-system-tabs"><button type="button" data-curriculum-system="CN" class="active"></button><button type="button" data-curriculum-system="England"></button><button type="button" data-curriculum-system="US"></button></div></div><div class="curriculum-sidebar-section"><div class="curriculum-label" id="curriculumLevelLabel"></div><div class="curriculum-grade-grid">${[1,2,3,4,5,6].map(n=>`<button type="button" class="curriculum-grade-btn ${n===3?'active':''}" data-curriculum-level="${n}">${n}</button>`).join('')}</div></div><div class="curriculum-sidebar-section"><div class="curriculum-label" id="curriculumSearchLabel"></div><input id="curriculumSearch" class="curriculum-search" type="search" autocomplete="off"></div></aside><main class="curriculum-main" id="curriculumContent"><div class="loading">Loading curriculum…</div></main></div>`;
    document.querySelector('.app-shell')?.insertAdjacentElement('afterend',app);
    setMode('compare',false); updateLabels();
  }

  function setMode(mode,push=true){
    state.mode=mode;
    document.body.classList.toggle('curriculum-mode',mode==='curriculum');
    document.body.classList.toggle('compare-mode',mode==='compare');
    document.querySelectorAll('[data-product-mode]').forEach(b=>b.classList.toggle('active',b.dataset.productMode===mode));
    if(push){ const u=new URL(location.href); if(mode==='curriculum')u.searchParams.set('view','curriculum');else u.searchParams.delete('view'); history.replaceState(null,'',u); }
    if(mode==='curriculum') renderCurriculum();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function updateLabels(){
    const c=tx();
    const modeBtns=document.querySelectorAll('[data-product-mode]');
    if(modeBtns[0])modeBtns[0].textContent=c.compare; if(modeBtns[1])modeBtns[1].textContent=c.curriculum;
    document.getElementById('curriculumSystemLabel')?.replaceChildren(document.createTextNode(c.system));
    document.getElementById('curriculumLevelLabel')?.replaceChildren(document.createTextNode(c.level));
    document.getElementById('curriculumSearchLabel')?.replaceChildren(document.createTextNode(c.search));
    const search=document.getElementById('curriculumSearch'); if(search)search.placeholder=c.search;
    document.querySelectorAll('[data-curriculum-system]').forEach(b=>b.textContent=c.systems[b.dataset.curriculumSystem]);
  }

  function parseProgressionDocs(system){
    const collection=system==='England'?data.englandProgressions:data.usProgressions;
    const field=system==='England'?'years':'grades'; const levelKey=system==='England'?'year':'grade'; const out=[];
    for(const doc of collection){
      const level=(doc[field]||[]).find(x=>Number(x[levelKey])===state.level); if(!level) continue;
      for(const [key,val] of Object.entries(level)){
        if(key===levelKey || !val || typeof val!=='object' || !val.summary) continue;
        const ids=val.concept_ids||[];
        out.push({conceptId:ids[0]||'',conceptIds:ids,title:humanize(key),text:val.summary,codes:val.standard_codes||[],sourceIds:doc.source_ids||[],domain:domainKeyForConcept(ids[0])});
      }
    }
    return out;
  }

  function placementsFromRecord(record,system){
    const obj=record?.[system==='England'?'UK':'US']; if(!obj) return [];
    return (obj.placement||[]).filter(p=>Number(p[system==='England'?'year':'grade'])===state.level).map(p=>({
      conceptId:record.concept_id,conceptIds:[record.concept_id],title:conceptName(record.concept_id),alt:conceptAlt(record.concept_id),text:p.expectation||p.summary||'',codes:p.standard_codes||[],sourceIds:[obj.source_id].filter(Boolean),domain:domainKeyForConcept(record.concept_id)
    }));
  }

  function parseCrossSystemDocs(system){
    const out=[];
    for(const doc of data.crossSystemDocs){
      const records=doc.concepts||doc.records||doc.practices||[];
      for(const record of records) out.push(...placementsFromRecord(record,system));
    }
    return out;
  }

  function dedupeItems(items){
    const seen=new Set();
    return items.filter(item=>{const key=`${item.conceptId}|${item.text}`.toLowerCase();if(!item.text||seen.has(key))return false;seen.add(key);return true;});
  }

  function matches(item){
    const q=state.query.trim().toLowerCase(); if(!q)return true;
    return [item.title,item.alt,item.text,...(item.codes||[]),...(item.conceptIds||[]).map(conceptName)].join(' ').toLowerCase().includes(q);
  }

  function chineseGuide(item,system){
    if(lang()!=='zh'||!item.conceptId)return '';
    const record=data.zhComparisons.get(item.conceptId); const entry=record?.[system]; return entry?.difference_cn||'';
  }

  function sourceDetails(ids){
    const c=tx(); const unique=[...new Set(ids.filter(Boolean))]; if(!unique.length)return '';
    return `<details class="curriculum-sources"><summary>${esc(c.sourceDetails)}</summary><div class="curriculum-source-body">${unique.map(id=>{const s=data.sources.get(id);return `<div><strong>${esc(s?.title||s?.title_en||id)}</strong>${s?.organization?` · ${esc(s.organization)}`:''}</div>`}).join('')}</div></details>`;
  }

  function renderWestern(){
    const c=tx(),system=state.system;
    let items=dedupeItems([...parseProgressionDocs(system),...parseCrossSystemDocs(system)]).filter(matches);
    const grouped=new Map();
    for(const item of items){const k=item.domain||'other';if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(item)}
    const order=['number','algebra','geometry','measurement','statistics','practices','other'];
    const sourceIds=[...new Set(items.flatMap(i=>i.sourceIds||[]))];
    const blocks=order.filter(k=>grouped.has(k)).map(k=>{
      const rows=grouped.get(k);
      return `<section class="curriculum-domain"><div class="curriculum-domain-head"><h2>${esc(c.domains[k])}</h2><span class="curriculum-domain-count">${esc(c.items(rows.length))}</span></div><div class="curriculum-items">${rows.map(item=>{
        const guide=chineseGuide(item,system);
        return `<article class="curriculum-item"><div><div class="curriculum-item-title">${esc(item.title||conceptName(item.conceptId))}</div>${item.alt?`<div class="curriculum-item-alt">${esc(item.alt)}</div>`:''}${guide?`<div class="curriculum-item-text"><strong>${esc(c.chineseGuide)}：</strong>${esc(guide)}</div>`:''}<div class="curriculum-item-text"><strong>${lang()==='zh'?`${esc(c.originalSummary)}：`:''}</strong>${esc(item.text)}</div>${item.conceptIds?.length>1?`<div class="curriculum-concept-links">${item.conceptIds.slice(0,8).map(id=>`<span class="curriculum-code">${esc(conceptName(id))}</span>`).join('')}</div>`:''}${item.codes?.length?`<div class="curriculum-codes">${item.codes.map(code=>`<span class="curriculum-code">${esc(code)}</span>`).join('')}</div>`:''}</div>${item.conceptId?`<button type="button" class="curriculum-compare-btn" data-compare-concept="${esc(item.conceptId)}">${esc(c.compareTopic)}</button>`:''}</article>`
      }).join('')}</div></section>`
    }).join('');
    return `${blocks||`<div class="curriculum-empty">${esc(c.noResults)}</div>`}${sourceDetails(sourceIds)}`;
  }

  function pepConceptsFor(grade,semester,title){
    const volume=(data.pepUnitMap?.volumes||[]).find(v=>Number(v.grade)===Number(grade)&&v.semester===semester); const unit=(volume?.units||[]).find(u=>u.title_cn===title); return unit?.concept_ids||[];
  }

  function renderChina(){
    const c=tx(); const volumes=(data.pep?.volumes||[]).filter(v=>Number(v.grade)===state.level);
    const q=state.query.trim().toLowerCase();
    const cards=['upper','lower'].map(sem=>{
      const v=volumes.find(x=>x.semester===sem); if(!v)return '';
      const units=(v.units||[]).map((u,index)=>({u,index,ids:pepConceptsFor(state.level,sem,u.title_cn)})).filter(x=>!q||[x.u.title_cn,...x.ids.map(conceptName)].join(' ').toLowerCase().includes(q));
      return `<section class="curriculum-semester"><div class="curriculum-semester-head">${esc(sem==='upper'?c.upper:c.lower)}</div>${units.length?units.map(({u,index,ids})=>`<div class="curriculum-unit"><div class="curriculum-unit-num">${esc(c.unit)} ${u.order||index+1}</div><div class="curriculum-unit-title">${esc(u.title_cn)}</div>${ids.length?`<div class="curriculum-concept-links">${ids.slice(0,12).map(id=>`<button type="button" class="curriculum-concept-link" data-cn-compare-concept="${esc(id)}">${esc(conceptName(id))}</button>`).join('')}</div>`:''}</div>`).join(''):`<div class="curriculum-unit"><span class="muted">${esc(c.noResults)}</span></div>`}</section>`;
    }).join('');
    return `<div class="curriculum-unit-list">${cards}</div>${sourceDetails(['cn-pep-primary-math-compilation-table-2024','cn-pep-math-new-edition-intro-2024'])}`;
  }

  function hero(){
    const c=tx(); const systemLabel=c.systems[state.system];
    const levelLabel=state.system==='CN'?(lang()==='zh'?`中国 ${state.level} 年级`:`China Grade ${state.level}`):state.system==='England'?`Year ${state.level}`:`Grade ${state.level}`;
    const note=state.system==='CN'?c.cnNote:state.system==='England'?c.englandNote:c.usNote;
    return `<section class="curriculum-hero"><div class="curriculum-eyebrow">MathBridge · ${esc(c.curriculum)}</div><h1>${esc(c.title)}</h1><p>${esc(c.subtitle)}</p><div class="curriculum-context-row"><span class="curriculum-context-chip">${esc(systemLabel)}</span><span class="curriculum-context-chip">${esc(levelLabel)}</span></div></section><div class="curriculum-note">${esc(note)}${state.system!=='CN'&&lang()==='zh'?`<br><span class="muted">${esc(c.sourceLanguage)}</span>`:''}</div>`;
  }

  function renderCurriculum(){
    if(!state.ready)return; updateLabels();
    const root=document.getElementById('curriculumContent'); if(!root)return;
    root.innerHTML=hero()+(state.system==='CN'?renderChina():renderWestern());
  }

  function compareConcept(id,fromChina=false){
    setMode('compare');
    if(fromChina){ document.querySelector(`[data-grade="${state.level}"]`)?.click(); }
    if(state.system==='England')document.querySelector('[data-system="England"]')?.click();
    if(state.system==='US')document.querySelector('[data-system="US"]')?.click();
    document.getElementById('scopeAll')?.click();
    requestAnimationFrame(()=>{
      const target=Array.from(document.querySelectorAll('.topic-btn[data-concept]')).find(b=>b.dataset.concept===id); target?.click();
      document.querySelector('.content')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  function quietEvidence(){
    document.querySelectorAll('#content .evidence-list').forEach(list=>{
      const card=list.closest('.card'); if(!card||card.dataset.evidenceQuiet==='1')return; card.dataset.evidenceQuiet='1'; card.classList.add('evidence-quiet');
      const c=tx(); const details=document.createElement('details'); const summary=document.createElement('summary'); summary.textContent=lang()==='zh'?'来源与依据':'Sources & evidence';
      const body=document.createElement('div'); body.className='evidence-quiet-body'; while(card.firstChild)body.appendChild(card.firstChild); details.append(summary,body); card.appendChild(details);
    });
  }

  document.addEventListener('click',event=>{
    const mode=event.target.closest('[data-product-mode]'); if(mode){setMode(mode.dataset.productMode);return;}
    const system=event.target.closest('[data-curriculum-system]'); if(system){state.system=system.dataset.curriculumSystem;document.querySelectorAll('[data-curriculum-system]').forEach(b=>b.classList.toggle('active',b===system));renderCurriculum();return;}
    const level=event.target.closest('[data-curriculum-level]'); if(level){state.level=Number(level.dataset.curriculumLevel);document.querySelectorAll('[data-curriculum-level]').forEach(b=>b.classList.toggle('active',b===level));renderCurriculum();return;}
    const compare=event.target.closest('[data-compare-concept]'); if(compare){compareConcept(compare.dataset.compareConcept,false);return;}
    const cnCompare=event.target.closest('[data-cn-compare-concept]'); if(cnCompare){compareConcept(cnCompare.dataset.cnCompareConcept,true);return;}
    if(event.target.closest('#langBtn'))setTimeout(()=>{updateLabels();renderCurriculum();quietEvidence();},0);
  });
  document.addEventListener('input',event=>{if(event.target.id==='curriculumSearch'){state.query=event.target.value;renderCurriculum();}});

  const content=document.getElementById('content'); if(content)new MutationObserver(quietEvidence).observe(content,{childList:true,subtree:true});
  buildShell(); quietEvidence();
  if(new URLSearchParams(location.search).get('view')==='curriculum')setMode('curriculum',false);
  loadData().catch(error=>{const root=document.getElementById('curriculumContent');if(root)root.innerHTML=`<div class="curriculum-empty">Curriculum data failed to load: ${esc(error.message)}</div>`;});
})();