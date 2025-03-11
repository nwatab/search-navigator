/**
 * Checks if Google Search is using a dark theme based on the body's background color.
 *
 * Calculates brightness using the formula:
 *   brightness = (r * 299 + g * 587 + b * 114) / 1000
 * Returns true if brightness is below the given threshold.
 *
 * @param {Window} window - The global window object.
 * @param {number} [brightnessThreshold=128] - The brightness threshold for dark mode.
 * @returns {boolean} True if dark theme is detected, otherwise false.
 */
function isGoogleSearchDarkTheme(window: Window & typeof globalThis, brightnessThreshold: number = 128): boolean {
  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const rgbValues = bgColor.match(/\d+/g)?.map(Number);
  if (!rgbValues || rgbValues.length < 3) return false;
  const [r, g, b] = rgbValues;
  return (r * 299 + g * 587 + b * 114) / 1000 < brightnessThreshold;
}

(() => {
  let currentIndex: number = 0;
  const results: Element[] = Array.from(document.querySelectorAll('div.g'));

  function highlight(index: number): void {
    const isDark = isGoogleSearchDarkTheme(window)
    const highlightColor = isDark ? "rgb(61, 69, 92)" : "rgb(224, 227, 235)";

    results.forEach((el, idx) => {
      if (idx === index) {
        (el as HTMLElement).style.backgroundColor = highlightColor;
        const rect = el.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      } else {
        (el as HTMLElement).style.backgroundColor = '';
      }
    });
  }

  if (results.length > 0) {
    highlight(currentIndex);
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const activeTag = (document.activeElement && document.activeElement.tagName) || '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    switch (e.key) {
      case 'j': // down (Vim)
      case 'ArrowDown': // down (Arrow key)
        if (currentIndex < results.length - 1) {
          currentIndex++;
          highlight(currentIndex);
        }
        e.preventDefault();
        break;
      case 'k': // up (Vim)
      case 'ArrowUp': // up (Arrow key)
        if (currentIndex > 0) {
          currentIndex--;
          highlight(currentIndex);
        }
        e.preventDefault();
        break;
      case 'Enter': // open link
        if (currentIndex >= 0 && currentIndex < results.length) {
          const link = results[currentIndex].querySelector('a');
          if (link instanceof HTMLAnchorElement && link.href) {
            window.location.href = link.href;
          }
        }
        break;
      case 'h': // previous page (Vim)
      case 'ArrowLeft': // previous page (Arrow key)
        {
          const prevLink = document.querySelector('#pnprev');
          if (prevLink instanceof HTMLAnchorElement && prevLink.href) {
            window.location.href = prevLink.href;
          }
          e.preventDefault();
        }
        break;
      case 'l': // next page (Vim)
      case 'ArrowRight': // next page (Arrow key)
        {
          const nextLink = document.querySelector('#pnnext');
          if (nextLink instanceof HTMLAnchorElement && nextLink.href) {
            window.location.href = nextLink.href;
          }
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  });
})();
