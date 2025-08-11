// Element highlighting utilities
import type { ClassModifier } from './dom-utils';

/**
 * Creates a function that highlights an element at the specified index
 */
export const makeHighlight =
  (
    addClass: ClassModifier,
    scrollIntoViewIfOutsideViewport: (el: Element) => Element,
    simulateYouTubeHover: (
      element: HTMLElement,
      eventType: 'mouseenter' | 'mouseleave'
    ) => void
  ) =>
  (
    results: HTMLElement[],
    index: number,
    theme: 'dark' | 'light',
    options: {
      scrollIntoView?: boolean;
      simulateHover?: boolean;
    } = { scrollIntoView: true, simulateHover: true }
  ): void => {
    const className = `sn-selected-${theme}`;
    if (typeof index !== 'number' || index < 0 || index >= results.length) {
      throw new Error('Invalid index provided for highlight');
    }
    const result = results[index];
    addClass(result, className);

    // Scroll element into view if needed
    if (options.scrollIntoView) {
      scrollIntoViewIfOutsideViewport(results[index]);
    }

    if (options.simulateHover) {
      simulateYouTubeHover(result, 'mouseenter');
    }
  };

/**
 * Creates a function that removes highlights from elements
 * If index is provided, only unhighlights that specific element
 * If index is omitted, unhighlights all elements
 */
export const makeUnhighlight =
  (
    removeClass: ClassModifier,
    simulateYouTubeHover: (
      element: HTMLElement,
      eventType: 'mouseenter' | 'mouseleave'
    ) => void
  ) =>
  (
    results: HTMLElement[],
    index: number,
    options: {
      simulateHover?: boolean;
    } = { simulateHover: true }
  ): void => {
    // throw invalid index
    if (typeof index === 'number' && (index < 0 || index >= results.length)) {
      throw new Error('Invalid index provided for unhighlight');
    }

    // Unhighlight specific element
    const result = results[index];
    removeClass(result, 'sn-selected-dark');
    removeClass(result, 'sn-selected-light');

    // Collapse expanded accordion if present

    if (options.simulateHover) {
      simulateYouTubeHover(result, 'mouseleave');
    }
  };
