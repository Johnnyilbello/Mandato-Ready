export interface StorageAdapter {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): void;
  remove(key: string): void;
  clearNamespace(): void;
}

const STORAGE_KEY_PREFIX = 'mandato_ready_v1_';

class BrowserLocalStorageAdapter implements StorageAdapter {
  read<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;

    try {
      const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  write<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(value));
    } catch {
      // Prototype persistence must never make the UI unusable.
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
    } catch {
      // Ignore storage failures in the local prototype.
    }
  }

  clearNamespace(): void {
    if (typeof window === 'undefined') return;

    try {
      const keysToRemove: string[] = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // Ignore storage failures in the local prototype.
    }
  }
}

export const prototypeStorage: StorageAdapter = new BrowserLocalStorageAdapter();

/**
 * Separate namespace for lightweight UI preferences that are not domain data.
 * Keeping this behind the same adapter prevents direct localStorage coupling in views.
 */
export const uiPreferenceStorage = {
  read<T>(key: string, fallback: T): T {
    return prototypeStorage.read(`ui_${key}`, fallback);
  },
  write<T>(key: string, value: T): void {
    prototypeStorage.write(`ui_${key}`, value);
  },
  remove(key: string): void {
    prototypeStorage.remove(`ui_${key}`);
  },
};
