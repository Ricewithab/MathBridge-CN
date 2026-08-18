(() => {
  'use strict';

  let queued = false;

  function polishTeacherMode() {
    queued = false;
    const card = document.getElementById('teacherModeCard');
    if (!card) return;

    const zh = document.documentElement.lang !== 'en';
    const title = card.querySelector('.tm-head h2');
    const subtitle = card.querySelector('.tm-head p');
    const blocks = card.querySelectorAll('.tm-output-grid .tm-block');
    const headings = Array.from(blocks).map(block => block.querySelector('h3'));

    if (title) {
      title.textContent = zh ? '教师视图 · 教学对照' : 'Teacher view · Practical comparison';
    }

    if (subtitle) {
      subtitle.textContent = zh
        ? '把中国教材进度与英格兰或美国课程对照、教学价值、课堂应用和理解检查集中在一个视图中。'
        : 'Chinese textbook context alongside an England or US curriculum comparison, rationale, classroom application and understanding check.';
    }

    const system = document.querySelector('[data-system].active')?.dataset.system || 'England';
    const jurisdiction = document.getElementById('usJurisdiction')?.value || 'Common Core baseline';
    const stateLayer = system === 'US' && jurisdiction !== 'Common Core baseline';

    const labels = zh
      ? [
          '中国教材进度',
          stateLayer ? '州级课程位置' : '西方课程对照',
          '教学价值',
          '课堂应用',
          '教师提问与表征',
          '理解检查'
        ]
      : [
          'Chinese textbook sequence',
          stateLayer ? 'State curriculum placement' : 'Western curriculum comparison',
          'Why it matters',
          'Classroom application',
          'Teacher prompts & representations',
          'Understanding check'
        ];

    headings.forEach((heading, index) => {
      if (heading && labels[index]) heading.textContent = labels[index];
    });
  }

  function queuePolish() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(polishTeacherMode);
  }

  const content = document.getElementById('content');
  if (content) {
    new MutationObserver(queuePolish).observe(content, { childList: true, subtree: true });
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-grade], [data-semester], [data-system], [data-scope], [data-concept], [data-tm-persona], [data-tm-goal], #langBtn')) {
      queuePolish();
    }
  });
  document.getElementById('usJurisdiction')?.addEventListener('change', queuePolish);

  queuePolish();
})();