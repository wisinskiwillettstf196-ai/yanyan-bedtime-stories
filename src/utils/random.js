export function pickRandom(items) {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function stableIndexForDate(date, total) {
  if (!total) return 0;
  const key = getTodayKey(date);
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 100000;
  }

  return hash % total;
}
