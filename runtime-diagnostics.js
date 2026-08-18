(() => {
  'use strict';

  const diagnostics = {
    lastFailure: null,
    failures: []
  };
  window.MathBridgeDiagnostics = diagnostics;

  const remember = detail => {
    diagnostics.lastFailure = detail;
    diagnostics.failures.push(detail);
    console.error('[MathBridge data load]', detail);
    updateVisibleError();
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const request = args[0];
    const url = typeof request === 'string' ? request : request?.url || String(request);
    try {
      const response = await originalFetch(...args);
      if (!response.ok && /(?:database\/|\.json(?:$|\?))/i.test(url)) {
        remember({ type: 'http', url, status: response.status, statusText: response.statusText || '' });
      }
      return response;
    } catch (error) {
      remember({ type: 'network', url, message: error?.message || String(error) });
      throw error;
    }
  };

  const originalJson = Response.prototype.json;
  Response.prototype.json = async function (...args) {
    try {
      return await originalJson.apply(this, args);
    } catch (error) {
      remember({
        type: 'json-parse',
        url: this.url || '(unknown response URL)',
        status: this.status,
        message: error?.message || String(error)
      });
      throw error;
    }
  };

  function updateVisibleError() {
    const box = document.querySelector('#content .error-box');
    const failure = diagnostics.lastFailure;
    if (!box || !failure || box.dataset.diagnosticAdded === '1') return;
    box.dataset.diagnosticAdded = '1';
    const detail = document.createElement('div');
    detail.style.cssText = 'margin-top:12px;padding-top:12px;border-top:1px solid #fecdca;font-size:12px;line-height:1.55;word-break:break-all';
    const status = failure.status ? `HTTP ${failure.status}${failure.statusText ? ` ${failure.statusText}` : ''}` : (failure.type || 'error');
    detail.innerHTML = `<strong>Diagnostic:</strong> ${escapeHtml(status)}<br><code>${escapeHtml(failure.url || '')}</code>${failure.message ? `<br>${escapeHtml(failure.message)}` : ''}`;
    box.appendChild(detail);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[ch]));
  }

  const observer = new MutationObserver(updateVisibleError);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
