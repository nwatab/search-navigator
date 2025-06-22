export type ChromeStorage = {
  get<T = any>(
    keys?: string | string[] | { [key: string]: any } | null
  ): Promise<T>;
  set(items: { [key: string]: any }): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
};

export const makeStorageSync = (
  storageSync: chrome.storage.SyncStorageArea
) => ({
  get<T = any>(keys?: string | string[] | { [key: string]: any }): Promise<T> {
    return new Promise((resolve, reject) => {
      storageSync.get(keys ?? null, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result as T);
        }
      });
    });
  },

  set(items: { [key: string]: any }): Promise<void> {
    return new Promise((resolve, reject) => {
      storageSync.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      storageSync.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },
});
