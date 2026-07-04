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

  afterAll(() => {
    document = null as unknown as Document; // Clear the document reference
  });

  it('get YouTube regular videos for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      playlists: false,
      ads: false,
    });
    expect(results.length).toBe(61);
  });
  it('get YouTube regular videos and Ads for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      ads: true,
      shorts: false,
      playlists: false,
    });
    expect(results.length).toBe(61 + 8);
  });
  it('get YouTube regular videos and Shorts for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: true,
      playlists: false,
      ads: false,
    });
    expect(results.length).toBe(61 + 30);
  });
  it('get YouTube video and Mix/Playlist results for a query "prokofiev piano concerto 3"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      playlists: true,
      ads: false,
    });
    expect(results.length).toBe(61 + 1);
  });
});

describe('get YouTube search results including playlists and courses', () => {
  // Regression: playlists/courses are rendered as yt-lockup-view-model host
  // elements; the wiz classes the old selector relied on no longer exist.
  let document: Document;
  beforeAll(async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20260704-youtube-qft-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    document = dom.window.document;
  });
  afterAll(() => {
    document = null as unknown as Document;
  });
  it('get YouTube regular videos only for a query "qft"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      playlists: false,
      ads: false,
    });
    expect(results.length).toBe(15);
  });
  it('includes the course and playlist lockups for a query "qft"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      playlists: true,
      ads: false,
    });
    expect(results.length).toBe(15 + 2);
    const lockups = results.filter(
      (el) => el.tagName.toLowerCase() === 'yt-lockup-view-model'
    );
    expect(lockups.length).toBe(2);
    // Every result must contain a link so open_link keeps working.
    expect(results.every((el) => el.querySelector('a[href]'))).toBe(true);
  });
});

describe('get YouTube search results with shorts on the top', () => {
  let document: Document;
  beforeAll(async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250622-youtube-minecraft-best-shaders-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    document = dom.window.document;
  });
  afterAll(() => {
    document = null as unknown as Document; // Clear the document reference
  });
  it('get YouTube videos for a query "minecraft best shaders"', () => {
    const results = getYouTubeSearchResults(document, {
      shorts: false,
      playlists: false,
      ads: false,
    });
    expect(results.length).toBe(64);
  });
});
