import {
  createKeymapManager,
  defaultKeyConfigs,
  type KeyConfigs,
} from '../src/services/keymap-manager';
import type { ChromeStorage } from '../src/services/chrome-storage';

describe('createKeymapManager', () => {
  let mockStorage: jest.Mocked<ChromeStorage>;

  beforeEach(() => {
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    };
  });

  it('should create keymap manager with default configs when no stored configs', async () => {
    mockStorage.get.mockResolvedValue({});

    const manager = await createKeymapManager(mockStorage);
    const configs = manager.getKeyConfigs();

    expect(configs).toEqual(defaultKeyConfigs);
  });

  it('should match keys correctly for open_link action', async () => {
    mockStorage.get.mockResolvedValue({});

    const manager = await createKeymapManager(mockStorage);

    const event = {
      key: 'Enter',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
    };

    expect(manager.isKeyMatch(event, 'open_link')).toBe(true);
  });

  it('should save key configs to storage', async () => {
    mockStorage.get.mockResolvedValue({});
    mockStorage.set.mockResolvedValue();

    const manager = await createKeymapManager(mockStorage);
    const newConfigs: KeyConfigs<string> = {
      ...defaultKeyConfigs,
      move_up: { key: 'w', ctrl: false, alt: false, shift: false, meta: false },
    };

    const result = await manager.saveKeyConfigs(newConfigs);

    expect(mockStorage.set).toHaveBeenCalledWith({ key_configs: newConfigs });
    expect(result).toEqual(newConfigs);
    expect(manager.getKeyConfigs()).toEqual(newConfigs);
  });
});
