// DOM manipulation utilities
export type ExtractBodyBackgroundRgb = (
  window: Window & typeof globalThis,
  document: Document
) => [number, number, number] | null;

export const extractBodyBackgroundRgb: ExtractBodyBackgroundRgb = (
  window,
  document
) => {
  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const rgbValues = bgColor.match(/\d+/g)?.map(Number);
  if (!rgbValues || rgbValues.length < 3) return null;
  return [rgbValues[0], rgbValues[1], rgbValues[2]];
};

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
