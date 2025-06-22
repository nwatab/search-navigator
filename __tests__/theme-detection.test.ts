import path from 'path';
import { JSDOM } from 'jsdom';
import {
  determineThemeFromRgb,
  extractBackgroundRgb,
} from '../src/services/theme-detection';

describe('extractRgbFromHtml', () => {
  it('should detect light color from YouTube search result', async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250622-youtube-lake-natron-flamingos-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    const windowGlobal = dom.window as unknown as Window & typeof globalThis;
    const document = windowGlobal.document;
    const documentEl = document.documentElement;
    const rgb = extractBackgroundRgb(windowGlobal, documentEl);
    expect(rgb).toEqual([255, 255, 255]); // Expecting white background
  });

  it('should detect dark color from YouTube search result', async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250620-youtube-search-result-prokofiev-piano-concerto-3-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    const windowGlobal = dom.window as unknown as Window & typeof globalThis;
    const document = windowGlobal.document;
    const documentEl = document.documentElement;
    const rgb = extractBackgroundRgb(windowGlobal, documentEl);
    expect(rgb).toEqual([15, 15, 15]); // Expecting white background
  });
});

describe('determineThemeFromRgb', () => {
  it('should handle edge cases', () => {
    // Exactly at threshold: (128*299 + 128*587 + 128*114)/1000 = 128
    const rgb: [number, number, number] = [128, 128, 128];
    const result = determineThemeFromRgb(rgb, 128);
    expect(result).toBe('light'); // Should be light since 128 is NOT less than 128
  });

  it('should handle invalid/extreme RGB values', () => {
    // Negative values - should be treated as 0
    const result1 = determineThemeFromRgb([-10, -5, -1]);
    expect(result1).toBe('dark'); // Calculated as 0, which is < 128

    // Values above 255 - should work with the calculation
    const result2 = determineThemeFromRgb([300, 400, 500]);
    expect(result2).toBe('light'); // (300*299 + 400*587 + 500*114)/1000 = 368.5, which is > 128
  });

  it('should handle floating point precision edge cases', () => {
    // RGB values that result in brightness exactly at common thresholds
    // Finding RGB that gives exactly 127.999... (just under 128)
    const result1 = determineThemeFromRgb([127, 128, 127]); // (127*299 + 128*587 + 127*114)/1000 = 127.485
    expect(result1).toBe('dark');

    // RGB values that give exactly 128
    const result2 = determineThemeFromRgb([128, 128, 128]);
    expect(result2).toBe('light'); // exactly 128, not less than 128
  });

  it('should handle zero threshold edge case', () => {
    // With threshold 0, everything should be light except pure black
    const result1 = determineThemeFromRgb([0, 0, 0], 0);
    expect(result1).toBe('light'); // 0 is not less than 0

    const result2 = determineThemeFromRgb([1, 1, 1], 0);
    expect(result2).toBe('light'); // Any positive value > 0
  });
});
