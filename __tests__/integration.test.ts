/**
 * Integration tests for content script functionality
 * These tests verify the overall behavior when components work together
 */

import { JSDOM } from 'jsdom';
import {
  getGoogleSearchResults,
  getGoogleSearchTabType,
  makeHighlight,
  makeUnhighlight,
  addClass,
  removeClass,
  scrollIntoViewIfOutsideViewport,
  determineThemeFromRgb,
  extractBodyBackgroundRgb,
} from '../src/services';

// Mock scrollIntoViewIfOutsideViewport
jest.mock('../src/services/dom-utils', () => {
  const actual = jest.requireActual('../src/services/dom-utils');
  return {
    ...actual,
    scrollIntoViewIfOutsideViewport: jest.fn().mockImplementation((el) => el),
  };
});

describe('Content Script Integration', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Google Search</title></head>
        <body style="background-color: rgb(255, 255, 255);">
          <div id="search">
            <div class="g">
              <h3><a href="https://example1.com">Result 1</a></h3>
              <div>Description 1</div>
            </div>
            <div class="g">
              <h3><a href="https://example2.com">Result 2</a></h3>
              <div>Description 2</div>
            </div>
            <div class="g">
              <h3><a href="https://example3.com">Result 3</a></h3>
              <div>Description 3</div>
            </div>
          </div>
        </body>
      </html>
    `);

    document = dom.window.document;
    window = dom.window as unknown as Window & typeof globalThis;

    // Mock getComputedStyle
    window.getComputedStyle = jest.fn().mockReturnValue({
      backgroundColor: 'rgb(255, 255, 255)',
    });

    // Set up global document for other functions
    global.document = document;
    global.window = window as any;
  });

  describe('End-to-end navigation flow', () => {
    it('should detect search tab type and extract results', () => {
      // Test URL parsing
      const urlParams = new URLSearchParams('q=test+query');
      const tabType = getGoogleSearchTabType(urlParams);
      expect(tabType).toBe('all');

      // Test result extraction
      const results = getGoogleSearchResults('all', document);
      expect(results).toHaveLength(3);
      expect(results[0].querySelector('h3 a')?.getAttribute('href')).toBe(
        'https://example1.com'
      );
    });

    it('should detect theme and apply correct highlighting', () => {
      // Extract theme from body background
      const bgRgb = extractBodyBackgroundRgb(window, document);
      expect(bgRgb).toEqual([255, 255, 255]);

      // Determine theme
      const theme = determineThemeFromRgb(bgRgb!);
      expect(theme).toBe('light');

      // Get results and apply highlighting
      const results = getGoogleSearchResults('all', document);
      const highlight = makeHighlight(
        addClass,
        scrollIntoViewIfOutsideViewport
      );

      highlight(results, 0, theme);

      expect(results[0].classList.contains('sn-selected-light')).toBe(true);
      expect(scrollIntoViewIfOutsideViewport).toHaveBeenCalledWith(results[0]);
    });

    it('should handle unhighlighting correctly', () => {
      const results = getGoogleSearchResults('all', document);
      const highlight = makeHighlight(
        addClass,
        scrollIntoViewIfOutsideViewport
      );
      const unhighlight = makeUnhighlight(removeClass);

      // First highlight
      highlight(results, 1, 'light');
      expect(results[1].classList.contains('sn-selected-light')).toBe(true);

      // Then unhighlight
      unhighlight(results, 1);
      expect(results[1].classList.contains('sn-selected-light')).toBe(false);
      expect(results[1].classList.contains('sn-selected-dark')).toBe(false);
    });

    it('should handle different search tabs', () => {
      // Test image search
      const imageParams = new URLSearchParams('q=test&tbm=isch');
      expect(getGoogleSearchTabType(imageParams)).toBe('image');

      // Test news search
      const newsParams = new URLSearchParams('q=test&tbm=nws');
      expect(getGoogleSearchTabType(newsParams)).toBe('news');

      // Test videos search
      const videosParams = new URLSearchParams('q=test&udm=7');
      expect(getGoogleSearchTabType(videosParams)).toBe('videos');
    });

    it('should handle dark theme correctly', () => {
      // Mock dark theme background
      window.getComputedStyle = jest.fn().mockReturnValue({
        backgroundColor: 'rgb(32, 33, 36)', // Google's dark theme color
      });

      const bgRgb = extractBodyBackgroundRgb(window, document);
      const theme = determineThemeFromRgb(bgRgb!);
      expect(theme).toBe('dark');

      const results = getGoogleSearchResults('all', document);
      const highlight = makeHighlight(
        addClass,
        scrollIntoViewIfOutsideViewport
      );

      highlight(results, 0, theme);
      expect(results[0].classList.contains('sn-selected-dark')).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid search results gracefully', () => {
      // Document with no search results
      const emptyDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      const results = getGoogleSearchResults('all', emptyDom.window.document);
      expect(results).toHaveLength(0);
    });

    it('should handle invalid URL parameters', () => {
      const invalidParams = new URLSearchParams('invalid=params');
      const tabType = getGoogleSearchTabType(invalidParams);
      expect(tabType).toBeNull();
    });

    it('should handle highlighting with invalid indices', () => {
      const results = getGoogleSearchResults('all', document);
      const highlight = makeHighlight(
        addClass,
        scrollIntoViewIfOutsideViewport
      );
      const unhighlight = makeUnhighlight(removeClass);

      expect(() => highlight(results, -1, 'light')).toThrow('Invalid index');
      expect(() => highlight(results, 999, 'light')).toThrow('Invalid index');
      expect(() => unhighlight(results, -1)).toThrow('Invalid index');
      expect(() => unhighlight(results, 999)).toThrow('Invalid index');
    });

    it('should handle missing background color gracefully', () => {
      window.getComputedStyle = jest.fn().mockReturnValue({
        backgroundColor: 'transparent',
      });

      const bgRgb = extractBodyBackgroundRgb(window, document);
      expect(bgRgb).toBeNull();

      // Should fallback to light theme when background detection fails
      const fallbackTheme =
        bgRgb == null ? 'light' : determineThemeFromRgb(bgRgb);
      expect(fallbackTheme).toBe('light');
    });
  });

  describe('Performance considerations', () => {
    it('should efficiently handle large result sets', () => {
      // Create DOM with many results
      const largeResultsHtml = Array.from(
        { length: 100 },
        (_, i) => `
        <div class="g">
          <h3><a href="https://example${i}.com">Result ${i}</a></h3>
          <div>Description ${i}</div>
        </div>
      `
      ).join('');

      const largeDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="search">${largeResultsHtml}</div>
          </body>
        </html>
      `);

      const startTime = performance.now();
      const results = getGoogleSearchResults('all', largeDom.window.document);
      const endTime = performance.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle repeated highlighting operations efficiently', () => {
      const results = getGoogleSearchResults('all', document);
      const highlight = makeHighlight(
        addClass,
        scrollIntoViewIfOutsideViewport
      );
      const unhighlight = makeUnhighlight(removeClass);

      const startTime = performance.now();

      // Simulate rapid navigation
      for (let i = 0; i < results.length; i++) {
        highlight(results, i, 'light', { scrollIntoView: false });
        unhighlight(results, i);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });
});
