// Highlight utilities
import { ClassModifier } from './dom-utils';

/**
 * Creates a function that highlights an element at the specified index
 */
export const makeHighlight =
  (
    addClass: ClassModifier,
    scrollIntoViewIfOutsideViewport: (el: Element) => Element
  ) =>
  (
    results: HTMLElement[],
    index: number,
    theme: 'dark' | 'light',
    options: {
      autoExpand?: boolean;
      scrollIntoView?: boolean;
      simulateHover?: boolean;
    } = { autoExpand: true, scrollIntoView: true, simulateHover: true }
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

    // Handle People also ask
    if (options.autoExpand) {
      const relatedQuestionPair = results[index].querySelector(
        '.related-question-pair'
      );
      const accordionClickElement = results[index].querySelector(
        'div[jsname][jsaction][role="button"][aria-expanded="false"]'
      );

      if (relatedQuestionPair && accordionClickElement) {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        accordionClickElement.dispatchEvent(clickEvent);
      }
    }
    if (options.simulateHover) {
      const thumbEl = result.querySelector<HTMLElement>('ytd-thumbnail');
      if (thumbEl) {
        thumbEl.dispatchEvent(
          new MouseEvent('mouseenter', {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      }
    }
  };

/**
 * Creates a function that removes highlights from elements
 * If index is provided, only unhighlights that specific element
 * If index is omitted, unhighlights all elements
 */
export const makeUnhighlight =
  (removeClass: ClassModifier) =>
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
    const relatedQuestionPair = results[index].querySelector(
      '.related-question-pair'
    );
    const accordionClickElement = results[index].querySelector(
      'div[jsname][jsaction][role="button"][aria-expanded="true"]'
    );

    if (relatedQuestionPair && accordionClickElement) {
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      accordionClickElement.dispatchEvent(clickEvent);
    }

    if (options.simulateHover) {
      const thumbEl = result.querySelector<HTMLElement>('ytd-thumbnail');
      if (thumbEl) {
        thumbEl.dispatchEvent(
          new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      }
    }
  };
