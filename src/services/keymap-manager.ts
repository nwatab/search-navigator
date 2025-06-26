import type { ChromeStorage } from './chrome-storage';
import type { KeyConfig } from './keymap-utils';

export interface KeyConfigs<T extends string> {
  move_up: KeyConfig<T>;
  move_down: KeyConfig<T>;
  open_link: Pick<KeyConfig<T>, 'key'>; // open link only needs the key
  navigate_previous: KeyConfig<T>;
  navigate_next: KeyConfig<T>;
  switch_to_image_search: KeyConfig<T>;
  switch_to_all_search: KeyConfig<T>;
  switch_to_videos: KeyConfig<T>;
  switch_to_shopping: KeyConfig<T>;
  switch_to_news: KeyConfig<T>;
  switch_to_map: KeyConfig<T>;
  switch_to_youtube: KeyConfig<T>;
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
  switch_to_videos: {
    key: 'v',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  switch_to_shopping: {
    key: 's',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  switch_to_news: {
    key: 'n',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  switch_to_map: {
    key: 'm',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
  switch_to_youtube: {
    key: 'y',
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  },
} as const;

export const createKeymapManager = async (
  storage: ChromeStorage
): Promise<KeymapManager<string>> => {
  const currentData = await storage.get<{ key_configs?: KeyConfigs<string> }>(
    'key_configs'
  );
  let current = currentData.key_configs ?? defaultKeyConfigs;

  return {
    getKeyConfigs() {
      return current;
    },
    isKeyMatch(e, action) {
      if (action === 'open_link') {
        const cfg = current[action];
        return e.key === cfg.key;
      }
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
