const API_BASE = '/api';

const listBody = document.getElementById('requests-body');
const listStatus = document.getElementById('list-status');
const formStatus = document.getElementById('form-status');
const createForm = document.getElementById('create-form');
const refreshBtn = document.getElementById('refresh');

function setStatus(el, text, kind = '') {
  el.textContent = text;
  el.classList.remove('error', 'ok');
  if (kind) el.classList.add(kind);
}

function renderRequests(items) {
  listBody.replaceChildren();
  if (!items.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Заявок нет';
    tr.append(td);
    listBody.append(tr);
    return;
  }
  for (const r of items) {
    const tr = document.createElement('tr');
    const cells = [r.id, r.equipmentId, r.title, r.priority, r.status, r.plannedAt ?? '—'];
    for (const value of cells) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    listBody.append(tr);
  }
}

async function loadRequests() {
  setStatus(listStatus, 'Загружаем…');
  try {
    const res = await fetch(`${API_BASE}/requests?page=1&limit=20`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    renderRequests(json.data);
    setStatus(listStatus, `Всего: ${json.total}`, 'ok');
  } catch (err) {
    setStatus(listStatus, `Ошибка: ${err.message}`, 'error');
  }
}

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(createForm);
  const apiKey = form.get('apiKey');
  const payload = {
    equipmentId: form.get('equipmentId'),
    title: form.get('title'),
    priority: form.get('priority'),
  };
  const description = form.get('description');
  if (description) payload.description = description;
  const plannedAt = form.get('plannedAt');
  if (plannedAt) payload.plannedAt = new Date(plannedAt).toISOString();

  setStatus(formStatus, 'Отправляем…');
  try {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey ?? '',
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
    setStatus(formStatus, `Создана заявка ${json.id}`, 'ok');
    createForm.reset();
    await loadRequests();
  } catch (err) {
    setStatus(formStatus, `Ошибка: ${err.message}`, 'error');
  }
});

refreshBtn.addEventListener('click', loadRequests);

loadRequests();