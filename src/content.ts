import { storageSync } from './services/chrome-storage';
import { createKeymapManager } from './services/keymap-manager';
import './style.scss';
import {
  addClass,
  determineThemeFromRgb,
  extractBodyBackgroundRgb,
  getGoogleSearchResults,
  getGoogleSearchTabType,
  makeHighlight,
  removeClass,
  scrollIntoViewIfOutsideViewport,
} from './services';

(async () => {
  let currentIndex: number = 0;
  const keymapManager = await createKeymapManager(storageSync);
  const searchTabType = getGoogleSearchTabType(
    new URLSearchParams(window.location.search)
  );
  if (!searchTabType) {
    console.error(
      'Unable to determine search tab type. This extension only works on Google Search pages.'
    );
    return;
  }
  const results = getGoogleSearchResults(searchTabType);
  if (
    results.length > 0 &&
    (currentIndex < 0 || results.length <= currentIndex)
  ) {
    throw new Error(
      `currentIndex is out of bounds: ${currentIndex} of ${results.length}`
    );
  }
  const bodyBackgroundRgb = extractBodyBackgroundRgb(window, document);
  const theme =
    bodyBackgroundRgb == null
      ? 'light'
      : determineThemeFromRgb(bodyBackgroundRgb);
  const highlight = makeHighlight({ addClass, removeClass });
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
      if (
        results.length > 0 &&
        currentIndex < results.length - 1 &&
        searchTabType === 'all'
      ) {
        currentIndex++;
        highlight(results, currentIndex, theme);
        scrollIntoViewIfOutsideViewport(results[currentIndex]);
      }
    } else if (keymapManager.isKeyMatch(e, 'move_up') || e.key === 'ArrowUp') {
      // up
      // TODO: add support for image search
      e.preventDefault();
      if (results.length > 0 && currentIndex > 0 && searchTabType === 'all') {
        currentIndex--;
        highlight(results, currentIndex, theme);
        scrollIntoViewIfOutsideViewport(results[currentIndex]);
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
      switch (searchTabType) {
        case 'all':
          const link = results[currentIndex].querySelector('a');
          if (link instanceof HTMLAnchorElement && link.href) {
            const clickEvent = new MouseEvent('click', {
              ctrlKey: e.ctrlKey,
              metaKey: e.metaKey,
              shiftKey: e.shiftKey,
              bubbles: true,
              cancelable: true,
              view: window,
            });
            link.dispatchEvent(clickEvent);
          }
          break;
        case 'image':
          // TODO: add support for image search. It's complicated. Going up and down doesn't work when enlarging an image. More investigation needed.
          // const vhid = results[currentIndex].querySelector('div')?.dataset.vhid;
          // if (vhid) {
          //   const url = new URL(window.location.href);
          //   const currentHash = url.hash.replace('#', '');
          //   console.log(currentHash, vhid);
          //   if (currentHash === vhid) {
          //       url.hash = '';
          //   } else {
          //     url.hash = `#${vhid}`;
          //   }
          //   window.location.href = url.toString();
          // }
          break;
        default:
          break;
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
      if (searchTabType === 'all') {
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
      if (searchTabType === 'all') {
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
      if (searchTabType !== 'image') {
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
      if (searchTabType !== 'all') {
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
      if (searchTabType !== 'videos') {
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
      if (searchTabType !== 'shopping') {
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
      if (searchTabType !== 'news') {
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
    }
  });
})();
