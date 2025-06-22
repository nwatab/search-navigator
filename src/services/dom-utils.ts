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
