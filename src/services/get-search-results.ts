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

function getSearchRoot(
  pageType:
    | 'all'
    | 'image'
    | 'videos'
    | 'shopping'
    | 'news'
    | 'youtube-search-result',
  doc: Document
): HTMLDivElement | null {
  if (pageType === 'youtube-search-result') {
    return doc.getElementById('contents') as HTMLDivElement | null;
  }
  return (doc.getElementById('rso') ??
    doc.getElementById('search')) as HTMLDivElement | null;
}

export interface YouTubeSearchOptions {
  shorts?: boolean;
  mix?: boolean;
  ads?: boolean;
}

export const getGoogleSearchResults = (
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news',
  doc: Document = document
): HTMLDivElement[] => {
  const root = getSearchRoot(tabType, doc);

  if (!root) {
    console.warn('No search root found in the document.');
    return [];
  }

  return collectSingleHeadingsForGoogle(root, tabType);
};

export const getYouTubeSearchResults = (
  doc: Document = document,
  options: YouTubeSearchOptions = {}
): HTMLDivElement[] => {
  const root = getSearchRoot('youtube-search-result', doc);
  if (!root) {
    console.warn('No search root found in the document.');
    return [];
  }

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

  // Single DOM query
  const elements = root.querySelectorAll(combinedSelector);
  return Array.from(elements) as HTMLDivElement[];
};
