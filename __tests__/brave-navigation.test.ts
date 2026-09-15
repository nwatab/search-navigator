import { JSDOM } from 'jsdom';
import {
  getBraveSearchTabType,
  getPageType,
  getPaginationUrl,
  getSearchTabType,
  getSearchTabUrl,
} from '../src/services';

const asLocation = (href: string): Location =>
  new URL(href) as unknown as Location;

describe('getBraveSearchTabType', () => {
  it.each([
    ['https://search.brave.com/search?q=tokyo', 'all'],
    ['https://search.brave.com/images?q=tokyo', 'image'],
    ['https://search.brave.com/videos?q=tokyo', 'videos'],
    ['https://search.brave.com/news?q=tokyo&offset=1', 'news'],
  ])('%s → %s', (href, expected) => {
    expect(getBraveSearchTabType(new URL(href))).toBe(expected);
  });

  it('returns null without a query', () => {
    expect(
      getBraveSearchTabType(new URL('https://search.brave.com/search'))
    ).toBeNull();
  });

  it('returns null for unsupported tabs', () => {
    expect(
      getBraveSearchTabType(new URL('https://search.brave.com/ask?q=tokyo'))
    ).toBeNull();
  });
});

describe('getPageType on Brave Search', () => {
  it('prefixes the tab type with "brave-"', () => {
    expect(
      getPageType(asLocation('https://search.brave.com/videos?q=tokyo'))
    ).toBe('brave-videos');
  });

  it('throws for pages that are not search results', () => {
    expect(() =>
      getPageType(asLocation('https://search.brave.com/settings'))
    ).toThrow();
  });
});

describe('getSearchTabType', () => {
  it('maps Brave and Google page types to the same tab names', () => {
    expect(getSearchTabType('brave-image')).toBe('image');
    expect(getSearchTabType('image')).toBe('image');
    expect(getSearchTabType('youtube-search-result')).toBeNull();
  });
});

describe('getSearchTabUrl', () => {
  it('stays on Brave Search when switching tabs from Brave', () => {
    expect(getSearchTabUrl('brave-all', 'image', 'tokyo tower')).toBe(
      'https://search.brave.com/images?q=tokyo%20tower'
    );
    expect(getSearchTabUrl('brave-image', 'all', 'tokyo')).toBe(
      'https://search.brave.com/search?q=tokyo'
    );
    expect(getSearchTabUrl('brave-all', 'videos', 'tokyo')).toBe(
      'https://search.brave.com/videos?q=tokyo'
    );
    expect(getSearchTabUrl('brave-all', 'news', 'tokyo')).toBe(
      'https://search.brave.com/news?q=tokyo'
    );
  });

  it('returns null for Shopping on Brave, which has no such tab', () => {
    expect(getSearchTabUrl('brave-all', 'shopping', 'tokyo')).toBeNull();
  });

  it('keeps the Google URLs for Google pages', () => {
    expect(getSearchTabUrl('all', 'image', 'tokyo')).toBe(
      'https://www.google.com/search?tbm=isch&q=tokyo'
    );
    expect(getSearchTabUrl('image', 'all', 'tokyo')).toBe(
      'https://www.google.com/search?q=tokyo'
    );
    expect(getSearchTabUrl('all', 'shopping', 'tokyo')).toBe(
      'https://www.google.com/search?tbm=shop&q=tokyo'
    );
  });

  it('goes to the engine home page for "all" without a query', () => {
    expect(getSearchTabUrl('brave-all', 'all', null)).toBe(
      'https://search.brave.com'
    );
    expect(getSearchTabUrl('youtube-search-result', 'all', null)).toBe(
      'https://www.google.com'
    );
    expect(getSearchTabUrl('brave-all', 'image', null)).toBeNull();
  });
});

describe('getPaginationUrl on Brave Search', () => {
  const docWith = (html: string): Document =>
    new JSDOM(`<div class="pagination">${html}</div>`).window.document;

  const PREVIOUS_AND_NEXT = docWith(`
    <a href="/search?q=tokyo&amp;offset=1&amp;spellcheck=0">Previous</a>
    <a href="/search?q=tokyo&amp;offset=3&amp;spellcheck=0">Next</a>
  `);
  const PAGE_3 = asLocation('https://search.brave.com/search?q=tokyo&offset=2');

  it('finds the next page by offset, not by label', () => {
    expect(
      getPaginationUrl(PREVIOUS_AND_NEXT, PAGE_3, 'brave-all', 'next')
    ).toBe('https://search.brave.com/search?q=tokyo&offset=3&spellcheck=0');
  });

  it('finds the previous page by offset', () => {
    expect(
      getPaginationUrl(PREVIOUS_AND_NEXT, PAGE_3, 'brave-all', 'previous')
    ).toBe('https://search.brave.com/search?q=tokyo&offset=1&spellcheck=0');
  });

  it('treats a missing offset as the first page', () => {
    const doc = docWith(
      '<a href="/search?q=tokyo&amp;offset=1&amp;spellcheck=0">Next</a>'
    );
    const firstPage = asLocation('https://search.brave.com/search?q=tokyo');
    expect(
      getPaginationUrl(doc, firstPage, 'brave-all', 'previous')
    ).toBeNull();
    expect(getPaginationUrl(doc, firstPage, 'brave-all', 'next')).toBe(
      'https://search.brave.com/search?q=tokyo&offset=1&spellcheck=0'
    );
  });

  it('follows the href of the News tab "Next" button', () => {
    const doc = docWith(
      '<button href="/news?q=tokyo&amp;offset=1&amp;spellcheck=0">Next</button>'
    );
    expect(
      getPaginationUrl(
        doc,
        asLocation('https://search.brave.com/news?q=tokyo'),
        'brave-news',
        'next'
      )
    ).toBe('https://search.brave.com/news?q=tokyo&offset=1&spellcheck=0');
  });

  it('does not paginate the image tab', () => {
    expect(
      getPaginationUrl(PREVIOUS_AND_NEXT, PAGE_3, 'brave-image', 'next')
    ).toBeNull();
  });
});
