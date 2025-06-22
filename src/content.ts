import { UPDATE_KEYMAPPINGS_MESSAGE } from './constants';
import {
  addClass,
  determineThemeFromRgb,
  extractBackgroundRgb,
  getPageType,
  getSearchResults,
  makeDetectTheme,
  makeHighlight,
  makeUnhighlight,
  PageType,
  removeClass,
  scrollIntoViewIfOutsideViewport,
  waitForSearchRoot,
} from './services';
import { storageSync } from './services/chrome-storage';
import { createKeymapManager } from './services/keymap-manager';
import './style.scss';

(async () => {
  let currentIndex: number = 0;
  const keymapManager = await createKeymapManager(storageSync);
  const pageType = getPageType(window.location);
  // ON YouTube search, you need wait for client rendering. Search root is
  // shown with 8-10 search results, which is enough to cover a viewport.
  // More results are streamed very quickly. Those results are not taken at this moment,
  // so when a user scrolls down, `getSearchResults` is called again.
  await waitForSearchRoot(document, pageType);
  let results = getSearchResults(document, pageType);
  if (
    results.length > 0 &&
    (currentIndex < 0 || results.length <= currentIndex)
  ) {
    throw new Error(
      `currentIndex is out of bounds: ${currentIndex} of ${results.length}`
    );
  }
  const detectTheme = makeDetectTheme(
    extractBackgroundRgb,
    determineThemeFromRgb
  );
  const theme = detectTheme(window, document, pageType);
  const highlight = makeHighlight(addClass, scrollIntoViewIfOutsideViewport);
  const unhighlight = makeUnhighlight(removeClass);

  highlight(results, currentIndex, theme);

  // Add keydown event listener for all Google Search pages
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (
      ['INPUT', 'TEXTAREA'].includes(
        (document.activeElement && document.activeElement.tagName) || ''
      )
    ) {
      return;
    }

    if (keymapManager.isKeyMatch(e, 'move_down') || e.key === 'ArrowDown') {
      // down
      // TODO: add support for image search
      e.preventDefault();
      const dynamicLoadPageTypes: PageType[] = [
        'image',
        'youtube-search-result',
      ] as const;
      if (
        currentIndex === results.length - 1 &&
        dynamicLoadPageTypes.includes(pageType)
      ) {
        results = getSearchResults(document, pageType);
      }
      if (results.length > 0 && currentIndex < results.length - 1) {
        unhighlight(results, currentIndex);
        currentIndex++;
        highlight(results, currentIndex, theme);
      }
    } else if (keymapManager.isKeyMatch(e, 'move_up') || e.key === 'ArrowUp') {
      // up
      // TODO: add support for image search
      e.preventDefault();
      if (results.length > 0 && currentIndex > 0) {
        unhighlight(results, currentIndex);
        currentIndex--;
        highlight(results, currentIndex, theme);
      }
    } else if (keymapManager.isKeyMatch(e, 'open_link')) {
      // open link
      e.preventDefault();
      if (
        !(
          0 < results.length &&
          0 <= currentIndex &&
          currentIndex < results.length
        )
      ) {
        return; // not expected to happen
      }
      const link = results[currentIndex].querySelector(
        'a[href]'
      ) as HTMLAnchorElement;
      if (!link?.href) return;
      const { ctrlKey, metaKey, shiftKey } = e;
      if (ctrlKey || metaKey) {
        // Ctrl+Click or Cmd+Click → new tab
        window.open(link.href, '_blank');
      } else if (shiftKey) {
        // Shift+Click → new window (popup)
        // any non-undefined “features” string forces a new window
        window.open(link.href, '_blank', '');
      } else {
        // plain Enter/Click → same tab
        link.click(); // for accessibility
      }
    } else if (
      keymapManager.isKeyMatch(e, 'navigate_previous') ||
      e.key === 'ArrowLeft'
    ) {
      // previous page
      e.preventDefault();
      // TODO: add support for image search
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      if (['all', 'videos', 'shopping', 'news'].includes(pageType)) {
        const prevLink = document.querySelector('#pnprev');
        if (prevLink instanceof HTMLAnchorElement && prevLink.href) {
          window.location.href = prevLink.href;
        }
      }
    } else if (
      keymapManager.isKeyMatch(e, 'navigate_next') ||
      e.key === 'ArrowRight'
    ) {
      // next page
      e.preventDefault();
      if (['all', 'videos', 'shopping', 'news'].includes(pageType)) {
        const nextLink = document.querySelector('#pnnext');
        if (nextLink instanceof HTMLAnchorElement && nextLink.href) {
          window.location.href = nextLink.href;
        }
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_image_search')) {
      // switch to image search
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      if (pageType !== 'image') {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q');

        if (query) {
          // Construct image search URL
          const imageSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
          window.location.href = imageSearchUrl;
        }
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_all_search')) {
      // switch to all search
      e.preventDefault();
      if (pageType !== 'all') {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q');
        if (!query) {
          window.location.href = 'https://www.google.com';
        } else {
          const allSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
          window.location.href = allSearchUrl;
        }
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_videos')) {
      // switch to videos tab
      e.preventDefault();
      if (pageType !== 'videos') {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q');
        if (query) {
          const videosUrl = `https://www.google.com/search?tbm=vid&q=${encodeURIComponent(query)}`;
          window.location.href = videosUrl;
        }
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_shopping')) {
      // switch to shopping tab
      e.preventDefault();
      if (pageType !== 'shopping') {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q');
        if (query) {
          const shoppingUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
          window.location.href = shoppingUrl;
        }
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_news')) {
      // switch to news tab
      e.preventDefault();
      if (pageType !== 'news') {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q');
        if (query) {
          const newsUrl = `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(query)}`;
          window.location.href = newsUrl;
        }
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_map')) {
      // switch to map tab
      e.preventDefault();
      const searchParams = new URLSearchParams(window.location.search);
      const query = searchParams.get('q');
      if (query) {
        const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        window.location.href = mapUrl;
      }
    } else if (keymapManager.isKeyMatch(e, 'switch_to_youtube')) {
      // switch to YouTube
      e.preventDefault();
      const searchParams = new URLSearchParams(window.location.search);
      const query = searchParams.get('q');
      if (query) {
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        window.location.href = youtubeUrl;
      }
    }
  });

  // Listen for keymap updates from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === UPDATE_KEYMAPPINGS_MESSAGE) {
      // Update the keymap manager with new configurations
      keymapManager.saveKeyConfigs(message.keyConfigs);
      sendResponse({ success: true });
    }
  });
})();
