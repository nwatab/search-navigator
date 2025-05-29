// Google search result selectors
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
 * Return an array of ELEMENT_NODE DIV children
 * that are visible (not display:none, not aria-hidden="true").
 */
function getVisibleDivs(el: Element): HTMLDivElement[] {
  return Array.from(el.children).filter((child): child is HTMLDivElement => {
    if (child.tagName !== 'DIV') return false;
    // Only treat inline style="display: none" or aria-hidden="true" as hidden:
    const inlineStyle = child.getAttribute('style') || '';
    const isHiddenStyle = /\bdisplay\s*:\s*none\b/.test(inlineStyle);
    const isAriaHidden = child.getAttribute('aria-hidden') === 'true';
    return !isHiddenStyle && !isAriaHidden;
  });
}

/**
 * Drill down as long as there is exactly one visible DIV child.
 * Purely recursive, no mutation.
 * @param {HTMLDivElement} el
 * @returns {HTMLDivElement}
 */
function drillSingleVisibleDiv(el: HTMLDivElement): HTMLDivElement {
  const visibleDivs = getVisibleDivs(el);
  const [onlyChild] = visibleDivs;
  return onlyChild && visibleDivs.length === 1
    ? drillSingleVisibleDiv(onlyChild)
    : el;
}

/**
 * Return value should have at least one element, but it may fall back to an empty array if none are found
 */
export const getGoogleSearchResults = (
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news',
  doc: Document = document
): HTMLDivElement[] => {
  // getElementById('serach') then, narrow down div elements while it has only one dive elements.

  const searchRoot = (doc.getElementById('rso') ??
    doc.getElementById('search')) as HTMLDivElement | null;
  if (!searchRoot) {
    console.warn('No search root found in the document.');
    return [];
  }

  const divLeaf = drillSingleVisibleDiv(searchRoot);
  const divElementsThatContainsH3 = Array.from(divLeaf.children).filter(
    (el): el is HTMLDivElement =>
      el.tagName.toLowerCase() === 'div' && el.querySelector('h3') !== null
  );
  return divElementsThatContainsH3;
};
