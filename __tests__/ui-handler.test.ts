import { JSDOM } from 'jsdom';
import path from 'path';
import {
  getGoogleSearchResults,
  getGoogleSearchTabType,
} from '../src/ui-handler';

describe('ui-handler', () => {
  it('get results on all tab', async () => {
    const htmlPath = path.join(__dirname, '/htmls/20250525_all_ja_9.html');
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('all', dom.window.document);
    expect(results.length).toBe(9);
  });
});

describe('getGoogleSearchTabType', () => {
  it('should return null when no search query is present', () => {
    const urlSearchParams = new URLSearchParams('');
    expect(getGoogleSearchTabType(urlSearchParams)).toBeNull();
  });
  it('should return "all" for all tab', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('all');
  });
  it('should return "image" for image tab', () => {
    const urlSearchParams = new URLSearchParams(
      'q=dummy+search+query&tbm=isch'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('image');
  });
  it('should return "videos" for videos tab', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&udm=7');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('videos');
  });
  it('should return "news" for news tab', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&tbm=nws');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('news');
  });
  it('should return "shopping" for shopping tab', () => {
    const urlSearchParams = new URLSearchParams(
      'q=dummy+search+query&tbm=shop'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('shopping');
  });
});
