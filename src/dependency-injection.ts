import {
  addClass,
  createKeymapManager,
  determineThemeFromRgb,
  extractBackgroundRgb,
  getGoogleSearchResults,
  getGoogleSearchTabType,
  getSearchRootSelector,
  getYouTubeSearchResults,
  makeDetectTheme,
  makeGetPageType,
  makeGetSearchResults,
  makeHighlight,
  makeStorageSync,
  makeUnhighlight,
  makeWaitForSearchRoot,
  removeClass,
  scrollIntoViewIfOutsideViewport,
  simulateYouTubeHover,
  waitForSelector,
} from './services';

export const storageSync = makeStorageSync(chrome.storage.sync);
export const keymapManagerPromise = createKeymapManager(storageSync);
export const detectTheme = makeDetectTheme(
  extractBackgroundRgb,
  determineThemeFromRgb
);
export const highlight = makeHighlight(
  addClass,
  scrollIntoViewIfOutsideViewport,
  simulateYouTubeHover
);
export const unhighlight = makeUnhighlight(removeClass, simulateYouTubeHover);
export const getPageType = makeGetPageType(getGoogleSearchTabType);
export const getSearchResults = makeGetSearchResults(
  getGoogleSearchResults,
  getYouTubeSearchResults
);

export const waitForSearchRoot = makeWaitForSearchRoot(
  waitForSelector,
  getSearchRootSelector
);
