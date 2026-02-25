// Auto-parse feature for TaxFlowAI
(function setupAutoParse() {
  function isValidWebhookUrlLocal(url) {
    try {
      const p = new URL(url);
      return ['http:', 'https:'].includes(p.protocol);
    } catch (_e) {
      return false;
    }
  }
  const toggle = () => document.getElementById('autoParseToggle');
  const textArea = () => document.getElementById('n8nText');
  const hint = () => document.getElementById('autoParseHint');

  const enabled = () => toggle() && toggle().checked;

  const triggerParse = async (text) => {
    const urlEl = document.getElementById('n8nUrl');
    if (!urlEl || !text) return;
    const url = urlEl.value.trim();
    if (!url || !isValidWebhookUrlLocal(url)) {
      document.getElementById('n8nStatus') &&
        (document.getElementById('n8nStatus').textContent = 'Invalid webhook');
      return;
    }
    if (textArea()) textArea().value = text;
    try {
      document.getElementById('n8nStatus') &&
        (document.getElementById('n8nStatus').textContent = 'Auto-sending…');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: window.lang || 'fr', source: 'taxflowai-autoparse' }),
      });
      if (!response.ok) throw new Error('Bad status');
      const payload = await response.json();
      const normalized = window.normalizeN8nPayload ? normalizeN8nPayload(payload) : null;
      if (!normalized) {
        document.getElementById('n8nStatus') &&
          (document.getElementById('n8nStatus').textContent = 'No parsed fields');
        return;
      }
      window.lastN8nResult = normalized;
      document.getElementById('applyN8nBtn').disabled = false;
      document.getElementById('n8nStatus') &&
        (document.getElementById('n8nStatus').textContent = 'Fields received');
    } catch (_e) {
      document.getElementById('n8nStatus') &&
        (document.getElementById('n8nStatus').textContent = 'Could not reach webhook');
    }
  };

  document.addEventListener('paste', (ev) => {
    if (!enabled()) return;
    const text = (ev.clipboardData || window.clipboardData).getData('text');
    if (text && text.trim()) triggerParse(text.trim());
  });

  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (ev) => {
    if (!enabled()) return;
    ev.preventDefault();
    const dt = ev.dataTransfer;
    if (!dt) return;
    if (dt.items) {
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i];
        if (item.kind === 'string') {
          item.getAsString((s) => triggerParse(s));
          return;
        }
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f && f.type.indexOf('text') !== -1) {
            const r = new FileReader();
            r.onload = (e) => triggerParse(String(e.target.result || ''));
            r.readAsText(f);
            return;
          }
        }
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const t = toggle();
    if (t && hint()) {
      t.addEventListener('change', () => {
        hint().textContent = t.checked ? 'Auto‑parse activé' : 'Auto‑parse désactivé';
      });
    }
  });
})();
