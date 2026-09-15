import { JSDOM } from 'jsdom';
import path from 'path';
import {
  getBraveImageSourceLink,
  getBraveSearchResults,
  getPaginationUrl,
} from '../src/services';

const loadFixture = async (name: string): Promise<Document> =>
  (await JSDOM.fromFile(path.join(__dirname, 'htmls', name))).window.document;

const asLocation = (href: string): Location =>
  new URL(href) as unknown as Location;

describe('get Brave search results', () => {
  it('gets web results and clusters on the All tab', async () => {
    const doc = await loadFixture('20260915-brave-all-tokyo.html');
    const results = getBraveSearchResults('all', doc);
    expect(results.length).toBe(21);
    expect(results.map((r) => r.getAttribute('data-type'))).toContain(
      'cluster'
    );
    expect(results[0].querySelector('a[href]')?.getAttribute('href')).toBe(
      'https://en.wikipedia.org/wiki/Tokyo'
    );
  });

  it('skips FAQ, related queries and pagination blocks', async () => {
    const doc = await loadFixture('20260915-brave-all-tokyo.html');
    const results = getBraveSearchResults('all', doc);
    expect(
      results.filter((r) =>
        ['faq', 'related-queries', 'pagination-snippet'].includes(r.id)
      )
    ).toHaveLength(0);
  });

  it('gets video results', async () => {
    const doc = await loadFixture('20260915-brave-videos-tokyo.html');
    expect(getBraveSearchResults('videos', doc).length).toBe(50);
  });

  it('gets news results', async () => {
    const doc = await loadFixture('20260915-brave-news-tokyo.html');
    expect(getBraveSearchResults('news', doc).length).toBe(35);
  });

  it('gets image results without the "Find elsewhere" tile', async () => {
    const doc = await loadFixture('20260915-brave-image-tokyo.html');
    const results = getBraveSearchResults('image', doc);
    expect(results.length).toBe(97);
    expect(
      results.filter((r) =>
        r.classList.contains('image-result-search-elsewhere')
      )
    ).toHaveLength(0);
  });

  it('gives every result a link to open', async () => {
    for (const [name, tab] of [
      ['20260915-brave-all-tokyo.html', 'all'],
      ['20260915-brave-videos-tokyo.html', 'videos'],
      ['20260915-brave-news-tokyo.html', 'news'],
    ] as const) {
      const doc = await loadFixture(name);
      const withoutLink = getBraveSearchResults(tab, doc).filter(
        (r) => !r.querySelector('a[href]')
      );
      expect(withoutLink).toHaveLength(0);
    }
  });
});

describe('Brave pagination in saved pages', () => {
  it('has only a next page on the first page', async () => {
    const doc = await loadFixture('20260915-brave-all-tokyo.html');
    const location = asLocation('https://search.brave.com/search?q=tokyo');
    expect(getPaginationUrl(doc, location, 'brave-all', 'previous')).toBeNull();
    expect(getPaginationUrl(doc, location, 'brave-all', 'next')).toBe(
      'https://search.brave.com/search?q=tokyo&offset=1&spellcheck=0'
    );
  });

  it('has previous and next pages on the second page', async () => {
    const doc = await loadFixture('20260915-brave-all-page2-tokyo.html');
    const location = asLocation(
      'https://search.brave.com/search?q=tokyo&offset=1'
    );
    expect(getPaginationUrl(doc, location, 'brave-all', 'previous')).toBe(
      'https://search.brave.com/search?q=tokyo&offset=0&spellcheck=0'
    );
    expect(getPaginationUrl(doc, location, 'brave-all', 'next')).toBe(
      'https://search.brave.com/search?q=tokyo&offset=2&spellcheck=0'
    );
  });

  it('follows the "Next" button on the News tab', async () => {
    const doc = await loadFixture('20260915-brave-news-tokyo.html');
    expect(
      getPaginationUrl(
        doc,
        asLocation('https://search.brave.com/news?q=tokyo'),
        'brave-news',
        'next'
      )
    ).toBe('https://search.brave.com/news?q=tokyo&offset=1&spellcheck=0');
  });
});

describe('getBraveImageSourceLink', () => {
  it('returns the source link of the result shown in the preview panel', async () => {
    const doc = await loadFixture('20260915-brave-image-preview-tokyo.html');
    const [first] = getBraveSearchResults('image', doc);
    expect(getBraveImageSourceLink(first, doc)?.getAttribute('href')).toMatch(
      /^https:\/\/www\.goodhousekeeping\.com\//
    );
  });

  it('returns null for a result the panel does not show', async () => {
    const doc = await loadFixture('20260915-brave-image-preview-tokyo.html');
    const [, second] = getBraveSearchResults('image', doc);
    expect(getBraveImageSourceLink(second, doc)).toBeNull();
  });

  it('returns null while the panel is closed', async () => {
    const doc = await loadFixture('20260915-brave-image-tokyo.html');
    const [first] = getBraveSearchResults('image', doc);
    expect(getBraveImageSourceLink(first, doc)).toBeNull();
  });
});
