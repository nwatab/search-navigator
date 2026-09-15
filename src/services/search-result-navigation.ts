import {
  isBravePageType,
  toBraveSearchTabType,
  type BraveSearchTabType,
  type GoogleSearchTabType,
  type PageType,
} from './get-search-results';

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
    // #1: Web
    // #2: Images
    // #6: Learn
    // #7: Videos
    // #12: News
    // #14: Web (alternate variant)
    // #15: Attractions
    // #18: Forums
    // #28: Shopping
    // #36: Books
    // #37: Products
    // #44: Visual matches
    // #48: Exact matches
    case '1':
    case '14':
      return 'all';
    case '2':
      return 'image';
    case '7':
      return 'videos';
    case '12':
      return 'news';
    case '28':
      return 'shopping';
  }
  // Google periodically introduces new tbm/udm values. Rather than breaking
  // every shortcut on an unrecognized value, fall back to the default tab type.
  console.warn(
    `Unknown Google search tab type (tbm=${tbm}, udm=${udm}); falling back to "all".`
  );
  return 'all';
}

const BRAVE_TAB_BY_PATHNAME: Record<string, BraveSearchTabType> = {
  '/search': 'all',
  '/images': 'image',
  '/videos': 'videos',
  '/news': 'news',
};

// Brave search tab type detection
export function getBraveSearchTabType(url: URL): BraveSearchTabType | null {
  if (!url.searchParams.get('q')) {
    return null;
  }
  return BRAVE_TAB_BY_PATHNAME[url.pathname] ?? null;
}

export const getPageType = (location: Location): PageType => {
  const url = new URL(location.href);

  if (url.hostname === 'www.google.com') {
    const searchParam = new URLSearchParams(location.search);
    const tabType = getGoogleSearchTabType(searchParam);
    if (!tabType) {
      throw new Error("Can't determine search tab type for: " + location.href);
    }
    return tabType;
  }

  if (url.hostname === 'search.brave.com') {
    const tabType = getBraveSearchTabType(url);
    if (!tabType) {
      throw new Error("Can't determine search tab type for: " + location.href);
    }
    return `brave-${tabType}`;
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

export type SearchTabType = GoogleSearchTabType;

/**
 * The search tab the page belongs to, regardless of search engine, or null
 * for pages without tabs (YouTube).
 */
export const getSearchTabType = (pageType: PageType): SearchTabType | null => {
  if (isBravePageType(pageType)) {
    return toBraveSearchTabType(pageType);
  }
  if (pageType === 'youtube-search-result') {
    return null;
  }
  return pageType;
};

const BRAVE_PATHNAME_BY_TAB: Record<BraveSearchTabType, string> = {
  all: '/search',
  image: '/images',
  videos: '/videos',
  news: '/news',
};

const GOOGLE_TBM_BY_TAB: Record<SearchTabType, string | null> = {
  all: null,
  image: 'isch',
  videos: 'vid',
  shopping: 'shop',
  news: 'nws',
};

/**
 * URL of `tab` for `query` on the search engine of `pageType`. Stays on Brave
 * when already there; returns null when that engine has no such tab (Brave
 * has no Shopping tab). Without a query, the "all" tab is the engine's home.
 */
export const getSearchTabUrl = (
  pageType: PageType,
  tab: SearchTabType,
  query: string | null
): string | null => {
  if (isBravePageType(pageType)) {
    if (tab === 'shopping') return null;
    if (!query) return tab === 'all' ? 'https://search.brave.com' : null;
    return `https://search.brave.com${BRAVE_PATHNAME_BY_TAB[tab]}?q=${encodeURIComponent(query)}`;
  }
  if (!query) return tab === 'all' ? 'https://www.google.com' : null;
  const tbm = GOOGLE_TBM_BY_TAB[tab];
  return `https://www.google.com/search?${tbm ? `tbm=${tbm}&` : ''}q=${encodeURIComponent(query)}`;
};

const getBraveOffset = (url: URL): number =>
  Number(url.searchParams.get('offset') ?? 0) || 0;

/**
 * URL of the previous or next results page, or null when there is none or
 * the tab is not paginated.
 */
export const getPaginationUrl = (
  doc: Document,
  location: Location,
  pageType: PageType,
  direction: 'previous' | 'next'
): string | null => {
  const tab = getSearchTabType(pageType);
  if (isBravePageType(pageType)) {
    if (tab === 'image') return null;
    // Brave renders "Previous"/"Next" as links, or on the News tab as
    // buttons carrying an href. Labels are localized, so tell them apart by
    // the offset (page index) instead.
    const currentUrl = new URL(location.href);
    const currentOffset = getBraveOffset(currentUrl);
    const target = Array.from(doc.querySelectorAll('.pagination [href]'))
      .map((el) => new URL(el.getAttribute('href') ?? '', currentUrl.origin))
      .find((url) =>
        direction === 'next'
          ? getBraveOffset(url) > currentOffset
          : getBraveOffset(url) < currentOffset
      );
    return target?.href ?? null;
  }
  if (tab === null || tab === 'image') return null;
  const link = doc.querySelector(direction === 'next' ? '#pnnext' : '#pnprev');
  return link instanceof HTMLAnchorElement && link.href ? link.href : null;
};
