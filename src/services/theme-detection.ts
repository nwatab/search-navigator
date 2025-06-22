import { PageType } from './get-search-results';

export const extractBackgroundRgb = (
  window: Window & typeof globalThis,
  el: HTMLElement
): [number, number, number] | null => {
  const bgColor = window.getComputedStyle(el).backgroundColor;
  const rgbValues = bgColor.match(/\d+/g)?.map(Number);
  if (!rgbValues || rgbValues.length < 3) return null;
  return [rgbValues[0], rgbValues[1], rgbValues[2]];
};

// Theme detection utilities
export function determineThemeFromRgb(
  rgb: [number, number, number],
  brightnessThreshold: number = 128
): 'light' | 'dark' {
  const [r, g, b] = rgb;
  return r * 299 + g * 587 + b * 114 < brightnessThreshold * 1000
    ? 'dark'
    : 'light';
}

export const makeDetectTheme =
  (
    extractBackgroundRgb: (
      window: Window & typeof globalThis,
      el: HTMLElement
    ) => [number, number, number] | null,
    determineThemeFromRgb: (
      rgb: [number, number, number],
      brightnessThreshold?: number
    ) => 'light' | 'dark'
  ) =>
  (
    window: Window & typeof globalThis,
    document: Document,
    pageType: PageType
  ): 'light' | 'dark' => {
    const el =
      pageType === 'youtube-search-result'
        ? document.documentElement
        : document.body;
    const rgb = extractBackgroundRgb(window, el);
    const theme = determineThemeFromRgb(rgb || [255, 255, 255]);
    return theme;
  };
