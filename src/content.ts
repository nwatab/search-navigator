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
  getBraveImageSourceLink,
  getGoogleImageResultAnchors,
  getPageType,
  getPaginationUrl,
  getRatingState,
  getSearchResults,
  getSearchTabType,
  getSearchTabUrl,
  highlight,
  incrementOpens,
  isBravePageType,
  markDismissed,
  markRated,
  preserveHighlight,
  RATE_PROMPT_TOAST_ID,
  RATE_URL,
  saveRatingState,
  type SearchTabType,
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
    // Ask at most once, ever. Persist that the prompt has been shown *now* so
    // that ignoring it (leaving without clicking) never re-shows it on the next
    // page load. Clicking "Rate" simply upgrades the status to 'rated'.
    ratingState = markDismissed(ratingState);
    void saveRatingState(storageSync, ratingState).catch(() => {});
    const toast = createRatePromptToast(theme, {
      onRate: () => {
        window.open(RATE_URL, '_blank', 'noopener');
        ratingState = markRated(ratingState);
        void saveRatingState(storageSync, ratingState).catch(() => {});
        toast.remove();
      },
      onDismiss: () => {
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

    if (isBravePageType(pageType)) {
      // Brave hydrates after the content script runs and resets the class of
      // result elements, removing the highlight from the first result.
      preserveHighlight(
        document.body,
        () => results[currentIndex],
        theme,
        signal
      );
    }

    const currentTab = getSearchTabType(pageType);
    const query = new URLSearchParams(window.location.search).get('q');
    const switchToTab = (tab: SearchTabType) => {
      if (currentTab === tab) return;
      const url = getSearchTabUrl(pageType, tab, query);
      if (url) window.location.href = url;
    };

    const onKeydown = (e: KeyboardEvent) => {
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
          'brave-image',
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

        if (pageType === 'brave-image') {
          // First Enter opens Brave's preview panel; Enter again while the
          // panel shows this result opens the source page.
          const source = getBraveImageSourceLink(currentResult);
          if (!source) {
            currentResult.click();
            return;
          }
          recordResultOpen();
          const { ctrlKey, metaKey, shiftKey } = e;
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
        const url = getPaginationUrl(
          document,
          window.location,
          pageType,
          'previous'
        );
        if (url) window.location.href = url;
      } else if (
        keymapManager.isKeyMatch(e, 'navigate_next') ||
        keymapManager.isKeyMatch(e, 'arrow_navigate_next')
      ) {
        // next page
        e.preventDefault();
        const url = getPaginationUrl(
          document,
          window.location,
          pageType,
          'next'
        );
        if (url) window.location.href = url;
      } else if (keymapManager.isKeyMatch(e, 'switch_to_image_search')) {
        // switch to image search
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          return;
        }
        switchToTab('image');
      } else if (keymapManager.isKeyMatch(e, 'switch_to_all_search')) {
        // switch to all search
        e.preventDefault();
        switchToTab('all');
      } else if (keymapManager.isKeyMatch(e, 'switch_to_videos')) {
        // switch to videos tab
        e.preventDefault();
        switchToTab('videos');
      } else if (keymapManager.isKeyMatch(e, 'switch_to_shopping')) {
        // switch to shopping tab
        e.preventDefault();
        switchToTab('shopping');
      } else if (keymapManager.isKeyMatch(e, 'switch_to_news')) {
        // switch to news tab
        e.preventDefault();
        switchToTab('news');
      } else if (keymapManager.isKeyMatch(e, 'switch_to_map')) {
        // switch to map tab
        e.preventDefault();
        if (query) {
          const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
          window.location.href = mapUrl;
        }
      } else if (keymapManager.isKeyMatch(e, 'switch_to_youtube')) {
        // switch to YouTube
        e.preventDefault();
        if (query) {
          const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          window.location.href = youtubeUrl;
        }
      }
    };

    if (isBravePageType(pageType)) {
      // Brave Search has its own arrow-key navigation over results. Handle
      // keys before the page does and keep the ones we consumed from
      // reaching it, so a keypress does not move two selections.
      window.addEventListener(
        'keydown',
        (e) => {
          onKeydown(e);
          if (e.defaultPrevented) e.stopImmediatePropagation();
        },
        { signal, capture: true }
      );
    } else {
      document.addEventListener('keydown', onKeydown, { signal });
    }
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
