type QueryCache = {
  set(key: string, content: any): void;
  get(key: string): any;
  delete(key: string): void;
};

const caches: Map<string, any>[] = [];

export function createCache(): QueryCache {
  const cache = new Map<string, any>();
  caches.push(cache);

  return cache;
}

export function clearCache() {
  for (const cache of caches) {
    cache.clear();
  }
}
