import {
  makeStorageSync,
  makeHighlight,
  makeUnhighlight,
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
  scrollIntoViewIfOutsideViewport
);
export const unhighlight = makeUnhighlight(removeClass);
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
