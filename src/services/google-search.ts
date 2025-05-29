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
 * Return an array of visible DIV children (not display:none, not aria-hidden="true").
 */
const getVisibleDivs = (el: Element): HTMLDivElement[] =>
  Array.from(el.children).filter((child): child is HTMLDivElement => {
    if (child.tagName !== 'DIV') return false;
    const style = child.getAttribute('style') || '';
    const isHiddenStyle = /\bdisplay\s*:\s*none\b/.test(style);
    const isAriaHidden = child.getAttribute('aria-hidden') === 'true';
    return !isHiddenStyle && !isAriaHidden;
  });

/**
 * Recursively collect all visible DIVs under `el` that contain exactly one <h3>.
 * If a DIV contains >1 <h3>, dig into its children; if 0, skip.
 */
const collectSingleH3Divs = (el: Element): HTMLDivElement[] =>
  getVisibleDivs(el).flatMap((div) => {
    const h3s = div.querySelectorAll('h3');
    return h3s.length === 1
      ? [div] // leaf match
      : h3s.length > 1
        ? collectSingleH3Divs(div) // dig deeper
        : []; // skip
  });

export const getGoogleSearchResults = (
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news',
  doc: Document = document
): HTMLDivElement[] => {
  const root = (doc.getElementById('rso') ??
    doc.getElementById('search')) as HTMLDivElement | null;

  if (!root) {
    console.warn('No search root found in the document.');
    return [];
  }

  return collectSingleH3Divs(root);
};
