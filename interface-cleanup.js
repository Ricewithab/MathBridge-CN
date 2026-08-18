(() => {
  'use strict';

  let queued = false;

  const isExpanded = () => document.body.classList.contains('comparison-expanded');
  const label = () => document.documentElement.lang === 'en'
    ? (isExpanded() ? 'Hide detailed analysis' : 'Show detailed analysis')
    : (isExpanded() ? '收起详细分析' : '查看详细分析');

  function setSecondaryVisibility(el, visible) {
    if (visible) {
      el.style.setProperty('display', el.matches('.grid-2') ? 'grid' : 'block', 'important');
      el.removeAttribute('aria-hidden');
    } else {
      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('aria-hidden', 'true');
    }
  }

  function apply() {
    queued = false;
    const content = document.getElementById('content');
    if (!content) return;

    const expanded = isExpanded();
    const direct = Array.from(content.children);

    direct.forEach(el => {
      const isSecondary = el.matches('.grid-2') || (el.matches('.card.full') && !['teacherModeCard', 'pepProgressionCard'].includes(el.id));
      const isEvidence = el.classList.contains('evidence-quiet') || Boolean(el.querySelector?.('.evidence-list'));
      const managed = isSecondary && !isEvidence;

      el.classList.toggle('compare-secondary', managed);

      if (managed) {
        el.dataset.compareSecondaryManaged = '1';
        setSecondaryVisibility(el, expanded);
      } else if (el.dataset.compareSecondaryManaged === '1') {
        delete el.dataset.compareSecondaryManaged;
        el.style.removeProperty('display');
        el.removeAttribute('aria-hidden');
      }
    });

    let row = document.getElementById('compareDetailToggle');
    const teacher = document.getElementById('teacherModeCard');
    const secondary = content.querySelector(':scope > .compare-secondary');

    if (!secondary) {
      row?.remove();
      return;
    }

    if (!row) {
      row = document.createElement('div');
      row.id = 'compareDetailToggle';
      row.className = 'compare-detail-toggle';
      row.innerHTML = '<button type="button"></button>';
    }

    const button = row.querySelector('button');
    button.textContent = label();
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-controls', 'content');

    if (teacher) teacher.insertAdjacentElement('afterend', row);
    else secondary.insertAdjacentElement('beforebegin', row);
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('#compareDetailToggle button')) {
      document.body.classList.toggle('comparison-expanded');
      apply();
      return;
    }

    if (event.target.closest('[data-grade], [data-semester], [data-system], [data-scope], [data-concept], #langBtn')) {
      queue();
    }
  });

  const content = document.getElementById('content');
  if (content) new MutationObserver(queue).observe(content, { childList: true, subtree: true });
  queue();
})();