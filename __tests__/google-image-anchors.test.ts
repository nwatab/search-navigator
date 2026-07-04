import { JSDOM } from 'jsdom';
import path from 'path';
import {
  getGoogleImageResultAnchors,
  getGoogleSearchResults,
} from '../src/services';

describe('get Google image result anchors', () => {
  let results: HTMLDivElement[];

  beforeAll(async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250614-image-château-chalon-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    results = getGoogleSearchResults('image', dom.window.document);
  });

  it('finds a thumbnail anchor and an external source anchor on the first result', () => {
    const { thumbnail, source } = getGoogleImageResultAnchors(results[0]);
    expect(thumbnail).not.toBeNull();
    expect(thumbnail?.getAttribute('href') ?? '').toBe('');
    expect(thumbnail?.querySelector('img')).not.toBeNull();
    expect(source?.getAttribute('href')).toMatch(/^https:\/\//);
  });

  it('finds thumbnail and source anchors on every result', () => {
    const missing = results.filter((result) => {
      const { thumbnail, source } = getGoogleImageResultAnchors(result);
      return thumbnail === null || source === null;
    });
    expect(missing.length).toBe(0);
  });
});
