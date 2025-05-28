// side effects
export type ExtractBodyBackgroundRgb = (
  window: Window & typeof globalThis,
  document: Document
) => [number, number, number] | null;
export const extractBodyBackgroundRgb: ExtractBodyBackgroundRgb = (
  window,
  document
) => {
  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const rgbValues = bgColor.match(/\d+/g)?.map(Number);
  if (!rgbValues || rgbValues.length < 3) return null;
  return [rgbValues[0], rgbValues[1], rgbValues[2]];
};
export type ClassModifier = (el: Element, className: string) => Element;
export const addClass: ClassModifier = (el, className) => {
  el.classList.add(className);
  return el;
};
export const removeClass: ClassModifier = (el, className) => {
  el.classList.remove(className);
  return el;
};

export const scrollIntoViewIfOutsideViewport = (el: Element) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
  return el;
};

export function getGoogleSearchResultsWithDivG(
  doc: Document = document
): HTMLElement[] {
  return Array.from(doc.querySelectorAll('div.g'));
}

export function getGoogleSearchResultsWithH3(
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news',
  doc: Document = document
) {
  const searchRoot = doc.getElementById('search');
  if (!searchRoot) return [];

  const h3Elements = Array.from(searchRoot.getElementsByTagName('h3'));

  const getAncestor = (element: HTMLElement, levels: number) => {
    let current: HTMLElement | null = element;
    for (let i = 0; i < levels; i++) {
      current = current?.parentElement || current;
    }
    return current;
  };
  // magic numbers depending on actual DOM structure
  const levels = tabType === 'all' ? 9 : 2;
  return [...new Set(h3Elements.map((h3) => getAncestor(h3, levels)))];
}

/**
 * Return value should have at least one element, but it may fall back to an empty array if none are found
 */
export const getGoogleSearchResults = (
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news',
  doc: Document = document
): HTMLElement[] => {
  const resultsDivG = getGoogleSearchResultsWithDivG(doc);
  if (resultsDivG.length > 0) {
    return resultsDivG;
  }
  const resultsH3 = getGoogleSearchResultsWithH3(tabType, doc);
  if (resultsH3.length > 0) {
    return resultsH3;
  }
  return [];
};

// business logic pure functions
export function determineThemeFromRgb(
  rgb: [number, number, number],
  brightnessThreshold: number = 128
): 'light' | 'dark' {
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000 < brightnessThreshold
    ? 'dark'
    : 'light';
}

export function getGoogleSearchTabType(
  urlSearchParams: URLSearchParams
): 'all' | 'image' | 'videos' | 'shopping' | 'news' | null {
  const udm = urlSearchParams.get('udm');
  const tbm = urlSearchParams.get('tbm');
  const q = urlSearchParams.get('q');
  if (q === null) {
    console.warn('No search query found in URL parameters.');
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

export const makeHighlight =
  ({
    addClass,
    removeClass,
  }: {
    addClass: ClassModifier;
    removeClass: ClassModifier;
  }) =>
  (results: HTMLElement[], index: number, theme: 'dark' | 'light'): void => {
    const className = `sn-selected-${theme}`;
    results.forEach((el) => {
      removeClass(el, 'sn-selected-dark');
      removeClass(el, 'sn-selected-light');
    });

    if (index >= 0 && index < results.length) {
      addClass(results[index], className);
    }
  };
