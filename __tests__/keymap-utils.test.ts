import {
  keyConfigToString,
  stringToKeyConfig,
  type KeyConfig,
} from '../src/services/keymap-utils';

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
