const saveForm = document.getElementById('save-form');
const getForm = document.getElementById('get-form');
const saveName = document.getElementById('save-name');
const saveLanguage = document.getElementById('save-language');
const saveExpiration = document.getElementById('save-expiration');
const saveCode = document.getElementById('save-code');
const saveButton = document.getElementById('save-button');
const saveMessage = document.getElementById('save-message');
const getName = document.getElementById('get-name');
const getButton = document.getElementById('get-button');
const result = document.getElementById('result');
const charCount = document.getElementById('char-count');
const expirationHelp = document.getElementById('expiration-help');

saveCode.addEventListener('input', () => {
  charCount.textContent = saveCode.value.length.toLocaleString() + ' chars';
});

saveExpiration.addEventListener('change', () => {
  if (saveExpiration.value === 'once') {
    expirationHelp.textContent = 'The first successful retrieval permanently destroys this clip.';
  } else if (saveExpiration.value === 'never') {
    expirationHelp.textContent = 'The clip remains available until another clip uses the same name.';
  } else {
    expirationHelp.textContent = 'The clip is automatically removed when this window ends.';
  }
});

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function retentionText(clip) {
  if (clip.burnAfterRead) return 'view once · disappears after retrieval';
  if (clip.expiresAt) return 'expires ' + formatDate(clip.expiresAt);
  return 'stays until replaced';
}

function showError(message) {
  result.innerHTML = '<div class="error-box"><div><strong>Clip unavailable</strong><p>' + message + '</p><button class="clear-button" onclick="resetResult()">Clear</button></div></div>';
}

function resetResult() {
  result.innerHTML = '<div class="empty"><div><div style="font-size: 30px; opacity: .45;">&lt;/&gt;</div><p>Enter a clip name to pull it across.</p></div></div>';
}

function showClip(clip) {
  const lines = clip.code.split('\n');
  const lineHtml = lines.map((line, index) => ('<div class="code-line"><span class="line-number">' + String(index + 1).padStart(2,'0') + '</span><code class="line-code"></code></div>')).join('');
  result.innerHTML = '<div class="code-header"><span>' + clip.name + '</span><button class="copy-button" id="copy-button">copy</button></div>' + '<div class="code-body" id="code-body">' + lineHtml + '</div>' + '<div class="code-footer"><span>' + (clip.language || 'plain text') + '</span><span>' + retentionText(clip) + '</span><span>' + lines.length + (lines.length === 1 ? ' line' : ' lines') + '</span></div>' + '<div style="padding: 0 15px 14px;"><button class="clear-button" id="clear-button">clear</button></div>';
  const codeElements = result.querySelectorAll('.line-code');
  codeElements.forEach((element, index) => { element.textContent = lines[index] || ' '; });
  document.getElementById('copy-button').addEventListener('click', async () => { await navigator.clipboard.writeText(clip.code); document.getElementById('copy-button').textContent = 'copied'; });
  document.getElementById('clear-button').addEventListener('click', resetResult);
}

saveForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = saveName.value.trim();
  const code = saveCode.value;
  if (!name || !code.trim()) return;
  saveButton.disabled = true;
  saveButton.querySelector('span').textContent = 'Saving...';
  saveMessage.innerHTML = '';
  try {
    const response = await fetch('/api/clips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, code, language: saveLanguage.value.trim() || null, expiration: saveExpiration.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The clip could not be saved.');
    saveMessage.innerHTML = '<div class="success">Clip saved as <strong>' + data.name + '</strong>.<br />' + retentionText(data) + '.' + '</div>';
    getName.value = data.name;
  } catch (error) {
    saveMessage.innerHTML = '<div class="failure">' + (error.message || 'The clip could not be saved.') + '</div>';
  } finally {
    saveButton.disabled = false;
    saveButton.querySelector('span').textContent = 'Leave clip';
  }
});

getForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = getName.value.trim();
  if (!name) return;
  getButton.disabled = true;
  result.innerHTML = '<div class="empty"><p>Loading your clip...</p></div>';
  try {
    const response = await fetch('/api/clips/' + encodeURIComponent(name));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No clip found with that name.');
    showClip(data);
  } catch (error) {
    showError(error.message || 'No clip found with that name.');
  } finally {
    getButton.disabled = false;
  }
});
