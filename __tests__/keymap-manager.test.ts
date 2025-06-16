import {
  keyConfigToString,
  stringToKeyConfig,
  createKeymapManager,
  defaultKeyConfigs,
  type KeyConfig,
  type KeyConfigs,
} from '../src/services/keymap-manager';
import type { ChromeStorage } from '../src/services/chrome-storage';

describe('keyConfigToString', () => {
  it('should handle special keys', () => {
    const config: KeyConfig<string> = {
      key: 'ArrowUp',
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    };
    expect(keyConfigToString(config)).toBe('↑');
  });

  it('should handle meta key on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const config: KeyConfig<string> = {
      key: 'j',
      ctrl: false,
      alt: false,
      shift: false,
      meta: true,
    };
    expect(keyConfigToString(config)).toBe('Cmd + j');
  });

  it('should handle Pick<KeyConfig> with only key', () => {
    const config = { key: 'Enter' };
    expect(keyConfigToString(config)).toBe('Enter');
  });
});

describe('stringToKeyConfig', () => {
  it('should handle special key mappings', () => {
    const result = stringToKeyConfig('↑');
    expect(result).toEqual({
      key: 'ArrowUp',
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
    });
  });

  it('should handle Cmd key', () => {
    const result = stringToKeyConfig('Cmd + j');
    expect(result).toEqual({
      key: 'j',
      ctrl: false,
      alt: false,
      shift: false,
      meta: true,
    });
  });
});

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
