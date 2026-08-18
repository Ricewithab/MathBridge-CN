(() => {
  'use strict';

  let lastSignature = '';
  let queued = false;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[ch]));

  const textOf = node => (node?.textContent || '').trim();

  function activeSystemLabel(zh) {
    const system = document.querySelector('[data-system].active')?.dataset.system || 'England';
    if (system === 'US') {
      const jurisdiction = document.getElementById('usJurisdiction')?.value || 'Common Core baseline';
      if (jurisdiction === 'Common Core baseline') return zh ? '美国 Common Core' : 'US Common Core';
      return jurisdiction;
    }
    return zh ? '英格兰' : 'England';
  }

  function renderTeacherView(force = false) {
    queued = false;

    const root = document.getElementById('content');
    const pageHead = root?.querySelector(':scope > .page-head');
    const conceptButton = document.querySelector('.topic-btn.active[data-concept]');
    if (!root || !pageHead || !conceptButton) return;

    const zh = document.documentElement.lang !== 'en';
    const placementGrid = Array.from(root.children).find(el => el.classList?.contains('grid-2'));
    const placementCards = placementGrid ? Array.from(placementGrid.children) : [];
    const chinaCard = placementCards[0] || null;
    const compareCard = placementCards[1] || null;

    const fullCards = Array.from(root.querySelectorAll(':scope > .card.full')).filter(el => el.id !== 'pepProgressionCard' && el.id !== 'teacherQuickView');
    const whyCard = fullCards.find(el => {
      const h = textOf(el.querySelector('.card-title h2'));
      return h === '对照说明' || h === 'Comparison note';
    }) || fullCards[0] || null;
    const classroomCard = fullCards.find(el => {
      const h = textOf(el.querySelector('.card-title h2'));
      return h === '课堂可用' || h === 'Classroom use';
    }) || fullCards[1] || null;

    const pepPlacement = textOf(chinaCard?.querySelector('.placement.pep .placement-title'));
    const chinaFallback = textOf(chinaCard?.querySelector('.placement .placement-title'));
    const chinaText = pepPlacement || chinaFallback || (zh ? '查看下方中国课程位置。' : 'See the China placement below.');

    const compareText = textOf(compareCard?.querySelector('.body-copy')) ||
      textOf(compareCard?.querySelector('.placement.west .placement-note')) ||
      textOf(compareCard?.querySelector('.placement.west .placement-title')) ||
      textOf(compareCard?.querySelector('.empty')) ||
      (zh ? '暂无可显示的课程差异。' : 'No curriculum difference is currently available.');

    const whyText = textOf(whyCard?.querySelector('.body-copy')) ||
      (zh ? '查看下方对照说明。' : 'See the comparison note below.');

    const tryText = textOf(classroomCard?.querySelector('.task-prompt')) ||
      textOf(whyCard?.querySelector('.callout p')) ||
      (zh ? '查看下方课堂任务。' : 'See the classroom task below.');

    const systemLabel = activeSystemLabel(zh);
    const grade = document.querySelector('[data-grade].active')?.dataset.grade || '';
    const signature = [conceptButton.dataset.concept, grade, zh ? 'zh' : 'en', systemLabel, chinaText, compareText, whyText, tryText].join('|');
    const existing = document.getElementById('teacherQuickView');
    if (!force && signature === lastSignature && existing) return;
    lastSignature = signature;
    existing?.remove();

    const card = document.createElement('section');
    card.className = 'teacher-quick-view';
    card.id = 'teacherQuickView';
    card.innerHTML = `
      <div class="teacher-view-head">
        <div>
          <div class="section-kicker">${zh ? '教师快速视图' : 'Teacher quick view'}</div>
          <h2>${zh ? '如果下一节课要教这个概念' : 'If you teach this concept next lesson'}</h2>
        </div>
        <span class="chip blue">${esc(systemLabel)}</span>
      </div>
      <div class="teacher-view-grid">
        <div class="teacher-view-step step-cn">
          <div class="teacher-step-number">1</div>
          <div class="teacher-step-label">${zh ? '中国教材位置' : 'China textbook placement'}</div>
          <div class="teacher-step-text">${esc(chinaText)}</div>
        </div>
        <div class="teacher-view-step step-compare">
          <div class="teacher-step-number">2</div>
          <div class="teacher-step-label">${zh ? `${systemLabel}有什么不同` : `What differs in ${systemLabel}`}</div>
          <div class="teacher-step-text">${esc(compareText)}</div>
        </div>
        <div class="teacher-view-step step-why">
          <div class="teacher-step-number">3</div>
          <div class="teacher-step-label">${zh ? '为什么值得注意' : 'Why it matters'}</div>
          <div class="teacher-step-text">${esc(whyText)}</div>
        </div>
        <div class="teacher-view-step step-try">
          <div class="teacher-step-number">4</div>
          <div class="teacher-step-label">${zh ? '下一节课可以试' : 'Try next lesson'}</div>
          <div class="teacher-step-text">${esc(tryText)}</div>
        </div>
      </div>
      <div class="teacher-view-note">${zh
        ? '这是下方已核实课程、教学建议和课堂任务的快速摘要；完整证据和来源仍保留在页面下方。'
        : 'This is a quick summary of the verified curriculum comparison, teaching guidance and classroom task below. Full evidence and sources remain on the page.'}</div>`;

    pageHead.insertAdjacentElement('afterend', card);
  }

  function queue(force = false) {
    if (queued && !force) return;
    queued = true;
    requestAnimationFrame(() => renderTeacherView(force));
  }

  const root = document.getElementById('content');
  if (root) {
    new MutationObserver(() => queue()).observe(root, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-grade], [data-semester], [data-system], [data-scope], [data-concept], #langBtn')) queue(true);
  });
  document.getElementById('usJurisdiction')?.addEventListener('change', () => queue(true));
  document.getElementById('searchInput')?.addEventListener('input', () => queue(true));

  queue(true);
})();
