const STORAGE_KEY = "yanyan-bedtime-story-state-v1";

export function loadStoryState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { likedIds: [], readIds: [] };

    const parsed = JSON.parse(stored);
    return {
      likedIds: Array.isArray(parsed.likedIds) ? parsed.likedIds : [],
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
    };
  } catch {
    return { likedIds: [], readIds: [] };
  }
}

export function saveStoryState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or full storage should not break the reading experience.
  }
}

export function toggleId(ids, id) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function addId(ids, id) {
  return ids.includes(id) ? ids : [...ids, id];
}
