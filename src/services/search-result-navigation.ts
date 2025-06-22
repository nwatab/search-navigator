import type { GoogleSearchTabType, PageType } from './get-search-results';

// Google search tab type detection
export function getGoogleSearchTabType(
  urlSearchParams: URLSearchParams
): GoogleSearchTabType | null {
  const udm = urlSearchParams.get('udm');
  const tbm = urlSearchParams.get('tbm');
  const q = urlSearchParams.get('q');
  if (q === null) {
    return null; // No search query, cannot determine tab type
  }
  // Not supporting maps.google. or /maps because there is nothing much to navigate there
  if (udm === null && tbm === null) {
    return 'all';
  }
  switch (tbm) {
    case 'isch': // Imase SearCH
      return 'image';
    case 'vid':
      return 'videos';
    case 'shop':
      return 'shopping';
    case 'nws':
      return 'news';
  }
  switch (udm) {
    // https://medium.com/@tanyongsheng0805/every-google-udm-in-the-world-6ee9741434c9
    // #2: Images
    // #6: Learn
    // #7: Videos
    // #12: News
    // #14: Web
    // #15: Attractions
    // #18: Forums
    // #28: Shopping
    // #36: Books
    // #37: Products
    // #44: Visual matches
    // #48: Exact matches
    case '2':
      return 'image';
    case '7':
      return 'videos';
    case '12':
      return 'news';
    case '28':
      return 'shopping';
  }
  return null; // not expected to be here
}

export const makeGetPageType =
  (
    getGoogleSearchTabType: (
      urlSearchParams: URLSearchParams
    ) => GoogleSearchTabType | null
  ) =>
  (location: Location): PageType => {
    const url = new URL(location.href);

    if (url.hostname === 'www.google.com') {
      const searchParam = new URLSearchParams(location.search);
      const tabType = getGoogleSearchTabType(searchParam);
      if (!tabType) {
        throw new Error(
          "Can't to determine search tab type for: " + location.href
        );
      }
      return tabType;
    }

    if (
      url.hostname === 'www.youtube.com' &&
      url.pathname === '/results' &&
      url.searchParams.has('search_query')
    ) {
      return 'youtube-search-result';
    }

    throw new Error(`Unexpected host: ${url}`);
  };
