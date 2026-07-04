import { highlight, unhighlight } from '../src/services/element-highlighting';
import { scrollIntoViewIfOutsideViewport } from '../src/services/dom-utils';

// Mock only the viewport-dependent scrolling; jsdom has no layout, so the
// real implementation could never report an element as outside the viewport.
jest.mock('../src/services/dom-utils', () => ({
  ...jest.requireActual('../src/services/dom-utils'),
  scrollIntoViewIfOutsideViewport: jest.fn().mockImplementation((el) => el),
}));

const createResults = (count: number): HTMLElement[] => {
  document.body.innerHTML = '';
  return Array.from({ length: count }).map((_, i) => {
    const div = document.createElement('div');
    div.id = `result-${i}`;
    document.body.appendChild(div);
    return div;
  });
};

describe('highlight', () => {
  let results: HTMLElement[];

  beforeEach(() => {
    results = createResults(3);
    jest.clearAllMocks();
  });

  it('should add the correct highlight class', () => {
    highlight(results, 1, 'light');

    expect(results[1].classList.contains('sn-selected-light')).toBe(true);
    expect(results[0].classList.contains('sn-selected-light')).toBe(false);
    expect(results[2].classList.contains('sn-selected-light')).toBe(false);
  });

  it('should add the dark theme class when specified', () => {
    highlight(results, 0, 'dark');

    expect(results[0].classList.contains('sn-selected-dark')).toBe(true);
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

describe('unhighlight', () => {
  let results: HTMLElement[];

  beforeEach(() => {
    results = createResults(3);
    jest.clearAllMocks();
  });

  it('should remove both light and dark highlight classes', () => {
    results[1].classList.add('sn-selected-light', 'sn-selected-dark');

    unhighlight(results, 1);

    expect(results[1].classList.contains('sn-selected-light')).toBe(false);
    expect(results[1].classList.contains('sn-selected-dark')).toBe(false);
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
    div.classList.add('sn-selected-light');
    document.body.appendChild(div);
    results = [div];

    unhighlight(results, 0);

    expect(div.classList.contains('sn-selected-light')).toBe(false);
  });

  it('should throw an error for invalid index', () => {
    expect(() => unhighlight(results, -1)).toThrow('Invalid index');
    expect(() => unhighlight(results, 3)).toThrow('Invalid index');
  });
});
