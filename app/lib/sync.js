import { supabase } from "./supabase";

const SYNC_QUEUE_KEY = "sa_sync_queue";

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function addToQueue(op) {
  const queue = getQueue();
  queue.push({ ...op, _id: crypto.randomUUID(), _createdAt: Date.now() });
  saveQueue(queue);
}

export function removeFromQueue(id) {
  saveQueue(getQueue().filter(o => o._id !== id));
}

export function getQueueSize() {
  return getQueue().length;
}

export async function processQueue() {
  const queue = getQueue();
  if (!queue.length) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const op of queue) {
    try {
      let query = supabase.from(op.table);

      switch (op.type) {
        case "insert":
          await query.insert(op.data);
          break;
        case "delete":
          await query.delete().eq(op.column, op.value);
          break;
        case "deleteMany":
          await query.delete().in(op.column, op.values);
          break;
      }

      removeFromQueue(op._id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
