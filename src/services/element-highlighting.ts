// Element highlighting utilities
import {
  addClass,
  removeClass,
  scrollIntoViewIfOutsideViewport,
} from './dom-utils';

/**
 * Highlights the element at the specified index
 */
export const highlight = (
  results: HTMLElement[],
  index: number,
  theme: 'dark' | 'light',
  options: {
    scrollIntoView?: boolean;
  } = { scrollIntoView: true }
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
};

/**
 * Removes highlights from the element at the specified index
 */
export const unhighlight = (results: HTMLElement[], index: number): void => {
  // throw invalid index
  if (typeof index === 'number' && (index < 0 || index >= results.length)) {
    throw new Error('Invalid index provided for unhighlight');
  }

  // Unhighlight specific element
  const result = results[index];
  removeClass(result, 'sn-selected-dark');
  removeClass(result, 'sn-selected-light');
};

/**
 * Keeps the highlight on the current result when the page itself rewrites
 * class attributes (Brave Search does so while hydrating, which otherwise
 * wipes the highlight applied on load). Stops when `signal` aborts.
 */
export const preserveHighlight = (
  root: Node,
  getHighlighted: () => HTMLElement | undefined,
  theme: 'dark' | 'light',
  signal: AbortSignal
): void => {
  const className = `sn-selected-${theme}`;
  const observer = new MutationObserver(() => {
    const el = getHighlighted();
    if (el && !el.classList.contains(className)) {
      addClass(el, className);
    }
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true,
  });
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
};
