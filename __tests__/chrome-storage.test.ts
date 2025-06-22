import {
  makeStorageSync,
  type ChromeStorage,
} from '../src/services/chrome-storage';

// Mock Chrome API
const mockChrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  runtime: {
    lastError: null as any,
  },
};

// Set up global chrome mock
(global as any).chrome = mockChrome;

describe('Chrome Storage', () => {
  let storageSync: ChromeStorage;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockChrome.runtime.lastError = null;

    // Create storageSync instance with mocked chrome storage
    storageSync = makeStorageSync(mockChrome.storage.sync as any);
  });

  describe('storageSync.get', () => {
    it('should resolve with data when chrome.storage.sync.get succeeds', async () => {
      const testData = { key1: 'value1', key2: 'value2' };
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      const result = await storageSync.get(['key1', 'key2']);

      expect(result).toEqual(testData);
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(
        ['key1', 'key2'],
        expect.any(Function)
      );
    });

    it('should reject when chrome.runtime.lastError is set', async () => {
      const error = { message: 'Storage error' };
      mockChrome.runtime.lastError = error;
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      await expect(storageSync.get('key1')).rejects.toEqual(error);
    });
  });

  describe('storageSync.set', () => {
    it('should resolve when chrome.storage.sync.set succeeds', async () => {
      mockChrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      const items = { key1: 'value1', key2: 'value2' };
      await expect(storageSync.set(items)).resolves.toBeUndefined();

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(
        items,
        expect.any(Function)
      );
    });

    it('should reject when chrome.runtime.lastError is set', async () => {
      const error = { message: 'Storage set error' };
      mockChrome.runtime.lastError = error;
      mockChrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      const items = { key1: 'value1' };
      await expect(storageSync.set(items)).rejects.toEqual(error);
    });
  });

  describe('storageSync.remove', () => {
    it('should resolve when removing keys succeeds', async () => {
      mockChrome.storage.sync.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await expect(storageSync.remove('key1')).resolves.toBeUndefined();

      expect(mockChrome.storage.sync.remove).toHaveBeenCalledWith(
        'key1',
        expect.any(Function)
      );
    });

    it('should reject when chrome.runtime.lastError is set', async () => {
      const error = { message: 'Storage remove error' };
      mockChrome.runtime.lastError = error;
      mockChrome.storage.sync.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await expect(storageSync.remove('key1')).rejects.toEqual(error);
    });
  });

  describe('storageSync.clear', () => {
    it('should resolve when chrome.storage.sync.clear succeeds', async () => {
      mockChrome.storage.sync.clear.mockImplementation((callback) => {
        callback();
      });

      await expect(storageSync.clear()).resolves.toBeUndefined();

      expect(mockChrome.storage.sync.clear).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should reject when chrome.runtime.lastError is set', async () => {
      const error = { message: 'Storage clear error' };
      mockChrome.runtime.lastError = error;
      mockChrome.storage.sync.clear.mockImplementation((callback) => {
        callback();
      });

      await expect(storageSync.clear()).rejects.toEqual(error);
    });
  });
});
