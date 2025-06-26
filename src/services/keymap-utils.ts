export interface KeyConfig<T extends string> {
  key: T;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean; // Cmd (macOS) or Windows key (Windows0)
}

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
export function keyConfigToString<T extends string>(cfg: KeyConfig<T>): string;
export function keyConfigToString<T extends string>(
  cfg: Pick<KeyConfig<T>, 'key'>
): string;

export function keyConfigToString<T extends string>(
  cfg: KeyConfig<T> | Pick<KeyConfig<T>, 'key'>
): string {
  const parts: string[] = [];
  if ('ctrl' in cfg && cfg.ctrl) parts.push('Ctrl');
  if ('alt' in cfg && cfg.alt) parts.push('Alt');
  if ('shift' in cfg && cfg.shift) parts.push('Shift');
  if ('meta' in cfg && cfg.meta)
    parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win');
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
