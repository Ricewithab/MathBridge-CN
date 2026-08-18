(() => {
  'use strict';

  let queued = false;

  function polishTeacherMode() {
    queued = false;
    const card = document.getElementById('teacherModeCard');
    if (!card) return;

    const zh = document.documentElement.lang !== 'en';
    const subtitle = card.querySelector('.tm-head p');
    const blocks = card.querySelectorAll('.tm-output-grid .tm-block');
    const firstHeading = blocks[0]?.querySelector('h3');
    const secondHeading = blocks[1]?.querySelector('h3');

    if (subtitle) {
      subtitle.textContent = zh
        ? '先按中国教材进度完成当前学习，再从英格兰或美国资料中选择一个有价值的教学做法。'
        : 'Start from the Chinese textbook sequence, then borrow one useful teaching move from England or the US.';
    }

    if (firstHeading) {
      firstHeading.textContent = zh ? '先保留中国教材进度' : 'Keep the Chinese textbook sequence';
    }

    const system = document.querySelector('[data-system].active')?.dataset.system || 'England';
    const jurisdiction = document.getElementById('usJurisdiction')?.value || 'Common Core baseline';
    const stateLayer = system === 'US' && jurisdiction !== 'Common Core baseline';

    if (secondHeading) {
      secondHeading.textContent = stateLayer
        ? (zh ? '查看州级课程位置' : 'Check state curriculum placement')
        : (zh ? '再加入一个西方视角' : 'Add one Western lens');
    }
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
