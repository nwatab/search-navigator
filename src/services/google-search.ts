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
