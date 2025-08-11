// Highlight utilities
import { ClassModifier } from './dom-utils';

/**
 * Helper function to find and click accordion elements in "People also ask" sections
 */
export const clickPeopleAlsoAskAccordion = (
  element: HTMLElement,
  expanded?: boolean
): void => {
  const relatedQuestionPair = element.querySelector('.related-question-pair');
  if (!relatedQuestionPair) return;

  const selector =
    expanded !== undefined
      ? `div[jsname][jsaction][role="button"][aria-expanded="${expanded}"]`
      : 'div[jsname][jsaction][role="button"][aria-expanded]';

  const accordionElement = element.querySelector(selector);
  if (accordionElement) {
    accordionElement.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );
  }
};

/**
 * Helper function to simulate YouTube thumbnail hover
 */
export const simulateYouTubeHover = (
  element: HTMLElement,
  eventType: 'mouseenter' | 'mouseleave'
): void => {
  const thumbEl = element.querySelector<HTMLElement>('ytd-thumbnail');
  if (thumbEl) {
    thumbEl.dispatchEvent(
      new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );
  }
};

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
