import { UPDATE_KEYMAPPINGS_MESSAGE } from './constants';
import {
  detectTheme,
  getPageType,
  getSearchResults,
  highlight,
  keymapManagerPromise,
  unhighlight,
  waitForSearchRoot,
} from './dependency-injection';
import type { PageType } from './services';

import './style.scss';

(async () => {
  const keymapManager = await keymapManagerPromise;

  async function init() {
    let currentIndex: number = 0;
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
    const theme = detectTheme(window, document, pageType);

    highlight(results, currentIndex, theme, {
      autoExpand: true,
      scrollIntoView: false,
      simulateHover: true,
    });

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
      } else if (
        keymapManager.isKeyMatch(e, 'move_up') ||
        e.key === 'ArrowUp'
      ) {
        // up
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
  }

  init();

  // YouTube navigation event listener
  document.addEventListener('yt-navigate-finish', init);

  // popstate (back/forward) event listener
  window.addEventListener('popstate', init);

  // Listen for keymap updates from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === UPDATE_KEYMAPPINGS_MESSAGE) {
      // Update the keymap manager with new configurations
      // The saveKeyConfigs method updates both storage and in-memory state
      keymapManager
        .saveKeyConfigs(message.keyConfigs)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error('Error saving key configs:', error);
          sendResponse({ success: false, error: error.message });
        });

      // Return true to indicate we will send a response asynchronously. Otherwise, change is not reflected.
      // > By default, the sendResponse callback must be called synchronously. If you want to do asynchronous work to get the value passed to sendResponse, you must return a literal true (not just a truthy value) from the event listener. Doing so will keep the message channel open to the other end until sendResponse is called.
      // https://developer.chrome.com/docs/extensions/develop/concepts/messaging
      return true;
    }
  });
})();
