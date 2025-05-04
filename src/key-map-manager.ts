import { UPDATE_KEYMAPPINGS_MESSAGE } from './constants';
import type { ChromeStorage } from './chrome-storage';

export interface KeyConfig<T extends string> {
  key: T;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean; // Cmd (macOS) or Windows key (Windows0)
}

export interface KeyConfigs<T extends string> {
  move_up: KeyConfig<T>;
  move_down: KeyConfig<T>;
  open_link: KeyConfig<T>;
  navigate_previous: KeyConfig<T>;
  navigate_next: KeyConfig<T>;
  switch_to_image_search: KeyConfig<T>;
  switch_to_all_search: KeyConfig<T>;
}

export type Action = keyof KeyConfigs<string>;

export interface KeymapManager<T extends string> {
  getKeyConfigs: () => KeyConfigs<T>;
  isKeyMatch: (
    event: {
      key: string;
      ctrlKey: boolean;
      altKey: boolean;
      shiftKey: boolean;
      metaKey: boolean;
    },
    action: Action
  ) => boolean;
  saveKeyConfigs: (configs: KeyConfigs<T>) => Promise<KeyConfigs<T>>;
  clearKeyConfigs: () => Promise<KeyConfigs<T>>;
}

export const defaultKeyConfigs: KeyConfigs<string> = {
  move_up: { key: 'k', ctrl: false, alt: false, shift: false, meta: false },
  move_down: { key: 'j', ctrl: false, alt: false, shift: false, meta: false },
  open_link: {
    key: 'Enter',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  navigate_previous: {
    key: 'h',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  navigate_next: {
    key: 'l',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  switch_to_image_search: {
    key: 'i',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  switch_to_all_search: {
    key: 'a',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
};

const SPECIAL_KEY_MAP: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Escape: 'Esc',
  ' ': 'Space',
} as const;
const REVERSE_KEY_MAP: Record<string, string> = {
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
  Esc: 'Escape',
  Space: ' ',
} as const;

// helper functions
export function keyConfigToString<T extends string>(cfg: KeyConfig<T>): string {
  console.log(cfg);
  const parts: string[] = [];
  if (cfg.ctrl) parts.push('Ctrl');
  if (cfg.alt) parts.push('Alt');
  if (cfg.shift) parts.push('Shift');
  if (cfg.meta) parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win');
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(cfg.key)) {
    parts.push(SPECIAL_KEY_MAP[cfg.key] || cfg.key);
  }
  return parts.join(' + ');
}

export function stringToKeyConfig<T extends string>(str: string): KeyConfig<T> {
  const cfg: KeyConfig<T> = {
    key: '' as T,
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  };
  str.split('+').forEach((part) => {
    const trimmedPart = part.trim();
    switch (trimmedPart) {
      case 'Ctrl':
        cfg.ctrl = true;
        break;
      case 'Alt':
        cfg.alt = true;
        break;
      case 'Shift':
        cfg.shift = true;
        break;
      case 'Cmd':
      case 'Win':
        cfg.meta = true;
        break;
      default:
        cfg.key = (REVERSE_KEY_MAP[trimmedPart] ?? trimmedPart) as T;
    }
  });
  return cfg;
}

export const createKeymapManager = async (
  storage: ChromeStorage
): Promise<KeymapManager<string>> => {
  const currentData = await storage.get<{ key_configs?: KeyConfigs<string> }>(
    'key_configs'
  );
  let current = currentData.key_configs ?? defaultKeyConfigs;

  return {
    getKeyConfigs() {
      console.log('getKeyConfigs', current);
      return current;
    },
    isKeyMatch(e, action) {
      const cfg = current[action];
      return cfg
        ? e.key === cfg.key &&
            e.ctrlKey === cfg.ctrl &&
            e.altKey === cfg.alt &&
            e.shiftKey === cfg.shift &&
            e.metaKey === cfg.meta
        : false;
    },
    async saveKeyConfigs(configs: KeyConfigs<string>) {
      await storage.set({ key_configs: configs });
      current = configs;
      return configs;
    },
    async clearKeyConfigs() {
      await storage.remove('key_configs');
      current = defaultKeyConfigs;
      return defaultKeyConfigs;
    },
  };
};
