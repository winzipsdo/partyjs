export const STORAGE_PREFIX = 'my-app';
export const createStorageKey = (key: string) => `${STORAGE_PREFIX}:${key}`;
