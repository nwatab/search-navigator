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

  it('should not match any key for a disabled (null) shortcut', async () => {
    mockStorage.get.mockResolvedValue({
      key_configs: { ...defaultKeyConfigs, move_up: null },
    });

    const manager = await createKeymapManager(mockStorage);

    expect(manager.getKeyConfigs().move_up).toBeNull();
    expect(
      manager.isKeyMatch(
        { key: 'k', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false },
        'move_up'
      )
    ).toBe(false);
  });

  it('should not match open_link when disabled (null)', async () => {
    mockStorage.get.mockResolvedValue({
      key_configs: { ...defaultKeyConfigs, open_link: null },
    });

    const manager = await createKeymapManager(mockStorage);

    expect(
      manager.isKeyMatch(
        {
          key: 'Enter',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
        },
        'open_link'
      )
    ).toBe(false);
  });

  it('should keep disabled (null) shortcuts disabled after merging with defaults', async () => {
    mockStorage.get.mockResolvedValue({
      key_configs: { ...defaultKeyConfigs, switch_to_shopping: null },
    });

    const manager = await createKeymapManager(mockStorage);
    const configs = manager.getKeyConfigs();

    expect(configs.switch_to_shopping).toBeNull();
    // Other shortcuts are unaffected
    expect(configs.move_down).toEqual(defaultKeyConfigs.move_down);
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
