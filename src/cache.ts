type QueryCache = {
  set(key: string, content: any): void;
  get(key: string): any;
};

export function createCache(): QueryCache {
  const cache = new Map<string, any>();

  return cache;
}
