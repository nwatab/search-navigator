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

const collectSingleHeadings = (
  tabType: 'all' | 'image' | 'videos' | 'shopping' | 'news',
  el: Element
): HTMLDivElement[] =>
  getVisibleDivs(el).flatMap((div) => {
    const selector = tabType === 'news' ? 'div[role="heading"]' : 'h3';
    const headings = div.querySelectorAll(selector);
    return headings.length === 1
      ? [div] // leaf match
      : headings.length > 1
        ? collectSingleHeadings(tabType, div) // dig deeper
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

  return collectSingleHeadings(tabType, root);
};
