import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuid } from 'uuid';

const DATA_DIR = join(process.cwd(), 'data');
const FILE = join(DATA_DIR, 'equipment.json');

async function loadAll() {
  try {
    const raw = await readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveAll(items) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(items, null, 2), 'utf8');
}

function applyQuery(items, { filters = {}, sort = {}, page = 1, limit = 10 }) {
  let result = [...items];

  if (filters.status) result = result.filter((e) => e.status === filters.status);
  if (filters.type) result = result.filter((e) => e.type === filters.type);
  if (filters.search) {
    const q = String(filters.search).toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q)
    );
  }
  if (sort.field) {
    const dir = sort.order === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      if (a[sort.field] === b[sort.field]) return 0;
      return a[sort.field] > b[sort.field] ? dir : -dir;
    });
  }

  const total = result.length;
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  return { data, total, page, limit };
}

export const equipmentRepository = {
  async findAll(query) {
    const items = await loadAll();
    return applyQuery(items, query);
  },

  async findById(id) {
    const items = await loadAll();
    return items.find((e) => e.id === id) ?? null;
  },

  async findBySerialNumber(serialNumber) {
    const items = await loadAll();
    return items.find((e) => e.serialNumber === serialNumber) ?? null;
  },

  async create(data) {
    const items = await loadAll();
    const item = {
      id: uuid(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(item);
    await saveAll(items);
    return item;
  },

  async update(id, patch) {
    const items = await loadAll();
    const index = items.findIndex((e) => e.id === id);
    if (index === -1) return null;
    items[index] = {
      ...items[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await saveAll(items);
    return items[index];
  },

  async delete(id) {
    const items = await loadAll();
    const index = items.findIndex((e) => e.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    await saveAll(items);
    return true;
  },
};