// Highlight utilities
import { ClassModifier } from './dom-utils';

export const makeHighlight =
  ({
    addClass,
    removeClass,
  }: {
    addClass: ClassModifier;
    removeClass: ClassModifier;
  }) =>
  (results: HTMLElement[], index: number, theme: 'dark' | 'light'): void => {
    const className = `sn-selected-${theme}`;
    results.forEach((el) => {
      removeClass(el, 'sn-selected-dark');
      removeClass(el, 'sn-selected-light');
    });

    if (index >= 0 && index < results.length) {
      addClass(results[index], className);
    }
  };
