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

export function getGoogleSearchResultsWithDivG(): HTMLElement[] {
  return Array.from(document.querySelectorAll('div.g'));
}

export function getGoogleSearchResultsWithH3(tabType: 'all' | 'image') {
  const searchRoot = document.getElementById('search');
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

export const getGoogleSearchResults = (
  tabType: 'all' | 'image'
): HTMLElement[] => {
  const resultsDivG = getGoogleSearchResultsWithDivG();
  if (resultsDivG.length > 0) {
    return resultsDivG;
  }
  const resultsH3 = getGoogleSearchResultsWithH3(tabType);
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
  location: Location
): 'all' | 'image' | null {
  const searchParams = new URLSearchParams(location.search);
  const udm = searchParams.get('udm');
  switch (udm) {
    case null:
      return 'all';
    case '2':
      return 'image';
    default:
      return null;
  }
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
