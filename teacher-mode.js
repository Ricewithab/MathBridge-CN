(() => {
  'use strict';

  const PREF_KEY = 'mathbridge.teacherMode.preferences.v1';
  const SAVED_KEY = 'mathbridge.teacherMode.saved.v1';
  const params = new URLSearchParams(location.search);
  const allowedPersonas = new Set(['cn_teacher', 'international_teacher', 'parent']);
  const allowedGoals = new Set(['understand', 'reasoning', 'activity']);

  const readJSON = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const pref = readJSON(PREF_KEY, {});
  const state = {
    persona: allowedPersonas.has(params.get('persona')) ? params.get('persona') : (allowedPersonas.has(pref.persona) ? pref.persona : 'cn_teacher'),
    goal: allowedGoals.has(params.get('goal')) ? params.get('goal') : (allowedGoals.has(pref.goal) ? pref.goal : 'reasoning'),
    flash: '',
    urlApplied: false,
    renderQueued: false,
    lastSignature: ''
  };

  const copy = {
    zh: {
      title: '教师模式 · 明天就能用',
      subtitle: '保留中国课程目标，再从英格兰或美国课程中挑一个有价值的教学做法。',
      persona: '你的身份',
      goal: '这次你最需要什么',
      personas: {
        cn_teacher: '中国数学教师',
        international_teacher: '国际学校教师',
        parent: '家长 / 家庭学习'
      },
      goals: {
        understand: '理解西方做法',
        reasoning: '提升学生推理',
        activity: '找一个课堂活动'
      },
      currentContext: '当前教学情境',
      keepObjective: '先保留中国课程目标',
      westernLens: '再加入一个西方视角',
      whyItHelps: '为什么值得这样做',
      tryTomorrow: '明天可以直接试',
      teacherMoves: '教师可以怎么问 / 怎么做',
      checkUnderstanding: '最后检查学生是否真的理解',
      save: '保存这个对照',
      share: '复制分享链接',
      saved: '已保存',
      copied: '链接已复制',
      savedTitle: '已保存的对照',
      remove: '删除',
      noData: '当前概念没有可显示的数据。',
      parentNote: '在家使用时，优先让孩子操作、画图和解释，不需要复制学校课堂的完整流程。',
      internationalNote: '把两个课程框架当作不同的教学镜头，不按相同年级编号机械对应。',
      cnTeacherNote: '不要替换中国教材进度。先完成当前教材目标，再加入一个能促进解释、表征或推理的环节。',
      goalUnderstand: '重点看“西方课程怎么处理”和“为什么”。不需要把整套方法搬进课堂。',
      goalReasoning: '重点增加学生解释、比较、表征和追问，而不是单纯增加题量。',
      goalActivity: '先把下面的课堂任务拿来用，再根据班级水平缩短、拆分或增加支架。',
      evidenceNote: '教师模式只是重新组织已验证的 MathBridge 数据；课程要求、教材位置和课堂建议仍保持不同证据层。',
      systemEngland: '英格兰',
      systemUS: '美国',
      grade: g => `中国 ${g} 年级`,
      semester: s => s === 'upper' ? '上册' : s === 'lower' ? '下册' : '全年'
    },
    en: {
      title: 'Teacher Mode · Use it tomorrow',
      subtitle: 'Keep the Chinese curriculum objective, then borrow one useful teaching move from England or the US.',
      persona: 'Who are you?',
      goal: 'What do you need most?',
      personas: {
        cn_teacher: 'Chinese math teacher',
        international_teacher: 'International-school teacher',
        parent: 'Parent / home educator'
      },
      goals: {
        understand: 'Understand the Western approach',
        reasoning: 'Improve student reasoning',
        activity: 'Find a classroom activity'
      },
      currentContext: 'Current teaching context',
      keepObjective: 'Keep the Chinese objective',
      westernLens: 'Add one Western lens',
      whyItHelps: 'Why this is useful',
      tryTomorrow: 'Try this tomorrow',
      teacherMoves: 'Teacher moves and prompts',
      checkUnderstanding: 'Check whether students really understand',
      save: 'Save comparison',
      share: 'Copy share link',
      saved: 'Saved',
      copied: 'Link copied',
      savedTitle: 'Saved comparisons',
      remove: 'Remove',
      noData: 'No usable data is available for this concept.',
      parentNote: 'At home, prioritise objects, drawings and explanation. You do not need to reproduce a full school lesson.',
      internationalNote: 'Treat the frameworks as different teaching lenses; do not align them mechanically by grade number.',
      cnTeacherNote: 'Do not replace the Chinese textbook sequence. Meet the current objective first, then add one reasoning, representation or explanation move.',
      goalUnderstand: 'Focus on what the comparison system does differently and why. You do not need to import the whole approach.',
      goalReasoning: 'Increase explanation, comparison, representation and follow-up questions rather than simply increasing practice volume.',
      goalActivity: 'Use the classroom task first, then shorten, split or scaffold it for your class.',
      evidenceNote: 'Teacher Mode reorganises existing verified MathBridge data. Curriculum requirements, textbook placement and classroom suggestions remain separate evidence layers.',
      systemEngland: 'England',
      systemUS: 'United States',
      grade: g => `China Grade ${g}`,
      semester: s => s === 'upper' ? 'Upper' : s === 'lower' ? 'Lower' : 'Full year'
    }
  };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]));

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'zh';
  const tx = () => copy[lang()];
  const text = (root, selector) => root?.querySelector(selector)?.textContent?.trim() || '';
  const texts = (root, selector) => Array.from(root?.querySelectorAll(selector) || []).map(el => el.textContent.trim()).filter(Boolean);

  function persistPreferences() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ persona: state.persona, goal: state.goal }));
    } catch (_) {}
  }

  function savedItems() {
    const items = readJSON(SAVED_KEY, []);
    return Array.isArray(items) ? items : [];
  }

  function writeSaved(items) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(items.slice(0, 8)));
    } catch (_) {}
  }

  function getSnapshot() {
    const content = document.getElementById('content');
    const pageHead = content?.querySelector('.page-head');
    const conceptButton = document.querySelector('.topic-btn.active[data-concept]');
    if (!content || !pageHead || !conceptButton) return null;

    const direct = Array.from(content.children);
    const grids = direct.filter(el => el.matches('.grid-2'));
    const fullCards = direct.filter(el => el.matches('.card.full') && !['pepProgressionCard', 'teacherModeCard'].includes(el.id));
    const placementCards = Array.from(grids[0]?.children || []);
    const teachingCards = Array.from(grids[1]?.children || []);
    const comparisonCard = placementCards[1];
    const whyCard = fullCards[0];
    const classroomCard = fullCards[1];
    const diagnosticCard = fullCards[2];

    const grade = Number(document.querySelector('[data-grade].active')?.dataset.grade || 0);
    const semester = document.querySelector('[data-semester].active')?.dataset.semester || 'all';
    const system = document.querySelector('[data-system].active')?.dataset.system || 'England';
    const jurisdiction = document.getElementById('usJurisdiction')?.value || 'Common Core baseline';

    const comparison = [
      ...texts(comparisonCard, '.body-copy'),
      ...texts(comparisonCard, '.placement-note')
    ].filter(Boolean).join(' ');

    const why = texts(whyCard, '.body-copy').join(' ');
    const classroomBridge = text(whyCard, '.callout p');
    const pepPlacement = text(placementCards[0], '.placement.pep .placement-title') || text(placementCards[0], '.placement-title');
    const taskTitle = text(classroomCard, '.section-kicker');
    const taskPrompt = text(classroomCard, '.task-prompt');
    const mini = Array.from(classroomCard?.querySelectorAll('.mini-block') || []).map(block => ({
      label: text(block, '.mini-label'),
      value: text(block, '.mini-text')
    })).filter(item => item.value);
    const representations = texts(teachingCards[0], '.tag');
    const moves = texts(teachingCards[1], '.tag');
    const diagnostic = text(diagnosticCard, '.diagnostic-prompt');
    const followups = texts(diagnosticCard, '.followups li');

    return {
      conceptId: conceptButton.dataset.concept,
      concept: text(pageHead, '.page-title'),
      conceptAlt: text(pageHead, '.page-title-en'),
      grade,
      semester,
      system,
      jurisdiction,
      pepPlacement,
      comparison,
      why,
      classroomBridge,
      taskTitle,
      taskPrompt,
      mini,
      representations,
      moves,
      diagnostic,
      followups
    };
  }

  function personaGuidance(c) {
    if (state.persona === 'parent') return c.parentNote;
    if (state.persona === 'international_teacher') return c.internationalNote;
    return c.cnTeacherNote;
  }

  function goalGuidance(c) {
    if (state.goal === 'understand') return c.goalUnderstand;
    if (state.goal === 'activity') return c.goalActivity;
    return c.goalReasoning;
  }

  function systemLabel(snapshot, c) {
    if (snapshot.system === 'England') return c.systemEngland;
    return snapshot.jurisdiction === 'Common Core baseline' ? `${c.systemUS} · Common Core` : `${c.systemUS} · ${snapshot.jurisdiction}`;
  }

  function chipList(items) {
    if (!items.length) return `<div class="tm-empty">${esc(tx().noData)}</div>`;
    return `<div class="tm-chip-list">${items.map(item => `<span class="tm-chip">${esc(item)}</span>`).join('')}</div>`;
  }

  function miniRows(items) {
    if (!items.length) return '';
    return `<div class="tm-mini-rows">${items.slice(0, 3).map(item => `<div><span>${esc(item.label)}</span><p>${esc(item.value)}</p></div>`).join('')}</div>`;
  }

  function renderSaved(c) {
    const items = savedItems();
    if (!items.length) return '';
    return `<div class="tm-saved-wrap"><div class="tm-control-label">${esc(c.savedTitle)}</div><div class="tm-saved-list">${items.slice(0, 5).map(item => `<div class="tm-saved-item"><button type="button" data-tm-saved="${esc(item.id)}">${esc(item.label)}</button><button type="button" class="tm-remove" data-tm-remove="${esc(item.id)}" aria-label="${esc(c.remove)}">×</button></div>`).join('')}</div></div>`;
  }

  function renderTeacherMode(force = false) {
    state.renderQueued = false;
    applyUrlState();

    const snapshot = getSnapshot();
    if (!snapshot) return;
    const c = tx();
    const signature = [snapshot.conceptId, snapshot.grade, snapshot.semester, snapshot.system, snapshot.jurisdiction, lang(), state.persona, state.goal, savedItems().length, state.flash].join('|');
    const existing = document.getElementById('teacherModeCard');
    if (!force && existing && signature === state.lastSignature) return;
    state.lastSignature = signature;
    existing?.remove();

    const taskText = snapshot.taskPrompt || snapshot.classroomBridge || c.noData;
    const comparisonText = snapshot.comparison || c.noData;
    const whyText = snapshot.why || snapshot.classroomBridge || c.noData;
    const diagnosticText = snapshot.diagnostic || c.noData;
    const contextText = `${c.grade(snapshot.grade)} · ${c.semester(snapshot.semester)} · ${systemLabel(snapshot, c)}`;
    const personaButtons = Object.entries(c.personas).map(([key, label]) => `<button type="button" data-tm-persona="${key}" class="tm-choice ${state.persona === key ? 'active' : ''}">${esc(label)}</button>`).join('');
    const goalButtons = Object.entries(c.goals).map(([key, label]) => `<button type="button" data-tm-goal="${key}" class="tm-choice ${state.goal === key ? 'active' : ''}">${esc(label)}</button>`).join('');

    const card = document.createElement('section');
    card.id = 'teacherModeCard';
    card.className = 'card full tm-card';
    card.innerHTML = `
      <div class="tm-head">
        <div>
          <div class="tm-kicker">MathBridge v0.2</div>
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.subtitle)}</p>
        </div>
        <div class="tm-actions">
          <button id="tmSave" type="button">${esc(c.save)}</button>
          <button id="tmShare" type="button">${esc(c.share)}</button>
        </div>
      </div>
      ${state.flash ? `<div class="tm-flash">${esc(state.flash)}</div>` : ''}
      <div class="tm-controls-grid">
        <div>
          <div class="tm-control-label">${esc(c.persona)}</div>
          <div class="tm-choice-row">${personaButtons}</div>
        </div>
        <div>
          <div class="tm-control-label">${esc(c.goal)}</div>
          <div class="tm-choice-row">${goalButtons}</div>
        </div>
      </div>
      <div class="tm-context"><span>${esc(c.currentContext)}</span><strong>${esc(snapshot.concept)} · ${esc(contextText)}</strong></div>
      <div class="tm-focus">${esc(personaGuidance(c))} ${esc(goalGuidance(c))}</div>
      <div class="tm-output-grid">
        <article class="tm-block tm-keep">
          <div class="tm-block-label">1</div>
          <div><h3>${esc(c.keepObjective)}</h3><p>${esc(snapshot.pepPlacement || c.noData)}</p></div>
        </article>
        <article class="tm-block tm-lens ${state.goal === 'understand' ? 'emphasis' : ''}">
          <div class="tm-block-label">2</div>
          <div><h3>${esc(c.westernLens)}</h3><p>${esc(comparisonText)}</p></div>
        </article>
        <article class="tm-block tm-why ${state.goal === 'reasoning' ? 'emphasis' : ''}">
          <div class="tm-block-label">3</div>
          <div><h3>${esc(c.whyItHelps)}</h3><p>${esc(whyText)}</p>${snapshot.classroomBridge ? `<div class="tm-bridge">${esc(snapshot.classroomBridge)}</div>` : ''}</div>
        </article>
        <article class="tm-block tm-activity ${state.goal === 'activity' ? 'emphasis' : ''}">
          <div class="tm-block-label">4</div>
          <div><h3>${esc(c.tryTomorrow)}</h3>${snapshot.taskTitle ? `<div class="tm-task-title">${esc(snapshot.taskTitle)}</div>` : ''}<p class="tm-task">${esc(taskText)}</p>${miniRows(snapshot.mini)}</div>
        </article>
        <article class="tm-block tm-moves">
          <div class="tm-block-label">5</div>
          <div><h3>${esc(c.teacherMoves)}</h3>${chipList([...snapshot.representations.slice(0, 3), ...snapshot.moves.slice(0, 4)])}</div>
        </article>
        <article class="tm-block tm-check">
          <div class="tm-block-label">6</div>
          <div><h3>${esc(c.checkUnderstanding)}</h3><p>${esc(diagnosticText)}</p>${snapshot.followups.length ? `<ul>${snapshot.followups.slice(0, 2).map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}</div>
        </article>
      </div>
      <div class="tm-evidence-note">${esc(c.evidenceNote)}</div>
      ${renderSaved(c)}
    `;

    const progression = document.getElementById('pepProgressionCard');
    const pageHead = document.querySelector('#content .page-head');
    (progression || pageHead)?.insertAdjacentElement('afterend', card);
  }

  function queueRender(force = false) {
    if (state.renderQueued && !force) return;
    state.renderQueued = true;
    requestAnimationFrame(() => renderTeacherMode(force));
  }

  function currentView() {
    const snapshot = getSnapshot();
    if (!snapshot) return null;
    return {
      lang: lang(),
      grade: snapshot.grade,
      semester: snapshot.semester,
      system: snapshot.system,
      jurisdiction: snapshot.jurisdiction,
      conceptId: snapshot.conceptId,
      persona: state.persona,
      goal: state.goal
    };
  }

  function createShareUrl(view) {
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('lang', view.lang);
    url.searchParams.set('grade', String(view.grade));
    url.searchParams.set('semester', view.semester);
    url.searchParams.set('system', view.system);
    if (view.system === 'US') url.searchParams.set('jurisdiction', view.jurisdiction);
    url.searchParams.set('concept', view.conceptId);
    url.searchParams.set('persona', view.persona);
    url.searchParams.set('goal', view.goal);
    return url.toString();
  }

  async function copyShareLink() {
    const view = currentView();
    if (!view) return;
    const value = createShareUrl(view);
    try {
      await navigator.clipboard.writeText(value);
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    state.flash = tx().copied;
    queueRender(true);
  }

  function saveCurrent() {
    const snapshot = getSnapshot();
    const view = currentView();
    if (!snapshot || !view) return;
    const c = tx();
    const label = `${snapshot.concept} · ${c.grade(snapshot.grade)} · ${systemLabel(snapshot, c)}`;
    const id = `${snapshot.conceptId}|${snapshot.grade}|${snapshot.semester}|${snapshot.system}|${snapshot.jurisdiction}`;
    const items = savedItems().filter(item => item.id !== id);
    items.unshift({ id, label, view, savedAt: new Date().toISOString() });
    writeSaved(items);
    state.flash = c.saved;
    queueRender(true);
  }

  function clickSelector(selector) {
    const el = document.querySelector(selector);
    if (el) el.click();
    return Boolean(el);
  }

  function applyView(view) {
    if (!view) return;
    state.persona = allowedPersonas.has(view.persona) ? view.persona : state.persona;
    state.goal = allowedGoals.has(view.goal) ? view.goal : state.goal;
    persistPreferences();

    const currentLang = lang();
    if (view.lang && view.lang !== currentLang) document.getElementById('langBtn')?.click();
    if (view.grade) clickSelector(`[data-grade="${view.grade}"]`);
    if (view.semester) clickSelector(`[data-semester="${view.semester}"]`);
    if (view.system) clickSelector(`[data-system="${view.system}"]`);
    if (view.system === 'US' && view.jurisdiction) {
      const select = document.getElementById('usJurisdiction');
      if (select && Array.from(select.options).some(option => option.value === view.jurisdiction)) {
        select.value = view.jurisdiction;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    if (view.conceptId) {
      document.getElementById('scopeAll')?.click();
      const target = Array.from(document.querySelectorAll('.topic-btn[data-concept]')).find(button => button.dataset.concept === view.conceptId);
      target?.click();
    }
    state.flash = '';
    queueRender(true);
  }

  function applyUrlState() {
    if (state.urlApplied || !document.querySelector('.topic-btn[data-concept]')) return;
    state.urlApplied = true;
    const conceptId = params.get('concept');
    if (!conceptId) return;
    applyView({
      lang: params.get('lang') || lang(),
      grade: Number(params.get('grade') || 0) || undefined,
      semester: params.get('semester') || undefined,
      system: params.get('system') || undefined,
      jurisdiction: params.get('jurisdiction') || undefined,
      conceptId,
      persona: state.persona,
      goal: state.goal
    });
  }

  document.addEventListener('click', event => {
    const persona = event.target.closest('[data-tm-persona]');
    if (persona) {
      state.persona = persona.dataset.tmPersona;
      state.flash = '';
      persistPreferences();
      queueRender(true);
      return;
    }

    const goal = event.target.closest('[data-tm-goal]');
    if (goal) {
      state.goal = goal.dataset.tmGoal;
      state.flash = '';
      persistPreferences();
      queueRender(true);
      return;
    }

    if (event.target.closest('#tmSave')) {
      saveCurrent();
      return;
    }
    if (event.target.closest('#tmShare')) {
      copyShareLink();
      return;
    }

    const saved = event.target.closest('[data-tm-saved]');
    if (saved) {
      const item = savedItems().find(entry => entry.id === saved.dataset.tmSaved);
      applyView(item?.view);
      return;
    }

    const remove = event.target.closest('[data-tm-remove]');
    if (remove) {
      writeSaved(savedItems().filter(item => item.id !== remove.dataset.tmRemove));
      state.flash = '';
      queueRender(true);
      return;
    }

    if (event.target.closest('[data-grade], [data-semester], [data-system], [data-scope], [data-concept], #langBtn')) {
      state.flash = '';
      queueRender(true);
    }
  });

  document.getElementById('usJurisdiction')?.addEventListener('change', () => {
    state.flash = '';
    queueRender(true);
  });
  document.getElementById('searchInput')?.addEventListener('input', () => queueRender(true));

  const content = document.getElementById('content');
  if (content) {
    const observer = new MutationObserver(() => queueRender());
    observer.observe(content, { childList: true, subtree: true });
  }

  queueRender(true);
})();