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
 * Split a Google Images grid result into its two anchors: the thumbnail
 * anchor that opens Google's preview panel when clicked, and the anchor
 * pointing to the source page.
 */
export const getGoogleImageResultAnchors = (
  result: HTMLElement
): {
  thumbnail: HTMLAnchorElement | null;
  source: HTMLAnchorElement | null;
} => {
  const anchors = Array.from(result.querySelectorAll('a'));
  // The thumbnail anchor has no href until Google populates it with a
  // site-relative /imgres URL; the source anchor links straight to the
  // external page.
  const isExternalHref = (a: HTMLAnchorElement): boolean =>
    /^https?:\/\//.test(a.getAttribute('href') ?? '');
  return {
    thumbnail: anchors.find((a) => !isExternalHref(a)) ?? null,
    source: anchors.find(isExternalHref) ?? null,
  };
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
