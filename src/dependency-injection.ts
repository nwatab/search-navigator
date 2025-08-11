import {
  makeStorageSync,
  makeHighlight,
  makeUnhighlight,
  simulateYouTubeHover,
  clickPeopleAlsoAskAccordion,
  createKeymapManager,
  addClass,
  removeClass,
  scrollIntoViewIfOutsideViewport,
  getGoogleSearchTabType,
  makeGetPageType,
  determineThemeFromRgb,
  extractBackgroundRgb,
  makeDetectTheme,
  getGoogleSearchResults,
  getYouTubeSearchResults,
  makeGetSearchResults,
  makeWaitForSearchRoot,
  waitForSelector,
  getSearchRootSelector,
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
export { clickPeopleAlsoAskAccordion };

export const waitForSearchRoot = makeWaitForSearchRoot(
  waitForSelector,
  getSearchRootSelector
);
