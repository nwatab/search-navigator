export type ClassModifier = (el: Element, className: string) => Element;

export const addClass: ClassModifier = (el, className) => {
  el.classList.add(className);
  return el;
};

export const removeClass: ClassModifier = (el, className) => {
  el.classList.remove(className);
  return el;
};

export const scrollIntoViewIfOutsideViewport = (el: Element) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
  return el;
};

/**
 * Waits for a specific selector to appear in the document.
 * @param selector - document.querySelector selector string
 * @param doc - Document object
 * @param timeout - ms（regect when not found in this time）
 */
export function waitForSelector(
  doc: Document,
  selector: string,
  timeout = 5_000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const found = doc.querySelector(selector);
    if (found) return resolve(found);

    const obs = new MutationObserver((_, observer) => {
      const el = doc.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    obs.observe(doc.body, { childList: true, subtree: true });

    setTimeout(() => {
      obs.disconnect();
      reject(new Error(`"${selector}" was not found in ${timeout}ms`));
    }, timeout);
  });
}

const EDITABLE_TAG_NAMES: ReadonlySet<string> = new Set([
  'INPUT',
  'TEXTAREA',
  'SELECT',
]);
const EDITABLE_ROLES: ReadonlySet<string> = new Set([
  'textbox',
  'searchbox',
  'combobox',
]);
const CONTENTEDITABLE_SELECTOR =
  '[contenteditable]:not([contenteditable="false"])';

const isElement = (value: unknown): value is Element =>
  value instanceof Element;

/**
 * Whether keystrokes on `el` are text entry rather than shortcuts: native
 * form controls, contenteditable regions (or any node inside one) and ARIA
 * text boxes. Google's AI Overview follow-up box is the motivating case.
 */
export const isEditableElement = (el: Element): boolean =>
  EDITABLE_TAG_NAMES.has(el.tagName) ||
  EDITABLE_ROLES.has(el.getAttribute('role') ?? '') ||
  el.closest(CONTENTEDITABLE_SELECTOR) !== null;

/**
 * The innermost focused element, descending through open shadow roots
 * (`document.activeElement` stops at the shadow host).
 */
export const getDeepActiveElement = (
  root: Document | ShadowRoot
): Element | null => {
  const active = root.activeElement;
  const shadow = active?.shadowRoot;
  return shadow?.activeElement ? getDeepActiveElement(shadow) : active;
};

/**
 * Whether a keyboard event comes from an editable element, so navigation
 * shortcuts must leave it alone.
 *
 * The event's composed path is checked first: it is fixed when the event is
 * dispatched and reaches into open shadow roots, whereas
 * `document.activeElement` may already have moved by the time the event
 * bubbles up to the document (the page's own handler can blur or replace the
 * box while handling the same keystroke). The focused element is still
 * checked as a fallback.
 */
export const isKeyEventFromEditable = (
  e: KeyboardEvent,
  doc: Document
): boolean =>
  [e.composedPath()[0], e.target, getDeepActiveElement(doc)]
    .filter(isElement)
    .some(isEditableElement);
