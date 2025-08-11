// filepath: /Users/n/work/search-navigator/__tests__/highlight.test.ts
import {
  makeHighlight,
  makeUnhighlight,
} from '../src/services/element-highlighting';
import { scrollIntoViewIfOutsideViewport } from '../src/services/dom-utils';

// Mock scrollIntoViewIfOutsideViewport function
jest.mock('../src/services/dom-utils', () => ({
  scrollIntoViewIfOutsideViewport: jest.fn().mockImplementation((el) => el),
}));

describe('makeHighlight', () => {
  let addClass: jest.Mock;
  let simulateYouTubeHover: jest.Mock;
  let highlight: ReturnType<typeof makeHighlight>;
  let results: HTMLElement[];

  beforeEach(() => {
    addClass = jest.fn();
    simulateYouTubeHover = jest.fn();
    highlight = makeHighlight(
      addClass,
      scrollIntoViewIfOutsideViewport,
      simulateYouTubeHover
    );

    // Setup DOM elements
    document.body.innerHTML = '';
    results = Array.from({ length: 3 }).map((_, i) => {
      const div = document.createElement('div');
      div.id = `result-${i}`;
      document.body.appendChild(div);
      return div;
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should add the correct highlight class', () => {
    highlight(results, 1, 'light');

    expect(addClass).toHaveBeenCalledTimes(1);
    expect(addClass).toHaveBeenCalledWith(results[1], 'sn-selected-light');
  });

  it('should add the dark theme class when specified', () => {
    highlight(results, 0, 'dark');

    expect(addClass).toHaveBeenCalledTimes(1);
    expect(addClass).toHaveBeenCalledWith(results[0], 'sn-selected-dark');
  });

  it('should scroll the element into view by default', () => {
    highlight(results, 1, 'light');

    expect(scrollIntoViewIfOutsideViewport).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewIfOutsideViewport).toHaveBeenCalledWith(results[1]);
  });

  it('should not scroll the element into view when scrollIntoView is false', () => {
    highlight(results, 1, 'light', { scrollIntoView: false });

    expect(scrollIntoViewIfOutsideViewport).not.toHaveBeenCalled();
  });

  it('should throw an error for invalid index', () => {
    expect(() => highlight(results, -1, 'light')).toThrow('Invalid index');
    expect(() => highlight(results, 3, 'light')).toThrow('Invalid index');
  });
});

describe('makeUnhighlight', () => {
  let removeClass: jest.Mock;
  let simulateYouTubeHover: jest.Mock;
  let unhighlight: ReturnType<typeof makeUnhighlight>;
  let results: HTMLElement[];

  beforeEach(() => {
    removeClass = jest.fn();
    simulateYouTubeHover = jest.fn();
    unhighlight = makeUnhighlight(removeClass, simulateYouTubeHover);

    // Setup DOM elements
    document.body.innerHTML = '';
    results = Array.from({ length: 3 }).map((_, i) => {
      const div = document.createElement('div');
      div.id = `result-${i}`;
      document.body.appendChild(div);
      return div;
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should remove both light and dark highlight classes', () => {
    unhighlight(results, 1);

    expect(removeClass).toHaveBeenCalledTimes(2);
    expect(removeClass).toHaveBeenCalledWith(results[1], 'sn-selected-dark');
    expect(removeClass).toHaveBeenCalledWith(results[1], 'sn-selected-light');
  });

  it('should not collapse expanded related questions (keep them open)', () => {
    // Setup related question element
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="related-question-pair">
        <div jsname="test" jsaction="test" role="button" aria-expanded="true"></div>
      </div>
    `;
    document.body.appendChild(div);
    results = [div];

    // Mock dispatchEvent
    const mockDispatchEvent = jest.fn();
    const accordionElement = div.querySelector('[jsname][role="button"]');
    if (accordionElement) {
      accordionElement.dispatchEvent = mockDispatchEvent;
    }

    unhighlight(results, 0);

    // The accordion should NOT be collapsed (no click event dispatched)
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });

  it('should not collapse if no expanded related questions', () => {
    // Setup element without related question pair
    const div = document.createElement('div');
    document.body.appendChild(div);
    results = [div];

    unhighlight(results, 0);

    // Just asserting that it doesn't throw an error
    expect(removeClass).toHaveBeenCalledTimes(2);
  });

  it('should throw an error for invalid index', () => {
    expect(() => unhighlight(results, -1)).toThrow('Invalid index');
    expect(() => unhighlight(results, 3)).toThrow('Invalid index');
  });
});
