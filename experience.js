(() => {
  'use strict';

  const PROFILE_KEY = 'mathbridge.experience.profile.v1';
  const TM_PREF_KEY = 'mathbridge.teacherMode.preferences.v1';
  const state = { step: 0, draft: null, profile: null, rendering: false, journeySignature: '' };

  const copy = {
    zh: {
      brand:'MathBridge · 个性化学习向导',
      welcome:'先告诉我你是谁',
      intro:'MathBridge 会根据你的身份、年级和目标，把中国课程、英国/美国课程和课堂建议组织成一条清晰的路径。',
      who:'你是谁？', whoNote:'选择最接近你的身份。之后可以随时修改。',
      need:'你现在最想解决什么？', needNote:'我们会把最相关的信息放在前面。',
      context:'你的教学情境', contextNote:'选择中国年级，以及你想对照的西方课程。',
      roles:{
        cn_teacher:['中国数学教师','以中国教材进度为主，理解并选择可借鉴的西方教学方法。'],
        international_teacher:['国际学校教师','同时关注课程框架、概念顺序和不同体系的教学重点。'],
        parent:['家长 / 家庭学习','用更清晰的语言理解孩子正在学什么，以及如何在家支持。']
      },
      needs:{
        compare:['比较课程','直接看中国与英国/美国在同一概念上学什么、什么时候学。'],
        understand:['理解教学差异','重点解释为什么西方课堂会使用不同的表征、提问和推理方式。'],
        activity:['找课堂方法','优先给出可以直接使用的活动、教师提问和理解检查。']
      },
      grade:'中国年级', western:'对照课程', england:'英格兰', us:'美国',
      back:'上一步', next:'继续', start:'进入 MathBridge', change:'修改我的设置', curriculum:'浏览完整课程',
      profile:'你的 MathBridge', more:'更多筛选', less:'收起筛选',
      journey:'为你整理的路径',
      journeyTitles:{compare:'课程与教学对照',understand:'理解为什么教学方式不同',activity:'把内容转化成课堂做法'},
      journeyText:{
        compare:'先确认课程位置，再看两个体系在同一概念上的差异，最后决定哪些做法值得借鉴。',
        understand:'先看课程要求，再重点理解表征、推理和课堂设计背后的原因。',
        activity:'先确认当前教材位置，再快速找到课堂任务、教师提示和理解检查。'
      },
      steps:[
        ['1 · 课程位置','中国与西方分别何时学习这个概念'],
        ['2 · 教学差异','同一个概念，两边如何组织学习'],
        ['3 · 课堂应用','把比较结果变成可以直接使用的做法']
      ],
      closeCurriculum:'返回当前主题', curriculumTitle:'课程浏览 · 与当前对照保持在同一个工作区'
    },
    en: {
      brand:'MathBridge · Personal learning guide',
      welcome:'First, tell me who you are',
      intro:'MathBridge will use your role, grade and goal to organise Chinese curriculum, England/US curriculum and practical teaching guidance into one clear workflow.',
      who:'Who are you?', whoNote:'Choose the role that best matches you. You can change this later.',
      need:'What do you need right now?', needNote:'We will put the most useful information first.',
      context:'Your teaching context', contextNote:'Choose the China grade and the Western curriculum you want to explore.',
      roles:{
        cn_teacher:['Chinese math teacher','Keep the Chinese textbook sequence central while understanding useful Western curriculum and pedagogy.'],
        international_teacher:['International-school teacher','Compare curriculum frameworks, concept sequence and teaching emphasis across systems.'],
        parent:['Parent / home educator','Understand what the child is learning and how to support it clearly at home.']
      },
      needs:{
        compare:['Compare curricula','See what China and England/US teach for the same concept and when it appears.'],
        understand:['Understand teaching differences','Focus on why representations, questioning and reasoning may look different.'],
        activity:['Find something to use','Prioritise classroom tasks, teacher prompts and understanding checks.']
      },
      grade:'China grade', western:'Compare with', england:'England', us:'United States',
      back:'Back', next:'Continue', start:'Enter MathBridge', change:'Change my setup', curriculum:'Browse full curriculum',
      profile:'Your MathBridge', more:'More filters', less:'Hide filters',
      journey:'Your pathway',
      journeyTitles:{compare:'Curriculum & teaching comparison',understand:'Understand why teaching differs',activity:'Turn the content into classroom action'},
      journeyText:{
        compare:'Start with curriculum placement, compare how the systems handle the concept, then decide what is worth borrowing.',
        understand:'Start with curriculum expectations, then focus on the representations, reasoning and lesson design behind the difference.',
        activity:'Confirm the current textbook position, then move quickly to a usable task, teacher prompts and an understanding check.'
      },
      steps:[
        ['1 · Curriculum position','Where China and the Western system place this concept'],
        ['2 · Teaching comparison','How the two systems organise learning around it'],
        ['3 · Classroom application','Turn the comparison into something usable']
      ],
      closeCurriculum:'Back to current topic', curriculumTitle:'Curriculum browser · still inside your current MathBridge workspace'
    }
  };

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
  const tx = () => copy[lang()];

  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (!value || !value.role || !value.need || !value.grade || !value.system) return null;
      return value;
    } catch (_) { return null; }
  }

  function saveProfile(profile) {
    state.profile = profile;
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {}
    const goal = profile.need === 'activity' ? 'activity' : profile.need === 'understand' ? 'reasoning' : 'understand';
    try { localStorage.setItem(TM_PREF_KEY, JSON.stringify({ persona: profile.role, goal })); } catch (_) {}
  }

  function click(selector) {
    const el = document.querySelector(selector);
    if (el) el.click();
    return Boolean(el);
  }

  function syncUnderlyingControls() {
    const p = state.profile;
    if (!p) return;
    click(`[data-grade="${p.grade}"]`);
    click(`[data-system="${p.system}"]`);
    const goal = p.need === 'activity' ? 'activity' : p.need === 'understand' ? 'reasoning' : 'understand';
    setTimeout(() => {
      click(`[data-tm-persona="${p.role}"]`);
      click(`[data-tm-goal="${goal}"]`);
    }, 0);
  }

  function roleLabel(role) { return tx().roles[role]?.[0] || role; }
  function needLabel(need) { return tx().needs[need]?.[0] || need; }
  function systemLabel(system) { return system === 'US' ? tx().us : tx().england; }

  function buildExperienceBar() {
    let bar = document.getElementById('experienceBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'experienceBar';
      bar.className = 'experience-bar';
      document.querySelector('.topbar')?.insertAdjacentElement('afterend', bar);
    }
    const p = state.profile;
    if (!p) { bar.innerHTML = ''; return; }
    const c = tx();
    bar.innerHTML = `<div class="experience-bar-inner">
      <div class="experience-profile">
        <div class="experience-avatar">${p.role === 'parent' ? 'P' : 'T'}</div>
        <div class="experience-profile-copy">
          <div class="experience-profile-label">${c.profile}</div>
          <div class="experience-profile-value">${roleLabel(p.role)} · ${lang()==='zh'?`中国 ${p.grade} 年级`:`China Grade ${p.grade}`} · China ↔ ${systemLabel(p.system)} · ${needLabel(p.need)}</div>
        </div>
      </div>
      <div class="experience-bar-actions">
        <button type="button" id="experienceCurriculumBtn">${c.curriculum}</button>
        <button type="button" id="experienceChangeBtn">${c.change}</button>
      </div>
    </div>`;
  }

  function configureSidebar() {
    const controls = document.getElementById('controls');
    if (!controls || controls.dataset.experienceReady === '1') return;
    controls.dataset.experienceReady = '1';
    const head = document.createElement('div');
    head.className = 'experience-sidebar-head';
    head.id = 'experienceSidebarHead';
    controls.prepend(head);
    document.getElementById('semesterLabel')?.closest('.control-section')?.classList.add('experience-optional-filter');
    document.getElementById('scopeLabel')?.closest('.control-section')?.classList.add('experience-optional-filter');
    const searchSection = document.getElementById('searchInput')?.closest('.control-section');
    if (searchSection) {
      const button = document.createElement('button');
      button.id = 'experienceMoreBtn';
      button.className = 'experience-more-btn';
      button.type = 'button';
      searchSection.insertAdjacentElement('beforebegin', button);
    }
    updateSidebarLabels();
  }

  function updateSidebarLabels() {
    const c = tx();
    const head = document.getElementById('experienceSidebarHead'); if (head) head.textContent = c.context;
    const more = document.getElementById('experienceMoreBtn'); if (more) more.textContent = document.body.classList.contains('experience-show-filters') ? c.less : c.more;
    const grade = document.getElementById('gradeLabel'); if (grade) grade.textContent = c.grade;
    const compare = document.getElementById('compareLabel'); if (compare) compare.textContent = c.western;
  }

  function journeyMarkup() {
    const p = state.profile; if (!p) return '';
    const c = tx();
    return `<section class="experience-journey" id="experienceJourney">
      <div class="experience-journey-kicker">${c.journey}</div>
      <h2>${c.journeyTitles[p.need]}</h2>
      <p>${c.journeyText[p.need]}</p>
      <div class="experience-path-actions">
        ${c.steps.map((step, i) => `<button class="experience-path" type="button" data-experience-path="${i+1}"><span>${step[0]}</span><strong>${i===0?c.curriculum:(i===1?(lang()==='zh'?'查看概念对照':'View concept comparison'):(lang()==='zh'?'课堂使用建议':'Classroom guidance'))}</strong><small>${step[1]}</small></button>`).join('')}
      </div>
    </section>`;
  }

  function renderJourney() {
    if (state.rendering || !state.profile) return;
    const content = document.getElementById('content');
    const pageHead = content?.querySelector('.page-head');
    if (!content || !pageHead) return;
    const concept = document.querySelector('.topic-btn.active[data-concept]')?.dataset.concept || '';
    const signature = [concept,state.profile.role,state.profile.need,state.profile.grade,state.profile.system,lang()].join('|');
    const existing = document.getElementById('experienceJourney');
    if (existing && signature === state.journeySignature) return;
    state.rendering = true;
    existing?.remove();
    pageHead.insertAdjacentHTML('afterend', journeyMarkup());
    state.journeySignature = signature;
    state.rendering = false;
  }

  function curriculumTopbar() {
    const app = document.getElementById('curriculumApp');
    if (!app || app.querySelector('.experience-curriculum-top')) return;
    const bar = document.createElement('div');
    bar.className = 'experience-curriculum-top';
    bar.innerHTML = `<div class="experience-curriculum-title"></div><button type="button" id="experienceCurriculumClose"></button>`;
    app.prepend(bar);
    updateCurriculumTopbar();
  }

  function updateCurriculumTopbar() {
    const c = tx();
    const title = document.querySelector('.experience-curriculum-title'); if (title) title.textContent = c.curriculumTitle;
    const close = document.getElementById('experienceCurriculumClose'); if (close) close.textContent = c.closeCurriculum;
  }

  function openCurriculum() {
    curriculumTopbar();
    document.body.classList.add('experience-curriculum-open');
    const p = state.profile;
    if (p) {
      setTimeout(() => {
        document.querySelector(`[data-curriculum-level="${p.grade}"]`)?.click();
        document.querySelector(`[data-curriculum-system="${p.system}"]`)?.click();
      }, 0);
    }
  }
  function closeCurriculum() { document.body.classList.remove('experience-curriculum-open'); }

  function renderOnboarding() {
    let modal = document.getElementById('experienceOnboarding');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'experienceOnboarding';
      modal.className = 'experience-onboarding';
      document.body.appendChild(modal);
    }
    const c = tx();
    const d = state.draft || state.profile || { role:'', need:'', grade:3, system:'England' };
    state.draft = { ...d };
    const dots = [0,1,2].map(i=>`<div class="experience-step-dot ${i<=state.step?'active':''}"></div>`).join('');
    let body = '';
    if (state.step === 0) {
      body = `<h2 class="experience-question">${c.who}</h2><div class="experience-question-note">${c.whoNote}</div><div class="experience-choice-grid">${Object.entries(c.roles).map(([key,val])=>`<button type="button" class="experience-choice ${d.role===key?'active':''}" data-exp-role="${key}"><strong>${val[0]}</strong><span>${val[1]}</span></button>`).join('')}</div>`;
    } else if (state.step === 1) {
      body = `<h2 class="experience-question">${c.need}</h2><div class="experience-question-note">${c.needNote}</div><div class="experience-choice-grid">${Object.entries(c.needs).map(([key,val])=>`<button type="button" class="experience-choice ${d.need===key?'active':''}" data-exp-need="${key}"><strong>${val[0]}</strong><span>${val[1]}</span></button>`).join('')}</div>`;
    } else {
      body = `<h2 class="experience-question">${c.context}</h2><div class="experience-question-note">${c.contextNote}</div><div class="experience-context-grid"><div class="experience-context-block"><label>${c.grade}</label><div class="experience-grade-choices">${[1,2,3,4,5,6].map(g=>`<button type="button" data-exp-grade="${g}" class="${Number(d.grade)===g?'active':''}">${g}</button>`).join('')}</div></div><div class="experience-context-block"><label>${c.western}</label><div class="experience-system-choices"><button type="button" data-exp-system="England" class="${d.system==='England'?'active':''}">${c.england}</button><button type="button" data-exp-system="US" class="${d.system==='US'?'active':''}">${c.us}</button></div></div></div>`;
    }
    const canNext = state.step === 0 ? Boolean(d.role) : state.step === 1 ? Boolean(d.need) : Boolean(d.grade && d.system);
    modal.innerHTML = `<div class="experience-onboarding-card"><div class="experience-onboarding-head"><button type="button" class="experience-language" id="experienceLanguage">${lang()==='en'?'中文':'EN'}</button><div class="experience-onboarding-brand">${c.brand}</div><h1>${c.welcome}</h1><p>${c.intro}</p></div><div class="experience-onboarding-body"><div class="experience-step-indicator">${dots}</div>${body}<div class="experience-onboarding-actions"><button type="button" id="experienceBack" ${state.step===0?'disabled':''}>${c.back}</button><button type="button" class="primary" id="experienceNext" ${canNext?'':'disabled'}>${state.step===2?c.start:c.next}</button></div></div></div>`;
  }

  function openOnboarding(reset=false) {
    state.step = 0;
    state.draft = reset && state.profile ? { ...state.profile } : (state.profile ? { ...state.profile } : { role:'', need:'', grade:3, system:'England' });
    renderOnboarding();
  }

  function closeOnboarding() { document.getElementById('experienceOnboarding')?.remove(); }

  function applyProfile() {
    saveProfile({ ...state.draft, grade:Number(state.draft.grade) });
    closeOnboarding();
    state.journeySignature = '';
    syncUnderlyingControls();
    buildExperienceBar();
    updateSidebarLabels();
    renderJourney();
  }

  document.addEventListener('click', event => {
    const role = event.target.closest('[data-exp-role]'); if (role) { state.draft.role = role.dataset.expRole; renderOnboarding(); return; }
    const need = event.target.closest('[data-exp-need]'); if (need) { state.draft.need = need.dataset.expNeed; renderOnboarding(); return; }
    const grade = event.target.closest('[data-exp-grade]'); if (grade) { state.draft.grade = Number(grade.dataset.expGrade); renderOnboarding(); return; }
    const system = event.target.closest('[data-exp-system]'); if (system) { state.draft.system = system.dataset.expSystem; renderOnboarding(); return; }
    if (event.target.closest('#experienceBack')) { if (state.step>0) state.step--; renderOnboarding(); return; }
    if (event.target.closest('#experienceNext')) {
      if (state.step < 2) { state.step++; renderOnboarding(); } else applyProfile();
      return;
    }
    if (event.target.closest('#experienceLanguage')) { document.getElementById('langBtn')?.click(); setTimeout(renderOnboarding,0); return; }
    if (event.target.closest('#experienceChangeBtn')) { openOnboarding(true); return; }
    if (event.target.closest('#experienceCurriculumBtn')) { openCurriculum(); return; }
    if (event.target.closest('#experienceCurriculumClose')) { closeCurriculum(); return; }
    if (event.target.closest('#experienceMoreBtn')) { document.body.classList.toggle('experience-show-filters'); updateSidebarLabels(); return; }
    const path = event.target.closest('[data-experience-path]');
    if (path) {
      const step = Number(path.dataset.experiencePath);
      if (step === 1) openCurriculum();
      if (step === 2) document.querySelector('#teacherModeCard .tm-block:nth-child(2)')?.scrollIntoView({behavior:'smooth',block:'center'});
      if (step === 3) document.querySelector('#teacherModeCard .tm-block:nth-child(4)')?.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    if (event.target.closest('[data-compare-concept],[data-cn-compare-concept]')) closeCurriculum();

    const gradeControl = event.target.closest('[data-grade]');
    if (gradeControl && state.profile && !document.getElementById('experienceOnboarding')) {
      saveProfile({ ...state.profile, grade:Number(gradeControl.dataset.grade) });
      state.journeySignature = '';
      setTimeout(() => { buildExperienceBar(); renderJourney(); }, 0);
    }
    const systemControl = event.target.closest('[data-system]');
    if (systemControl && state.profile && !document.getElementById('experienceOnboarding')) {
      saveProfile({ ...state.profile, system:systemControl.dataset.system });
      state.journeySignature = '';
      setTimeout(() => { buildExperienceBar(); renderJourney(); }, 0);
    }
    if (event.target.closest('#langBtn')) setTimeout(() => { state.journeySignature=''; buildExperienceBar(); updateSidebarLabels(); updateCurriculumTopbar(); renderJourney(); }, 0);
  });

  function init() {
    document.body.classList.add('experience-unified');
    state.profile = readProfile();
    configureSidebar();
    buildExperienceBar();
    curriculumTopbar();
    if (state.profile) syncUnderlyingControls(); else openOnboarding();
    const content = document.getElementById('content');
    if (content) new MutationObserver(() => requestAnimationFrame(renderJourney)).observe(content,{childList:true,subtree:true});
    setTimeout(renderJourney, 0);
  }

  init();
})();
