(() => {
  'use strict';

  const state = {
    lang: 'zh',
    grade: 3,
    semester: 'all',
    system: 'England',
    usJurisdiction: 'Common Core baseline',
    scope: 'grade',
    query: '',
    conceptId: null,
    ready: false
  };

  const db = {
    concepts: [], conceptById: new Map(), comparisons: { zh: new Map(), en: new Map() },
    profiles: new Map(), tasks: new Map(), taskZh: new Map(), representations: new Map(), moves: new Map(),
    questions: new Map(), misconceptions: new Map(), diagnosticLinks: new Map(), evidenceClass: new Map(),
    pepPlacements: new Map(), pepArtifacts: new Map(), sources: new Map(), stateOverlays: new Map()
  };

  const ui = {
    zh: {
      brandSub:'小学数学课程与教学对照', research:'研究数据 · 2026-08-18', filters:'筛选', grade:'中国年级', semester:'学期', allYear:'全年', upper:'上册', lower:'下册', compare:'对照课程', usLayer:'美国课程层', scope:'浏览范围', currentGrade:'当前年级教材', allConcepts:'全部概念', search:'搜索数学概念', topics:'概念', resultCount:n=>`${n} 个概念`,
      stage:'中国国家课程', pep:'人教版修订教材', comparison:'课程对照', why:'为什么这样对照', classroom:'课堂可用', representations:'可用表征', moves:'教学动作', diagnostic:'诊断提问', evidence:'证据', source:'来源',
      verifiedPep:'人教版年级/学期/单元已核实', noPep:'所选年级/学期没有已登记的人教版单元位置', unitOnly:'单元已核实；更细内容按证据显示', rollout:'实际使用情况按地区和学期确认',
      baseline:'美国 Common Core 基线', california:'California', texas:'Texas', england:'英格兰', selectedGrade:g=>`中国 ${g} 年级`, stageLabel:g=>g<=2?'第一学段（1–2年级）':g<=4?'第二学段（3–4年级）':'第三学段（5–6年级）',
      comparisonEmpty:'该概念暂无已登记的州级映射。可切换到 Common Core 基线查看核心对照。', whyEmpty:'该州级映射只用于课程位置。课堂建议保持为通用教学选项，不作为州级教学要求。',
      taskPrompt:'教师提问', purpose:'目的', useWhen:'适用时机', expected:'预期思考', listenFor:'观察重点', variation:'变化方式', option:'教学选项，不代表某地区统一做法',
      diagnosticProbe:'诊断提问（非正式测评）', followup:'继续追问', noDiagnostic:'该概念暂无可显示的诊断提问。',
      direct_empirical:'有直接研究支持', direct_empirical_language_mediated:'有直接研究支持（受语言因素影响）', direct_empirical_broad_construct_or_mechanism:'相关直接研究支持（具体表述需谨慎）', evidence_synthesis_or_guidance:'研究综述或证据指南支持', guidance_supported:'教学指导支持', curriculum_inferred_with_broader_support:'课堂诊断提示（有相关研究支持）', curriculum_inferred_probe_only:'课堂诊断提示',
      sourceTypes:{official_curriculum:'官方课程标准',teaching_guidance:'教学指导',textbook:'教材证据',research:'研究证据',classroom_practice:'课堂资源'},
      noData:'没有可显示的数据。', noResults:'没有匹配的概念。', loadError:'数据加载失败。请刷新页面重试。',
      footer1:'对照按数学概念匹配，不按相同年级编号自动对应。', footer2:'人教版是教材对照层之一，不代表中国所有学校使用同一教材。',
      cnPlacement:'中国课程位置', comparePlacement:'对照课程位置', instructionalUse:'课堂建议', systemEvidence:'表征证据状态',
      stateNote:'州级课程位置', allPlacements:'人教版相关位置', selectedPlacement:'所选年级位置'
    },
    en: {
      brandSub:'Primary mathematics curriculum comparison', research:'Research data · 2026-08-18', filters:'Filters', grade:'China grade', semester:'Semester', allYear:'Full year', upper:'Upper', lower:'Lower', compare:'Comparison framework', usLayer:'US curriculum layer', scope:'Browse scope', currentGrade:'Selected China grade', allConcepts:'All concepts', search:'Search concepts', topics:'Concepts', resultCount:n=>`${n} concepts`,
      stage:'China national curriculum', pep:'Revised PEP textbooks', comparison:'Curriculum comparison', why:'Why this comparison', classroom:'Classroom use', representations:'Representations', moves:'Teaching moves', diagnostic:'Diagnostic probe', evidence:'Evidence', source:'Source',
      verifiedPep:'PEP grade/semester/unit verified', noPep:'No registered revised-PEP unit placement for the selected grade/semester', unitOnly:'Unit verified; finer detail follows its evidence level', rollout:'Actual use depends on locality and term',
      baseline:'US — Common Core baseline', california:'California', texas:'Texas', england:'England', selectedGrade:g=>`China Grade ${g}`, stageLabel:g=>g<=2?'Learning Stage 1 (Grades 1–2)':g<=4?'Learning Stage 2 (Grades 3–4)':'Learning Stage 3 (Grades 5–6)',
      comparisonEmpty:'No registered state mapping for this concept. Switch to the Common Core baseline to view the core comparison.', whyEmpty:'This state overlay records curriculum placement only. Classroom suggestions remain general teaching options, not state requirements.',
      taskPrompt:'Teacher prompt', purpose:'Purpose', useWhen:'Use when', expected:'Expected thinking', listenFor:'Listen for', variation:'Variation', option:'Teaching option; not a claim of uniform national practice',
      diagnosticProbe:'Diagnostic probe (not a formal assessment)', followup:'Follow-up', noDiagnostic:'No diagnostic probe is currently available for this concept.',
      direct_empirical:'Direct research support', direct_empirical_language_mediated:'Direct research support with language-related limits', direct_empirical_broad_construct_or_mechanism:'Related direct research; exact wording is narrower', evidence_synthesis_or_guidance:'Evidence synthesis or guidance support', guidance_supported:'Teaching-guidance support', curriculum_inferred_with_broader_support:'Instructional probe with broader research support', curriculum_inferred_probe_only:'Instructional diagnostic hypothesis',
      sourceTypes:{official_curriculum:'Official curriculum',teaching_guidance:'Teaching guidance',textbook:'Textbook evidence',research:'Research evidence',classroom_practice:'Classroom resource'},
      noData:'No data available.', noResults:'No matching concepts.', loadError:'Data failed to load. Refresh the page and try again.',
      footer1:'Comparisons are aligned by mathematical concept, not by matching grade numbers.', footer2:'PEP is one textbook comparison layer; it is not used by every school in China.',
      cnPlacement:'China placement', comparePlacement:'Comparison placement', instructionalUse:'Classroom suggestion', systemEvidence:'Representation evidence status',
      stateNote:'State curriculum placement', allPlacements:'Relevant PEP placements', selectedPlacement:'Selected-grade placement'
    }
  };

  const $ = id => document.getElementById(id);
  const t = () => ui[state.lang];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const semesterLabel = sem => state.lang === 'zh' ? (sem === 'upper' ? '上册' : '下册') : (sem === 'upper' ? 'Upper' : 'Lower');

  async function json(path, required=true) {
    try {
      const res = await fetch(path, { cache:'no-cache' });
      if (!res.ok) throw new Error(`${res.status} ${path}`);
      return await res.json();
    } catch (err) {
      if (required) throw err;
      console.warn('Optional data unavailable:', path, err);
      return null;
    }
  }

  function flattenTaxonomy(taxonomy) {
    const out = [];
    for (const domain of taxonomy.domains || []) {
      for (const sub of domain.subdomains || []) {
        for (const c of sub.concepts || []) {
          out.push({ ...c, domain_id:domain.id, domain_en:domain.name_en, domain_cn:domain.name_cn, subdomain_id:sub.id, subdomain_en:sub.name_en, subdomain_cn:sub.name_cn });
        }
      }
    }
    return out;
  }

  async function loadComparisons() {
    const manifest = await json('database/comparisons/bilingual_coverage_manifest.json');
    const zhFiles = [...new Set((manifest.domains||[]).flatMap(d=>d.zh_files||[]))];
    const enFiles = [...new Set((manifest.domains||[]).flatMap(d=>d.en_files||[]))];
    const [zhDocs,enDocs] = await Promise.all([
      Promise.all(zhFiles.map(f=>json(`database/comparisons/${f}`))),
      Promise.all(enFiles.map(f=>json(`database/comparisons/${f}`)))
    ]);
    zhDocs.forEach(doc => (doc.records||[]).forEach(r=>db.comparisons.zh.set(r.concept_id,r)));
    enDocs.forEach(doc => (doc.records||[]).forEach(r=>db.comparisons.en.set(r.concept_id,r)));
  }

  async function loadProfiles() {
    const manifest = await json('database/intelligence/concept_intelligence_manifest.json');
    const docs = await Promise.all((manifest.profile_files||[]).map(f=>json(f.path)));
    docs.forEach(doc => (doc.profiles||[]).forEach(p=>db.profiles.set(p.concept_id,p)));
  }

  async function loadTasks() {
    const manifest = await json('database/classroom_tasks/runtime_manifest.json');
    const baseDocs = await Promise.all((manifest.base_task_files||[]).map(f=>json(`database/classroom_tasks/${f}`)));
    baseDocs.forEach(doc => (doc.records||[]).forEach(r=>db.tasks.set(r.concept_id,r)));
    const zhDocs = await Promise.all((manifest.zh_overlay_files||[]).map(f=>json(`database/classroom_tasks/${f}`)));
    zhDocs.forEach(doc => (doc.records||[]).forEach(r=>db.taskZh.set(r.task_id,r)));
  }

  async function loadDiagnostics() {
    const manifest = await json('database/intelligence/diagnostic_extension_manifest_2026-08-18.json');
    const qPaths = ['database/diagnostics/diagnostic_question_catalog.json', ...(manifest.diagnostic_question_files||[])];
    const mPaths = ['database/diagnostics/misconception_catalog.json', ...(manifest.misconception_files||[])];
    const [qDocs,mDocs,linkDocs,evidence] = await Promise.all([
      Promise.all([...new Set(qPaths)].map(p=>json(p))),
      Promise.all([...new Set(mPaths)].map(p=>json(p))),
      Promise.all((manifest.link_files||[]).map(p=>json(p))),
      json('database/validation/diagnostic_full_evidence_classification_2026-08-18.json')
    ]);
    qDocs.forEach(doc => (doc.questions||[]).forEach(q=>db.questions.set(q.id,q)));
    mDocs.forEach(doc => (doc.misconceptions||[]).forEach(m=>db.misconceptions.set(m.id,m)));
    linkDocs.forEach(doc => (doc.links||[]).forEach(link => {
      const current = db.diagnosticLinks.get(link.concept_id) || { misconceptions:[], questions:[] };
      current.misconceptions.push(...(link.add_misconception_ids||[]));
      current.questions.push(...(link.add_diagnostic_question_ids||[]));
      db.diagnosticLinks.set(link.concept_id,current);
    }));
    Object.entries(evidence.effective_evidence_groups||{}).forEach(([klass,group]) => (group.ids||[]).forEach(id=>db.evidenceClass.set(id,klass)));
  }

  async function loadTeaching() {
    const [base,extended,moves] = await Promise.all([
      json('database/teaching/representation_catalog.json'),
      json('database/teaching/representation_catalog_extended.json'),
      json('database/teaching/teaching_moves_catalog.json')
    ]);
    [...(base.representations||[]),...(extended.representations||[])].forEach(r=>db.representations.set(r.id,r));
    (moves.moves||[]).forEach(m=>db.moves.set(m.id,m));
  }

  async function loadPep() {
    const [sequence,map,corrections,artifacts] = await Promise.all([
      json('database/research/cn_pep_current_sequence_verified_2026.json'),
      json('database/research/cn_pep_unit_concept_map_2026.json'),
      json('database/research/cn_pep_unit_concept_corrections_2026.json'),
      json('database/research/cn_pep_artifact_completion_classification_2026.json')
    ]);
    const orderMap = new Map();
    for (const v of sequence.volumes||[]) for (const u of v.units||[]) orderMap.set(`${v.grade}|${v.semester}|${u.title_cn}`,u.order);
    const correctionMap = new Map();
    for (const c of corrections.corrections||[]) correctionMap.set(`${c.grade}|${c.semester}|${c.unit_title_cn}`,new Set(c.remove_concept_ids||[]));
    for (const v of map.volumes||[]) {
      for (const u of v.units||[]) {
        const removed = correctionMap.get(`${v.grade}|${v.semester}|${u.title_cn}`) || new Set();
        for (const conceptId of (u.concept_ids||[]).filter(id=>!removed.has(id))) {
          const arr = db.pepPlacements.get(conceptId)||[];
          arr.push({grade:v.grade,semester:v.semester,unit:u.title_cn,order:orderMap.get(`${v.grade}|${v.semester}|${u.title_cn}`),mappingStatus:u.mapping_status||'unit_title'});
          db.pepPlacements.set(conceptId,arr);
        }
      }
    }
    for (const a of artifacts.volumes||[]) db.pepArtifacts.set(`${a.grade}|${a.semester}`,a);
  }

  async function loadSources() {
    const paths = [
      'database/sources.json',
      'database/evidence/source_registry_extension_2026-08-18.json',
      'database/research/sources_pep_sequence_extension_2026-08-18.json',
      'database/research/sources_research_extension_2026-08-18.json',
      'database/research/sources_research_extension_2_2026-08-18.json',
      'database/research/sources_research_extension_3_2026-08-18.json'
    ];
    const docs = await Promise.all(paths.map(p=>json(p,false)));
    docs.filter(Boolean).forEach(doc => (doc.sources||[]).forEach(s=>db.sources.set(s.id,{...(db.sources.get(s.id)||{}),...s})));
  }

  async function loadStateOverlays() {
    const docs = await Promise.all([
      json('database/research/us_state_overlays_seed_2026-08-18.json'),
      json('database/research/us_state_overlays_geometry_data_2026-08-18.json')
    ]);
    docs.forEach(doc => (doc.concepts||[]).forEach(c=>db.stateOverlays.set(c.concept_id,{...(db.stateOverlays.get(c.concept_id)||{}),...c})));
  }

  async function loadAll() {
    const taxonomy = await json('database/concept_taxonomy.json');
    db.concepts = flattenTaxonomy(taxonomy); db.concepts.forEach(c=>db.conceptById.set(c.id,c));
    await Promise.all([loadComparisons(),loadProfiles(),loadTasks(),loadDiagnostics(),loadTeaching(),loadPep(),loadSources(),loadStateOverlays()]);
    state.ready = true;
    chooseInitialConcept();
  }

  function conceptName(c) { return state.lang === 'zh' ? c.name_cn : c.name_en; }
  function domainName(c) { return state.lang === 'zh' ? c.domain_cn : c.domain_en; }
  function subdomainName(c) { return state.lang === 'zh' ? c.subdomain_cn : c.subdomain_en; }

  function placementsFor(conceptId, selectedOnly=false) {
    let arr = [...(db.pepPlacements.get(conceptId)||[])];
    if (selectedOnly) arr = arr.filter(p=>p.grade===state.grade && (state.semester==='all'||p.semester===state.semester));
    return arr.sort((a,b)=>a.grade-b.grade || (a.semester==='upper'?-1:1) - (b.semester==='upper'?-1:1) || (a.order??99)-(b.order??99));
  }

  function filteredConcepts() {
    const q = state.query.trim().toLowerCase();
    let concepts = db.concepts;
    if (state.scope==='grade' && !q) {
      const allowed = new Set();
      db.pepPlacements.forEach((placements,id)=>{
        if (placements.some(p=>p.grade===state.grade && (state.semester==='all'||p.semester===state.semester))) allowed.add(id);
      });
      concepts = concepts.filter(c=>allowed.has(c.id));
    }
    if (q) concepts = concepts.filter(c=>[c.name_cn,c.name_en,c.id,c.domain_cn,c.domain_en,c.subdomain_cn,c.subdomain_en].some(v=>String(v||'').toLowerCase().includes(q)));
    return concepts.sort((a,b)=>{
      const ap=placementsFor(a.id,true)[0], bp=placementsFor(b.id,true)[0];
      if(ap&&bp) return (ap.semester===bp.semester?(ap.order??99)-(bp.order??99):(ap.semester==='upper'?-1:1));
      if(ap) return -1;if(bp) return 1;
      return conceptName(a).localeCompare(conceptName(b),state.lang==='zh'?'zh-CN':'en');
    });
  }

  function chooseInitialConcept() {
    const list=filteredConcepts();
    if (!state.conceptId || !db.conceptById.has(state.conceptId) || (state.scope==='grade' && !list.some(c=>c.id===state.conceptId))) state.conceptId=list[0]?.id||db.concepts[0]?.id||null;
  }

  function mergedProfile(conceptId) {
    const base=db.profiles.get(conceptId)||{};
    const links=db.diagnosticLinks.get(conceptId)||{misconceptions:[],questions:[]};
    return {...base,
      misconception_ids:[...new Set([...(base.misconception_ids||[]),...links.misconceptions])],
      diagnostic_question_ids:[...new Set([...(base.diagnostic_question_ids||[]),...links.questions])]
    };
  }

  function currentComparison() {
    return db.comparisons[state.lang].get(state.conceptId)||null;
  }

  function systemCopy(record) {
    if (!record) return null;
    if (state.system==='England') return record.England||null;
    return record.US||null;
  }

  function renderControls() {
    const tx=t();
    $('gradeLabel').textContent=tx.grade;$('semesterLabel').textContent=tx.semester;$('compareLabel').textContent=tx.compare;$('scopeLabel').textContent=tx.scope;$('searchInput').placeholder=tx.search;
    $('semesterAll').textContent=tx.allYear;$('semesterUpper').textContent=tx.upper;$('semesterLower').textContent=tx.lower;
    $('scopeGrade').textContent=tx.currentGrade;$('scopeAll').textContent=tx.allConcepts;
    document.querySelectorAll('[data-grade]').forEach(b=>b.classList.toggle('active',Number(b.dataset.grade)===state.grade));
    document.querySelectorAll('[data-semester]').forEach(b=>b.classList.toggle('active',b.dataset.semester===state.semester));
    document.querySelectorAll('[data-system]').forEach(b=>b.classList.toggle('active',b.dataset.system===state.system));
    document.querySelectorAll('[data-scope]').forEach(b=>b.classList.toggle('active',b.dataset.scope===state.scope));
    $('stateWrap').classList.toggle('hidden',state.system!=='US');$('usLayerLabel').textContent=tx.usLayer;
    const sel=$('usJurisdiction');sel.innerHTML=`<option value="Common Core baseline">${esc(tx.baseline)}</option><option value="California">California</option><option value="Texas">Texas</option>`;sel.value=state.usJurisdiction;
    $('brandSub').textContent=tx.brandSub;$('researchStatus').textContent=tx.research;$('langBtn').textContent=state.lang==='zh'?'EN':'中文';$('mobileFilterBtn').textContent=tx.filters;
    renderTopicList();
  }

  function renderTopicList() {
    const tx=t(), list=filteredConcepts();$('topicCount').textContent=tx.resultCount(list.length);const holder=$('topicList');
    if(!list.length){holder.innerHTML=`<div class="empty">${esc(tx.noResults)}</div>`;return;}
    let html='',lastDomain='';
    for(const c of list){
      if(c.domain_id!==lastDomain){html+=`<div class="topic-group">${esc(domainName(c))}</div>`;lastDomain=c.domain_id;}
      const p=placementsFor(c.id,true)[0];
      html+=`<button class="topic-btn ${c.id===state.conceptId?'active':''}" data-concept="${esc(c.id)}">${esc(conceptName(c))}${p?`<span class="topic-unit">${esc(semesterLabel(p.semester))} · ${esc(p.unit)}</span>`:''}</button>`;
    }
    holder.innerHTML=html;holder.querySelectorAll('[data-concept]').forEach(b=>b.addEventListener('click',()=>{state.conceptId=b.dataset.concept;render();if(innerWidth<981)$('controls').classList.remove('open');}));
  }

  function pepPlacementHtml() {
    const tx=t(), selected=placementsFor(state.conceptId,true), all=placementsFor(state.conceptId,false), source=selected.length?selected:all;
    if(!source.length) return `<div class="empty">${esc(tx.noPep)}</div>`;
    return source.map(p=>{
      const artifact=db.pepArtifacts.get(`${p.grade}|${p.semester}`)||{};
      const rolloutSensitive=['designed_sequence_verified_artifact_not_yet_required'].includes(artifact.artifact_identity_status);
      return `<div class="placement pep"><div class="placement-title">${state.lang==='zh'?`${p.grade}年级${semesterLabel(p.semester)}`:`Grade ${p.grade} ${semesterLabel(p.semester)}`} · ${esc(p.unit)}</div><div class="placement-meta">${esc(tx.verifiedPep)}</div>${rolloutSensitive?`<div class="placement-note">${esc(tx.rollout)}</div>`:''}</div>`;
    }).join('');
  }

  function statePlacementHtml(overlay) {
    const tx=t(), key=state.usJurisdiction, layer=overlay?.[key];
    if(!layer||layer.status!=='verified') return `<div class="empty">${esc(tx.comparisonEmpty)}</div>`;
    return (layer.placement||[]).map(p=>`<div class="placement west"><div class="placement-title">${esc(key)} · Grade ${p.grade}</div><div class="placement-meta">${esc((p.standard_codes||[]).join(' · '))}</div><div class="placement-note">${esc(p.summary||'')}</div></div>`).join('');
  }

  function comparisonHtml(record) {
    const tx=t(), copy=systemCopy(record);
    if(state.system==='US'&&state.usJurisdiction!=='Common Core baseline') return statePlacementHtml(db.stateOverlays.get(state.conceptId));
    if(!copy) return `<div class="empty">${esc(tx.noData)}</div>`;
    const diff=copy[state.lang==='zh'?'difference_cn':'difference_en'];
    return `<p class="body-copy">${esc(diff||tx.noData)}</p>`;
  }

  function whyHtml(record) {
    const tx=t(), copy=systemCopy(record);
    if(state.system==='US'&&state.usJurisdiction!=='Common Core baseline'){
      const overlay=db.stateOverlays.get(state.conceptId), note=overlay?.comparison_note;
      return `<p class="body-copy">${esc(note||tx.whyEmpty)}</p>`;
    }
    const why=copy?.[state.lang==='zh'?'why_cn':'why_en'];return `<p class="body-copy">${esc(why||tx.noData)}</p>`;
  }

  function classroomBridge(record) {
    const copy=systemCopy(record);const text=copy?.[state.lang==='zh'?'classroom_use_cn':'classroom_use_en'];return text||null;
  }

  function renderTask(task) {
    const tx=t();if(!task)return `<div class="empty">${esc(tx.noData)}</div>`;
    const z=db.taskZh.get(task.task_id)||{};const zh=state.lang==='zh';
    const title=zh?task.title_zh:task.title_en,prompt=zh?task.teacher_prompt_zh:task.teacher_prompt_en;
    const purpose=zh?(z.purpose_zh||task.purpose):task.purpose,useWhen=zh?(z.use_when_zh||task.use_when):task.use_when,expected=zh?(z.expected_thinking_zh||task.expected_thinking):task.expected_thinking,listen=zh?(z.listen_for_zh||task.listen_for):task.listen_for,variation=zh?(z.variation_zh||task.variation):task.variation;
    return `<div class="section-kicker">${esc(title)}</div><div class="task-prompt">${esc(prompt)}</div><div class="task-grid"><div class="mini-block"><div class="mini-label">${esc(tx.purpose)}</div><div class="mini-text">${esc(purpose||'')}</div></div><div class="mini-block"><div class="mini-label">${esc(tx.useWhen)}</div><div class="mini-text">${esc(useWhen||'')}</div></div><div class="mini-block"><div class="mini-label">${esc(tx.expected)}</div><div class="mini-text">${esc(expected||'')}</div></div><div class="mini-block"><div class="mini-label">${esc(tx.listenFor)}</div><div class="mini-text">${esc(listen||'')}</div></div></div>${variation?`<h3>${esc(tx.variation)}</h3><p class="body-copy">${esc(variation)}</p>`:''}<div class="notice">${esc(tx.option)}</div>`;
  }

  function renderRepresentations(profile) {
    const tx=t(), ids=profile.representation_ids||[];if(!ids.length)return `<div class="empty">${esc(tx.noData)}</div>`;
    return `<div class="tag-list">${ids.map(id=>{const r=db.representations.get(id);if(!r)return'';const name=state.lang==='zh'?r.name_cn:r.name_en;return `<div class="tag">${esc(name||id)}</div>`;}).join('')}</div>`;
  }

  function renderMoves(profile) {
    const tx=t(), ids=profile.teaching_move_ids||[];if(!ids.length)return `<div class="empty">${esc(tx.noData)}</div>`;
    return `<div class="tag-list">${ids.map(id=>{const m=db.moves.get(id);if(!m)return'';return `<div class="tag">${esc(state.lang==='zh'?m.name_cn:m.name_en)}</div>`;}).join('')}</div>`;
  }

  function renderDiagnostic(profile) {
    const tx=t(), q=(profile.diagnostic_question_ids||[]).map(id=>db.questions.get(id)).find(Boolean);if(!q)return `<div class="empty">${esc(tx.noDiagnostic)}</div>`;
    const target=(q.targets||[])[0], klass=db.evidenceClass.get(target)||'curriculum_inferred_probe_only';const prompt=state.lang==='zh'?q.prompt_cn:q.prompt_en;const follow=(q.follow_ups||[]).slice(0,2);
    return `<div class="diagnostic-box"><div class="evidence-class">${esc(tx[klass]||klass)}</div><div class="diagnostic-prompt">${esc(prompt)}</div>${follow.length?`<div class="mini-label">${esc(tx.followup)}</div><ul class="followups">${follow.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:''}<div class="diagnostic-note">${esc(tx.diagnosticProbe)} · ${esc(state.lang==='zh'?'一次错误不能单独确定误解类型。':'One wrong answer is not sufficient to identify a misconception.')}</div></div>`;
  }

  function sourceRecord(id){return db.sources.get(id)||{id,title_en:id,category:'research'};}
  function renderEvidence(record,task,profile) {
    const tx=t(), ids=[];const add=x=>{if(x&&!ids.includes(x))ids.push(x)};
    (record?.source_ids||[]).forEach(add);(task?.source_ids||[]).forEach(add);
    if(placementsFor(state.conceptId,false).length)add('cn-pep-primary-math-compilation-table-2024');
    (profile.representation_ids||[]).slice(0,2).forEach(id=>(db.representations.get(id)?.source_ids||[]).slice(0,1).forEach(add));
    if(state.system==='US'&&state.usJurisdiction!=='Common Core baseline'){
      const layer=db.stateOverlays.get(state.conceptId)?.[state.usJurisdiction];add(layer?.source_id);
    }
    const show=ids.slice(0,6);if(!show.length)return `<div class="empty">${esc(tx.noData)}</div>`;
    return `<div class="evidence-list">${show.map(id=>{const s=sourceRecord(id);const title=state.lang==='zh'?(s.title_cn||s.title_en||id):(s.title_en||s.title_cn||id);const type=tx.sourceTypes[s.category]||s.category||tx.source;const org=s.organisation||s.author||'';const body=`<div class="evidence-type">${esc(type)}</div><div class="evidence-title">${esc(title)}</div>${org?`<div class="evidence-org">${esc(org)}</div>`:''}<div class="evidence-id">${esc(id)}</div>`;return s.official_url?`<a class="evidence-item" href="${esc(s.official_url)}" target="_blank" rel="noopener">${body}</a>`:`<div class="evidence-item">${body}</div>`;}).join('')}</div>`;
  }

  function renderMain() {
    const tx=t(), c=db.conceptById.get(state.conceptId);if(!c){$('content').innerHTML=`<div class="error-box">${esc(tx.noResults)}</div>`;return;}
    const profile=mergedProfile(c.id), record=currentComparison(), task=db.tasks.get(c.id), bridge=classroomBridge(record);
    const comparisonLabel=state.system==='England'?tx.england:(state.usJurisdiction==='Common Core baseline'?tx.baseline:state.usJurisdiction);
    const selectedPep=placementsFor(c.id,true), allPep=placementsFor(c.id,false);
    const pepChip=selectedPep.length?tx.verifiedPep:(allPep.length?tx.allPlacements:tx.noPep);
    $('content').innerHTML=`
      <section class="page-head">
        <div class="breadcrumb">${esc(domainName(c))} / ${esc(subdomainName(c))}</div>
        <div class="title-row"><div><h1 class="page-title">${esc(conceptName(c))}</h1><div class="page-title-en">${esc(state.lang==='zh'?c.name_en:c.name_cn)}</div></div></div>
        <div class="status-row"><span class="chip cn">${esc(tx.selectedGrade(state.grade))}</span><span class="chip green">${esc(tx.stageLabel(state.grade))}</span><span class="chip ${selectedPep.length?'green':'amber'}">${esc(pepChip)}</span><span class="chip blue">${esc(comparisonLabel)}</span></div>
      </section>
      <div class="grid-2">
        <section class="card"><div class="card-title"><h2>${esc(tx.cnPlacement)}</h2><span class="chip cn">CN</span></div><div class="placement"><div class="placement-title">${esc(tx.stage)} · ${esc(tx.stageLabel(state.grade))}</div><div class="placement-meta">${esc(state.lang==='zh'?'教育部《义务教育数学课程标准（2022年版）》':'MOE Mathematics Curriculum Standard (2022)')}</div></div><h3>${esc(tx.pep)}</h3>${pepPlacementHtml()}<div class="notice">${esc(state.lang==='zh'?'国家课程按学段规定要求；人教版位置是教材编排证据，两者不是同一层数据。':'National curriculum requirements are stage-based; PEP placement is textbook-sequence evidence. They are separate layers.')}</div></section>
        <section class="card"><div class="card-title"><h2>${esc(tx.comparePlacement)}</h2><span class="chip blue">${esc(comparisonLabel)}</span></div>${comparisonHtml(record)}${state.system==='US'&&state.usJurisdiction!=='Common Core baseline'?`<div class="notice">${esc(state.lang==='zh'?'没有州级记录时不会自动用 Common Core 代替州标准。':'Missing state records are not silently replaced by Common Core state requirements.')}</div>`:''}</section>
      </div>
      <section class="card full"><div class="card-title"><h2>${esc(tx.why)}</h2></div>${whyHtml(record)}${bridge?`<div class="callout"><div class="callout-title">${esc(tx.instructionalUse)}</div><p>${esc(bridge)}</p></div>`:''}</section>
      <section class="card full"><div class="card-title"><h2>${esc(tx.classroom)}</h2></div>${renderTask(task)}</section>
      <div class="grid-2"><section class="card"><div class="card-title"><h2>${esc(tx.representations)}</h2></div>${renderRepresentations(profile)}<div class="notice">${esc(tx.option)}</div></section><section class="card"><div class="card-title"><h2>${esc(tx.moves)}</h2></div>${renderMoves(profile)}</section></div>
      <section class="card full"><div class="card-title"><h2>${esc(tx.diagnostic)}</h2></div>${renderDiagnostic(profile)}</section>
      <section class="card full"><div class="card-title"><h2>${esc(tx.evidence)}</h2></div>${renderEvidence(record,task,profile)}</section>`;
  }

  function render() { if(!state.ready)return; chooseInitialConcept();renderControls();renderMain();$('footer1').textContent=t().footer1;$('footer2').textContent=t().footer2;document.documentElement.lang=state.lang==='zh'?'zh-CN':'en'; }

  function bind() {
    document.querySelectorAll('[data-grade]').forEach(b=>b.addEventListener('click',()=>{state.grade=Number(b.dataset.grade);state.conceptId=null;render();}));
    document.querySelectorAll('[data-semester]').forEach(b=>b.addEventListener('click',()=>{state.semester=b.dataset.semester;state.conceptId=null;render();}));
    document.querySelectorAll('[data-system]').forEach(b=>b.addEventListener('click',()=>{state.system=b.dataset.system;render();}));
    document.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{state.scope=b.dataset.scope;state.conceptId=null;render();}));
    $('usJurisdiction').addEventListener('change',e=>{state.usJurisdiction=e.target.value;renderMain();});
    $('searchInput').addEventListener('input',e=>{state.query=e.target.value;state.scope=e.target.value.trim()?'all':state.scope;state.conceptId=null;render();});
    $('langBtn').addEventListener('click',()=>{state.lang=state.lang==='zh'?'en':'zh';render();});
    $('mobileFilterBtn').addEventListener('click',()=>$('controls').classList.toggle('open'));
  }

  async function init() {
    bind();
    try { await loadAll(); $('loading').remove(); render(); }
    catch(err){ console.error(err); $('loading').className='error-box'; $('loading').textContent=t().loadError; }
  }

  init();
})();