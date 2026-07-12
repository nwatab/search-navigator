import {
  PEOPLE_ALSO_ASK_ACCORDION_TIMEOUT,
  UPDATE_KEYMAPPINGS_MESSAGE,
} from './constants';
import { keymapManagerPromise, storageSync } from './dependency-injection';
import type { PageType } from './services';
import {
  createRatePromptToast,
  defaultRatingState,
  detectTheme,
  getGoogleImageResultAnchors,
  getPageType,
  getRatingState,
  getSearchResults,
  highlight,
  incrementOpens,
  markDismissed,
  markRated,
  RATE_PROMPT_TOAST_ID,
  RATE_URL,
  saveRatingState,
  shouldShowRatePrompt,
  simulateYouTubeHover,
  togglePeopleAlsoAskAccordion,
  unhighlight,
  waitForSearchRoot,
} from './services';

import './style.scss';

(async () => {
  const keymapManager = await keymapManagerPromise;
  // init() re-runs on SPA navigation (yt-navigate-finish, popstate). Abort the
  // previous keydown listener so each keypress is handled exactly once (issue #73).
  let keydownAbortController: AbortController | null = null;

  // Rating nudge: count genuine result-opens and, once past the threshold, show
  // a single dismissible toast asking for a store rating. All local; no tracking.
  let ratingState = await getRatingState(storageSync).catch(
    () => defaultRatingState
  );
  let ratePromptHandled = false;

  const recordResultOpen = () => {
    const next = incrementOpens(ratingState);
    if (next === ratingState) return;
    ratingState = next;
    void saveRatingState(storageSync, ratingState).catch(() => {});
  };

  const maybeShowRatePrompt = (theme: 'light' | 'dark') => {
    if (ratePromptHandled) return;
    ratePromptHandled = true;
    if (!shouldShowRatePrompt(ratingState)) return;
    if (document.getElementById(RATE_PROMPT_TOAST_ID)) return;
    const toast = createRatePromptToast(theme, {
      onRate: () => {
        window.open(RATE_URL, '_blank', 'noopener');
        ratingState = markRated(ratingState);
        void saveRatingState(storageSync, ratingState).catch(() => {});
        toast.remove();
      },
      onDismiss: () => {
        ratingState = markDismissed(ratingState);
        void saveRatingState(storageSync, ratingState).catch(() => {});
        toast.remove();
      },
    });
    document.body.appendChild(toast);
  };

  async function init() {
    keydownAbortController?.abort();
    keydownAbortController = new AbortController();
    const { signal } = keydownAbortController;

    let currentIndex: number = 0;
    // Index of the image result whose preview panel was opened with Enter;
    // pressing Enter again on it opens the source page (issue #72).
    let enlargedIndex: number | null = null;
    let pageType: PageType;
    try {
      pageType = getPageType(window.location);
    } catch {
      // Not a supported search page (e.g. YouTube /watch reached via SPA
      // navigation). Stay inert until the next navigation.
      return;
    }
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

    // Ask for a rating once the user has opened enough results (fire-and-forget).
    maybeShowRatePrompt(theme);

    // Results may not be rendered yet (YouTube streams them in). Pressing
    // move_down re-queries, so navigation recovers once they appear.
    if (results.length > 0) {
      highlight(results, currentIndex, theme, {
        scrollIntoView: false,
      });

      // Simulate YouTube hover for YouTube search results
      if (pageType === 'youtube-search-result') {
        simulateYouTubeHover(results[currentIndex], 'mouseenter');
      }
    }

    // Add keydown event listener for all Google Search pages
    document.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (
          ['INPUT', 'TEXTAREA'].includes(
            (document.activeElement && document.activeElement.tagName) || ''
          )
        ) {
          return;
        }

        if (
          keymapManager.isKeyMatch(e, 'move_down') ||
          keymapManager.isKeyMatch(e, 'arrow_move_down')
        ) {
          // down
          e.preventDefault();
          const dynamicLoadPageTypes: PageType[] = [
            'all',
            'image',
            'youtube-search-result',
          ] as const;
          if (
            currentIndex >= results.length - 1 &&
            dynamicLoadPageTypes.includes(pageType)
          ) {
            const hadNoResults = results.length === 0;
            results = getSearchResults(document, pageType);
            if (hadNoResults && results.length > 0) {
              // Results appeared after an empty initial load; highlight the
              // first one instead of moving past it.
              currentIndex = 0;
              highlight(results, currentIndex, theme, { scrollIntoView: true });
              if (pageType === 'youtube-search-result') {
                simulateYouTubeHover(results[currentIndex], 'mouseenter');
              }
              return;
            }
          }
          if (results.length > 0 && currentIndex < results.length - 1) {
            // Simulate YouTube hover leave for the current element before moving
            if (pageType === 'youtube-search-result') {
              simulateYouTubeHover(results[currentIndex], 'mouseleave');
            }
            unhighlight(results, currentIndex);
            currentIndex++;
            highlight(results, currentIndex, theme, {
              scrollIntoView: true,
            });
            // Don't simulate hover for move down to avoid triggering preview
          }
        } else if (
          keymapManager.isKeyMatch(e, 'move_up') ||
          keymapManager.isKeyMatch(e, 'arrow_move_up')
        ) {
          // up
          e.preventDefault();
          if (results.length > 0 && currentIndex > 0) {
            // Simulate YouTube hover leave for the current element before moving
            if (pageType === 'youtube-search-result') {
              simulateYouTubeHover(results[currentIndex], 'mouseleave');
            }
            unhighlight(results, currentIndex);
            currentIndex--;
            highlight(results, currentIndex, theme, {
              scrollIntoView: true,
            });
            // Simulate YouTube hover for the new element
            if (pageType === 'youtube-search-result') {
              simulateYouTubeHover(results[currentIndex], 'mouseenter');
            }
          }
        } else if (keymapManager.isKeyMatch(e, 'open_link')) {
          // open link or expand section
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

          const currentResult = results[currentIndex];

          if (pageType === 'image') {
            // First Enter enlarges (opens Google's preview panel); Enter
            // again — or any modifier — opens the source page (issue #72).
            const { thumbnail, source } =
              getGoogleImageResultAnchors(currentResult);
            const { ctrlKey, metaKey, shiftKey } = e;
            const hasModifier = ctrlKey || metaKey || shiftKey;
            if (!hasModifier && enlargedIndex !== currentIndex && thumbnail) {
              thumbnail.click();
              enlargedIndex = currentIndex;
              return;
            }
            if (!source?.href) return;
            recordResultOpen();
            if (ctrlKey || metaKey) {
              window.open(source.href, '_blank');
            } else if (shiftKey) {
              window.open(source.href, '_blank', '');
            } else {
              source.click();
            }
            return;
          }

          // Check if this is a "People also ask" section first
          const hasRelatedQuestionPair = currentResult.querySelector(
            '.related-question-pair'
          );

          // This is a "People also ask" section, toggle expansion
          // ToDo: `open_link` (Mostly Enter key) should open a link in an expanded accordion, instead of closing it.
          if (hasRelatedQuestionPair) {
            togglePeopleAlsoAskAccordion(currentResult);

            setTimeout(() => {
              const newResults = getSearchResults(document, pageType);
              if (newResults.length > 0) {
                results = newResults;
                // Ensure currentIndex is still valid after recalculation
                if (currentIndex >= results.length) {
                  currentIndex = results.length - 1;
                }
                // Re-highlight the current element in case DOM structure changed
                // Note: Don't unhighlight first as it would collapse the expanded section
                highlight(results, currentIndex, theme, {
                  scrollIntoView: false,
                });
                // Simulate YouTube hover for the re-highlighted element
                if (pageType === 'youtube-search-result') {
                  simulateYouTubeHover(results[currentIndex], 'mouseenter');
                }
              }
            }, PEOPLE_ALSO_ASK_ACCORDION_TIMEOUT);
            return;
          }

          // Otherwise, handle as regular link opening
          const link = results[currentIndex].querySelector(
            'a[href]'
          ) as HTMLAnchorElement;
          if (!link?.href) return;
          recordResultOpen();
          const { ctrlKey, metaKey, shiftKey } = e;
          if (ctrlKey || metaKey) {
            // Ctrl+Click or Cmd+Click → new tab
            window.open(link.href, '_blank');
          } else if (shiftKey) {
            // Shift+Click → new window (popup)
            // any non-undefined "features" string forces a new window
            window.open(link.href, '_blank', '');
          } else {
            // plain Enter/Click → same tab
            link.click(); // for accessibility
          }
        } else if (
          keymapManager.isKeyMatch(e, 'navigate_previous') ||
          keymapManager.isKeyMatch(e, 'arrow_navigate_previous')
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
          keymapManager.isKeyMatch(e, 'arrow_navigate_next')
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
      },
      { signal }
    );
  }

  const safeInit = () => {
    init().catch((error) => {
      console.error('search-navigator: failed to initialize', error);
    });
  };

  safeInit();

  // YouTube navigation event listener
  document.addEventListener('yt-navigate-finish', safeInit);

  // popstate (back/forward) event listener
  window.addEventListener('popstate', safeInit);

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
