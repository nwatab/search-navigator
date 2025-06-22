import {
  addClass,
  removeClass,
  scrollIntoViewIfOutsideViewport,
} from '../src/services/dom-utils';

describe('addClass', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = document.getElementById('test')!;
  });

  it('should add class to element', () => {
    const result = addClass(element, 'test-class');

    expect(element.classList.contains('test-class')).toBe(true);
    expect(result).toBe(element);
  });
});

describe('removeClass', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="test" class="test-class another-class"></div>';
    element = document.getElementById('test')!;
  });

  it('should remove class from element', () => {
    const result = removeClass(element, 'test-class');

    expect(element.classList.contains('test-class')).toBe(false);
    expect(element.classList.contains('another-class')).toBe(true);
    expect(result).toBe(element);
  });

  it('should handle removing non-existent class', () => {
    removeClass(element, 'non-existent-class');

    expect(element.classList.contains('test-class')).toBe(true);
    expect(element.classList.contains('another-class')).toBe(true);
  });
});

describe('scrollIntoViewIfOutsideViewport', () => {
  let element: HTMLElement;
  let mockScrollIntoView: jest.Mock;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = document.getElementById('test')!;
    mockScrollIntoView = jest.fn();
    element.scrollIntoView = mockScrollIntoView;

    element.getBoundingClientRect = jest.fn();

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    });
  });

  it('should scroll element into view when above viewport', () => {
    (element.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: -50,
      bottom: 0,
    });

    const result = scrollIntoViewIfOutsideViewport(element);

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
    });
    expect(result).toBe(element);
  });

  it('should scroll element into view when below viewport', () => {
    (element.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: 850,
      bottom: 900,
    });

    scrollIntoViewIfOutsideViewport(element);

    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it('should not scroll element when within viewport', () => {
    (element.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: 100,
      bottom: 200,
    });

    const result = scrollIntoViewIfOutsideViewport(element);

    expect(mockScrollIntoView).not.toHaveBeenCalled();
    expect(result).toBe(element);
  });
});
