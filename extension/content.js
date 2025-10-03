const BASE = 'http://localhost:4000';

function createButton() {
  const btn = document.createElement('button');
  btn.textContent = 'Send Tracked';
  btn.style.cssText = 'margin-left:8px;padding:6px 10px;border:1px solid #1d4ed8;border-radius:6px;background:#2563eb;color:white;cursor:pointer;font-size:12px;line-height:1;z-index:1;position:relative;';
  btn.setAttribute('data-email-tracker-btn', '1');
  return btn;
}

async function sendTracked(to, subject, html) {
  const res = await fetch(`${BASE}/api/send-email?gmail=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
  if (!res.ok) throw new Error('send failed');
  return await res.json();
}

function htmlFromBodyDiv(div) {
  return div ? div.innerHTML : '';
}

function getRecipients(dialog) {
  // 1) Try chips: spans with email attribute
  const chipEmails = [...dialog.querySelectorAll('span[email]')]
    .map(el => el.getAttribute('email'))
    .filter(Boolean);
  if (chipEmails.length) return chipEmails.join(', ');

  // 2) Try hovercard id
  const hoverEmails = [...dialog.querySelectorAll('[data-hovercard-id]')]
    .map(el => el.getAttribute('data-hovercard-id'))
    .filter(Boolean);
  if (hoverEmails.length) return hoverEmails.join(', ');

  // 3) Try visible inputs/textarea
  const input = dialog.querySelector('input[aria-label="To"], input[aria-label="Recipients"], textarea[aria-label="To"], textarea[aria-label="Recipients"], input[name="to"], textarea[name="to"]');
  if (input && input.value) return input.value;

  // 4) Fallback: read To container text
  const toContainer = dialog.querySelector('div[aria-label="To"], div[aria-label="Recipients"]');
  if (toContainer && toContainer.textContent) return toContainer.textContent;

  return '';
}

function installButtons() {
  // Find all compose dialogs
  const dialogs = document.querySelectorAll('div[role="dialog"]');
  dialogs.forEach(dialog => {
    const existing = dialog.querySelector('[data-email-tracker-btn]');
    const subjectInput = dialog.querySelector('input[name="subjectbox"]');
    const bodyDiv = dialog.querySelector('div[aria-label="Message Body"], div[aria-label*="Message Body"], div[contenteditable="true"]');
    // Try multiple selectors for the native Send button
    const sendBtn = dialog.querySelector('div[role="button"][data-tooltip^="Send"], div[role="button"][data-tooltip*="Send"], div[role="button"][aria-label^="Send"], div[role="button"][aria-label*="Send"], button[aria-label^="Send"], button[aria-label*="Send"]');
    const moreOptions = dialog.querySelector('div[aria-label="More options"]');
    const toolbar = moreOptions ? moreOptions.closest('div[role="toolbar"]') : dialog.querySelector('div[role="toolbar"]');
    if (!subjectInput || !bodyDiv) return;

    let btn = existing;
    if (!btn) {
      btn = createButton();
      btn.addEventListener('click', async () => {
        try {
          const to = (getRecipients(dialog) || '').trim();
          const subject = (subjectInput.value || '').trim();
          const html = htmlFromBodyDiv(bodyDiv);
          if (!to || !subject || !html) { alert('Please fill To, Subject and Body'); return; }
          btn.disabled = true; btn.textContent = 'Sending…';
          await sendTracked(to, subject, html);
          btn.textContent = 'Sent!';
          setTimeout(() => { btn.textContent = 'Send Tracked'; btn.disabled = false; }, 1500);
        } catch (e) {
          console.error(e);
          alert('Send failed. Make sure you connected Gmail in the extension popup.');
          btn.disabled = false; btn.textContent = 'Send Tracked';
        }
      });
    }

    // Prefer placing beside the native Send button if available
    if (sendBtn && !existing) {
      const container = sendBtn.parentElement || sendBtn.closest('div') || toolbar;
      if (container && typeof sendBtn.insertAdjacentElement === 'function') {
        sendBtn.insertAdjacentElement('afterend', btn);
        console.debug('[EmailTracker] Inserted beside native Send');
        return;
      }
    }

    // Fallback: next to subject line
    if (!existing) {
      const subjectContainer = subjectInput.parentElement;
      if (subjectContainer) {
        subjectContainer.appendChild(btn);
        console.debug('[EmailTracker] Inserted beside Subject');
      } else if (toolbar) {
        toolbar.appendChild(btn);
        console.debug('[EmailTracker] Inserted in toolbar fallback');
      }
    }
  });
}

// Try repeatedly to handle dynamic DOM changes and different compose modes
const observer = new MutationObserver(() => installButtons());
observer.observe(document.documentElement, { childList: true, subtree: true });
installButtons();
setInterval(installButtons, 1000);


