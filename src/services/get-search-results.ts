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
export type BraveSearchTabType = 'all' | 'image' | 'videos' | 'news';
export type BravePageType = `brave-${BraveSearchTabType}`;
export type PageType =
  | GoogleSearchTabType
  | BravePageType
  | 'youtube-search-result';

export const isBravePageType = (
  pageType: PageType
): pageType is BravePageType => pageType.startsWith('brave-');

export const toBraveSearchTabType = (
  pageType: BravePageType
): BraveSearchTabType => pageType.slice('brave-'.length) as BraveSearchTabType;

export function getSearchRootSelector(pageType: PageType): string {
  if (pageType === 'brave-image') {
    return '.images-layout';
  }
  if (isBravePageType(pageType)) {
    return '#mixed-main';
  }
  if (pageType === 'youtube-search-result') {
    // Many YouTube elements share id="contents"; scope to the search page
    // container so we don't match an unrelated node (issue #73).
    return 'ytd-search #contents';
  }
  return '#rso, #search';
}

function getSearchRoots(
  pageType: GoogleSearchTabType | 'youtube-search-result',
  doc: Document
): HTMLDivElement[] {
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
  /** Mixes, playlists and courses, all rendered as yt-lockup-view-model. */
  playlists?: boolean;
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
  const { shorts = false, playlists = false, ads = false } = options;

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
  if (playlists) {
    // Select the host element: the inner
    // .yt-lockup-view-model-wiz--collection-stack-2 classes it used to be
    // matched by were removed from YouTube's DOM, which made mixes,
    // playlists and courses unselectable.
    selectors.push('yt-lockup-view-model');
  }

  const combinedSelector = selectors.join(',');

  // Scope the query to the search results container: YouTube keeps DOM of
  // previously visited pages around, and a document-wide query could pick up
  // renderers from those hidden pages (issue #73).
  const root = doc.querySelector('ytd-search #contents') ?? doc;
  const elements = root.querySelectorAll(combinedSelector);
  return Array.from(elements) as HTMLDivElement[];
};

export const getBraveSearchResults = (
  tabType: BraveSearchTabType,
  doc: Document = document
): HTMLDivElement[] => {
  if (tabType === 'image') {
    // Image results are <button>s that open Brave's preview panel. The
    // "Find elsewhere" tile shares the class but is a <div>.
    return Array.from(
      doc.querySelectorAll<HTMLDivElement>('.images-layout button.image-result')
    );
  }
  // Web, video and news results (and clusters such as "Videos" on the web
  // tab) are rendered as .snippet[data-type]. Non-result blocks in the same
  // column (FAQ, related queries, pagination) have no data-type.
  return Array.from(
    doc.querySelectorAll<HTMLDivElement>('#mixed-main .snippet[data-type]')
  );
};

export const getSearchResults = (
  doc: Document,
  pageType: PageType
): HTMLDivElement[] => {
  if (isBravePageType(pageType)) {
    return getBraveSearchResults(toBraveSearchTabType(pageType), doc);
  }
  if (pageType === 'youtube-search-result') {
    return getYouTubeSearchResults(doc, {
      shorts: false,
      ads: false,
      playlists: true,
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
