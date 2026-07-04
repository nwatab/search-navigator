import { waitForSelector } from './dom-utils';

/**
 * Return an array of visible children (not display:none, not aria-hidden="true").
 */
const getVisibleElements = (el: Element): Element[] =>
  Array.from(el.children).filter((child): child is Element => {
    const style = child.getAttribute('style') || '';
    const isHiddenStyle = /\bdisplay\s*:\s*none\b/.test(style);
    const isAriaHidden = child.getAttribute('aria-hidden') === 'true';
    return !isHiddenStyle && !isAriaHidden;
  });

const collectSingleHeadingsForGoogle = (
  searchRootEl: Element,
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news'
): HTMLDivElement[] => {
  return getVisibleElements(searchRootEl).flatMap((el) => {
    const selector = tabType === 'news' ? 'div div[role="heading"]' : 'div h3';
    const headings = el.querySelectorAll(selector);
    if (headings.length === 0) {
      return []; // skip if no headings found
    }
    if (headings.length === 1) {
      return [el as HTMLDivElement]; // leaf match
    }
    return collectSingleHeadingsForGoogle(el, tabType); // dig deeper
  });
};

export type GoogleSearchTabType =
  | 'all'
  | 'image'
  | 'videos'
  | 'shopping'
  | 'news';
export type PageType = GoogleSearchTabType | 'youtube-search-result';

export function getSearchRootSelector(pageType: PageType): string {
  if (pageType === 'youtube-search-result') {
    // Many YouTube elements share id="contents"; scope to the search page
    // container so we don't match an unrelated node (issue #73).
    return 'ytd-search #contents';
  }
  return '#rso, #search';
}

function getSearchRoots(pageType: PageType, doc: Document): HTMLDivElement[] {
  if (pageType === 'youtube-search-result') {
    return [doc.querySelector('ytd-search #contents')].filter(
      (el): el is HTMLDivElement => el !== null
    );
  }
  const roots = [doc.getElementById('rso') ?? doc.getElementById('search')];
  if (pageType === 'all') {
    // On the "All" tab, infinite scroll appends extra results inside
    // #botstuff, outside #rso/#search (issue #76).
    roots.push(doc.getElementById('botstuff'));
  }
  return roots.filter((el): el is HTMLDivElement => el !== null);
}

export interface YouTubeSearchOptions {
  shorts?: boolean;
  mix?: boolean;
  ads?: boolean;
}

export const getGoogleSearchResults = (
  tabType: GoogleSearchTabType,
  doc: Document = document
): HTMLDivElement[] => {
  const roots = getSearchRoots(tabType, doc);

  if (roots.length === 0) {
    throw new Error('No search root found in the document.');
  }

  return roots.flatMap((root) => collectSingleHeadingsForGoogle(root, tabType));
};

export const getYouTubeSearchResults = (
  doc: Document,
  options: YouTubeSearchOptions = {}
): HTMLDivElement[] => {
  const { shorts = false, mix = false, ads = false } = options;

  // Build a single selector based on options
  const selectors: string[] = ['ytd-video-renderer'];
  if (ads) {
    selectors.push('ytd-ad-slot-renderer');
  }
  if (shorts) {
    selectors.push(
      'ytm-shorts-lockup-view-model-v2.shortsLockupViewModelHost.yt-horizontal-list-renderer'
    );
  }
  if (mix) {
    selectors.push(
      '.yt-lockup-view-model-wiz.yt-lockup-view-model-wiz--horizontal.yt-lockup-view-model-wiz--collection-stack-2'
    );
  }

  const combinedSelector = selectors.join(',');

  // Scope the query to the search results container: YouTube keeps DOM of
  // previously visited pages around, and a document-wide query could pick up
  // renderers from those hidden pages (issue #73).
  const root = doc.querySelector('ytd-search #contents') ?? doc;
  const elements = root.querySelectorAll(combinedSelector);
  return Array.from(elements) as HTMLDivElement[];
};

export const getSearchResults = (
  doc: Document,
  pageType: PageType
): HTMLDivElement[] => {
  if (pageType === 'youtube-search-result') {
    return getYouTubeSearchResults(doc, {
      shorts: false,
      ads: false,
      mix: true,
    });
  }
  return getGoogleSearchResults(pageType, doc);
};

export const waitForSearchRoot = async (
  doc: Document = document,
  pageType: PageType,
  timeout = 5_000
): Promise<HTMLDivElement> => {
  const selector = getSearchRootSelector(pageType);
  const el = await waitForSelector(doc, selector, timeout);
  return el as HTMLDivElement;
};
