import { JSDOM } from 'jsdom';
import path from 'path';
import { getYouTubeSearchResults } from '../src/services';

describe('get YouTube search results', () => {
  let document: Document;

  beforeAll(async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250620-youtube-search-result-prokofiev-piano-concerto-3-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    document = dom.window.document;
  });

  it('get YouTube regular videos for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      mix: false,
      ads: false,
    });
    expect(results.length).toBe(61);
  });
  it('get YouTube regular videos and Ads for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      ads: true,
      shorts: false,
      mix: false,
    });
    expect(results.length).toBe(61 + 8);
  });
  it('get YouTube regular videos and Shorts for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: true,
      mix: false,
      ads: false,
    });
    expect(results.length).toBe(61 + 30);
  });
  it('get YouTube Mix/Playlist results for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      mix: true,
      ads: false,
    });
    expect(results.length).toBe(61 + 1);
  });
});
