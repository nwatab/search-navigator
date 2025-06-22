import { JSDOM } from 'jsdom';
import path from 'path';
import { getGoogleSearchResults } from '../src/services';

describe('get Google search results', () => {
  it('get results on all tab for query "quantum field theory"', async () => {
    const htmlPath = path.join(__dirname, '/htmls/20250525_all_tokyo_9.html');
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('all', dom.window.document);
    expect(results.length).toBe(9);
  });
  it('get results on all tab for query "github closes comment pr"', async () => {
    const htmlPath = path.join(__dirname, '/htmls/20250529_all_tokyo_10.html');
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('all', dom.window.document);
    expect(results.length).toBe(10);
  });
  it('get results on all tab for query "場の量子論"', async () => {
    const htmlPath = path.join(__dirname, '/htmls/20250529_all_tokyo_8.html');
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('image', dom.window.document);
    expect(results.length).toBe(8);
  });
  it('get image results for query "château-chalon"', async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250614-image-château-chalon-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('image', dom.window.document);
    expect(results.length).toBe(201);
  });

  it('get news results for query "Schloss Johannisberg"', async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250615-news-schloss-johannisberg-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('news', dom.window.document);
    expect(results.length).toBe(10);
  });
  it('get video results for query "J. Brahms Piano Concerto No.2"', async () => {
    const htmlPath = path.join(
      __dirname,
      '/htmls/20250615-video-j.brahms-piano-concerto-no.2-tokyo.html'
    );
    const dom = await JSDOM.fromFile(htmlPath);
    const results = getGoogleSearchResults('videos', dom.window.document);
    expect(results.length).toBe(10);
  });
});
