const CACHE_PREFIX = "exam-cache:";

function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getCache(cacheKey, ttlMs) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const fullKey = `${CACHE_PREFIX}${cacheKey}`;
  const raw = storage.getItem(fullKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      storage.removeItem(fullKey);
      return null;
    }

    const { timestamp, data } = parsed;
    if (typeof timestamp !== "number") {
      storage.removeItem(fullKey);
      return null;
    }

    if (Date.now() - timestamp > ttlMs) {
      storage.removeItem(fullKey);
      return null;
    }

    return data;
  } catch {
    storage.removeItem(fullKey);
    return null;
  }
}

export function setCache(cacheKey, data) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const fullKey = `${CACHE_PREFIX}${cacheKey}`;
  const payload = JSON.stringify({
    timestamp: Date.now(),
    data,
  });

  storage.setItem(fullKey, payload);
}

export function removeCache(cacheKey) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
}
