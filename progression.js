(() => {
  'use strict';

  const placements = new Map();
  let ready = false;
  let lastSignature = '';
  let renderQueued = false;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[ch]));

  async function getJSON(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    return response.json();
  }

  function semesterLabel(semester, zh) {
    return zh ? (semester === 'upper' ? '上册' : '下册') : (semester === 'upper' ? 'Upper' : 'Lower');
  }

  async function loadProgression() {
    const [sequence, map, corrections] = await Promise.all([
      getJSON('database/research/cn_pep_current_sequence_verified_2026.json'),
      getJSON('database/research/cn_pep_unit_concept_map_2026.json'),
      getJSON('database/research/cn_pep_unit_concept_corrections_2026.json')
    ]);

    const order = new Map();
    const removed = new Map();

    for (const volume of sequence.volumes || []) {
      for (const unit of volume.units || []) {
        order.set(`${volume.grade}|${volume.semester}|${unit.title_cn}`, unit.order);
      }
    }

    for (const correction of corrections.corrections || []) {
      removed.set(
        `${correction.grade}|${correction.semester}|${correction.unit_title_cn}`,
        new Set(correction.remove_concept_ids || [])
      );
    }

    for (const volume of map.volumes || []) {
      for (const unit of volume.units || []) {
        const blocked = removed.get(`${volume.grade}|${volume.semester}|${unit.title_cn}`) || new Set();
        for (const conceptId of (unit.concept_ids || []).filter(id => !blocked.has(id))) {
          const list = placements.get(conceptId) || [];
          list.push({
            grade: volume.grade,
            semester: volume.semester,
            unit: unit.title_cn,
            order: order.get(`${volume.grade}|${volume.semester}|${unit.title_cn}`) ?? 99
          });
          placements.set(conceptId, list);
        }
      }
    }

    placements.forEach(list => list.sort((a, b) =>
      a.grade - b.grade ||
      (a.semester === b.semester ? 0 : a.semester === 'upper' ? -1 : 1) ||
      a.order - b.order
    ));

    ready = true;
    queueRender(true);
  }

  function selectedConceptId() {
    return document.querySelector('.topic-btn.active[data-concept]')?.dataset.concept || null;
  }

  function selectedGrade() {
    const raw = document.querySelector('[data-grade].active')?.dataset.grade;
    return raw ? Number(raw) : null;
  }

  function renderProgression(force = false) {
    renderQueued = false;
    if (!ready) return;

    const pageHead = document.querySelector('#content .page-head');
    const conceptId = selectedConceptId();
    if (!pageHead || !conceptId) return;

    const zh = document.documentElement.lang !== 'en';
    const grade = selectedGrade();
    const signature = `${conceptId}|${grade}|${zh ? 'zh' : 'en'}`;
    const existing = document.getElementById('pepProgressionCard');
    if (!force && signature === lastSignature && existing) return;
    lastSignature = signature;

    existing?.remove();

    const conceptPlacements = placements.get(conceptId) || [];
    const byGrade = new Map();
    for (let g = 1; g <= 6; g += 1) byGrade.set(g, []);
    conceptPlacements.forEach(item => byGrade.get(item.grade)?.push(item));

    const first = conceptPlacements[0];
    const firstText = first
      ? (zh
        ? `人教版修订教材中最早登记位置：${first.grade}年级${semesterLabel(first.semester, true)} · ${first.unit}`
        : `Earliest registered revised-PEP placement: Grade ${first.grade} ${semesterLabel(first.semester, false)} · ${first.unit}`)
      : (zh
        ? '该概念目前没有登记的人教版修订教材单元位置。'
        : 'No revised-PEP unit placement is currently registered for this concept.');

    const cells = Array.from({ length: 6 }, (_, index) => {
      const g = index + 1;
      const items = byGrade.get(g) || [];
      const body = items.length
        ? items.map(item => `<div class="progression-unit"><span>${esc(semesterLabel(item.semester, zh))}</span>${esc(item.unit)}</div>`).join('')
        : `<div class="progression-empty">—</div>`;
      return `<div class="progression-grade ${g === grade ? 'current' : ''}">
        <div class="progression-grade-label">${zh ? `${g}年级` : `Grade ${g}`}</div>
        ${body}
      </div>`;
    }).join('');

    const card = document.createElement('section');
    card.className = 'card full progression-card';
    card.id = 'pepProgressionCard';
    card.innerHTML = `
      <div class="card-title">
        <h2>${zh ? '人教版学习进阶' : 'Revised PEP progression'}</h2>
        <span class="chip purple">${zh ? '1–6年级' : 'Grades 1–6'}</span>
      </div>
      <p class="body-copy progression-summary">${esc(firstText)}</p>
      <div class="progression-grid">${cells}</div>
      <div class="notice">${zh
        ? '此进阶图显示已核实的人教版修订教材编排位置，不表示同年级的中英美课程自动等值，也不表示所有中国学校均使用人教版。'
        : 'This timeline shows verified revised-PEP sequence placements. It does not imply same-numbered grade equivalence across systems or that every school in China uses PEP.'}</div>`;

    pageHead.insertAdjacentElement('afterend', card);
  }

  function queueRender(force = false) {
    if (renderQueued && !force) return;
    renderQueued = true;
    requestAnimationFrame(() => renderProgression(force));
  }

  const content = document.getElementById('content');
  if (content) {
    const observer = new MutationObserver(() => queueRender());
    observer.observe(content, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-grade], [data-semester], [data-system], [data-scope], [data-concept], #langBtn')) {
      queueRender(true);
    }
  });

  document.getElementById('searchInput')?.addEventListener('input', () => queueRender(true));

  loadProgression().catch(error => console.warn('Progression timeline unavailable', error));
})();