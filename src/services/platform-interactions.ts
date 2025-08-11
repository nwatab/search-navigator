// Platform-specific interaction utilities

/**
 * Helper function to click a specific accordion element in "People also ask" sections
 * Note: Not currently used but will be needed for future features
 * @param element - The parent element containing the accordion
 * @param expanded - The target state: true to expand, false to collapse
 */
export const clickPeopleAlsoAskAccordion = (
  element: HTMLElement,
  expanded: boolean
): void => {
  const relatedQuestionPair = element.querySelector('.related-question-pair');
  if (!relatedQuestionPair) return;

  const selector = `div[jsname][jsaction][role="button"][aria-expanded="${expanded}"]`;
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
 * Helper function to toggle accordion elements in "People also ask" sections
 * Finds any accordion button and clicks it to toggle its current state
 * @param element - The parent element containing the accordion
 */
export const togglePeopleAlsoAskAccordion = (element: HTMLElement): void => {
  const relatedQuestionPair = element.querySelector('.related-question-pair');
  if (!relatedQuestionPair) return;

  const selector = 'div[jsname][jsaction][role="button"][aria-expanded]';
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
