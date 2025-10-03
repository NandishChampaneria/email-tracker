const BASE = 'http://localhost:4000';

async function getStatus() {
  try {
    const res = await fetch(`${BASE}/api/google/status`);
    if (!res.ok) throw new Error('bad');
    const data = await res.json();
    return data; // { email } | null
  } catch (e) { return null; }
}

async function getAuthUrl() {
  const res = await fetch(`${BASE}/api/google/oauth/url`);
  const data = await res.json();
  return data.url;
}

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const connectBtn = document.getElementById('connect');

  const status = await getStatus();
  if (status && status.email) {
    statusEl.textContent = `Connected: ${status.email}`;
    connectBtn.textContent = 'Reconnect';
  } else {
    statusEl.textContent = 'Not connected';
  }

  connectBtn.addEventListener('click', async () => {
    const url = await getAuthUrl();
    chrome.tabs.create({ url });
  });
});


