import './style.scss';

// side effects
type ExtractBodyBackgroundRgb = (
  window: Window & typeof globalThis,
  document: Document
) => [number, number, number] | null;
const extractBodyBackgroundRgb: ExtractBodyBackgroundRgb = (
  window,
  document
) => {
  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const rgbValues = bgColor.match(/\d+/g)?.map(Number);
  if (!rgbValues || rgbValues.length < 3) return null;
  return [rgbValues[0], rgbValues[1], rgbValues[2]];
};
type ClassModifier = (el: Element, className: string) => Element;
const addClass: ClassModifier = (el, className) => {
  el.classList.add(className);
  return el;
};
const removeClass: ClassModifier = (el, className) => {
  el.classList.remove(className);
  return el;
};

const scrollIntoViewIfOutsideViewport = (el: Element) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
  return el;
};

function getGoogleSearchResultsWithDivG(): HTMLElement[] {
  return Array.from(document.querySelectorAll('div.g'));
}

function getGoogleSearchResultsWithH3(tabType: 'all' | 'image') {
  const searchRoot = document.getElementById('search');
  if (!searchRoot) return [];

  const h3Elements = Array.from(searchRoot.getElementsByTagName('h3'));

  const getAncestor = (element: HTMLElement, levels: number) => {
    let current: HTMLElement | null = element;
    for (let i = 0; i < levels; i++) {
      current = current?.parentElement || current;
    }
    return current;
  };
  // magic numbers depending on actual DOM structure
  const levels = tabType === 'all' ? 9 : 2;
  return [...new Set(h3Elements.map((h3) => getAncestor(h3, levels)))];
}

const getGoogleSearchResults = (tabType: 'all' | 'image'): HTMLElement[] => {
  const resultsDivG = getGoogleSearchResultsWithDivG();
  if (resultsDivG.length > 0) {
    return resultsDivG;
  }
  const resultsH3 = getGoogleSearchResultsWithH3(tabType);
  if (resultsH3.length > 0) {
    return resultsH3;
  }
  return [];
};

// business logic pure functions
function determineThemeFromRgb(
  rgb: [number, number, number],
  brightnessThreshold: number = 128
): 'light' | 'dark' {
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000 < brightnessThreshold
    ? 'dark'
    : 'light';
}

function getGoogleSearchTabType(location: Location): 'all' | 'image' | null {
  const searchParams = new URLSearchParams(location.search);
  const udm = searchParams.get('udm');
  switch (udm) {
    case null:
      return 'all';
    case '2':
      return 'image';
    default:
      return null;
  }
}

const makeHighlight =
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

(() => {
  let currentIndex: number = 0;

  const searchTabType = getGoogleSearchTabType(window.location);
  console.log('searchTabType', searchTabType);
  if (!searchTabType) {
    // Only all and image tabs are supported for now
    return;
  }
  const results = getGoogleSearchResults(searchTabType);
  if (currentIndex < 0 || results.length <= currentIndex) {
    throw new Error(
      `currentIndex is out of bounds: ${currentIndex} of ${results.length}`
    );
  }
  const bodyBackgroundRgb = extractBodyBackgroundRgb(window, document);
  const theme =
    bodyBackgroundRgb == null
      ? 'light'
      : determineThemeFromRgb(bodyBackgroundRgb);
  const highlight = makeHighlight({ addClass, removeClass });
  highlight(results, currentIndex, theme);

  // Add keydown event listener for all Google Search pages
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const activeTag =
      (document.activeElement && document.activeElement.tagName) || '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    switch (e.key) {
      // down
      case 'j':
      case 'ArrowDown':
        // TODO: add support for image search
        if (
          results.length > 0 &&
          currentIndex < results.length - 1 &&
          searchTabType === 'all'
        ) {
          currentIndex++;
          highlight(results, currentIndex, theme);
          scrollIntoViewIfOutsideViewport(results[currentIndex]);
          e.preventDefault();
        }
        break;

      // up
      case 'k':
      case 'ArrowUp':
        // TODO: add support for image search
        if (results.length > 0 && currentIndex > 0 && searchTabType === 'all') {
          currentIndex--;
          highlight(results, currentIndex, theme);
          scrollIntoViewIfOutsideViewport(results[currentIndex]);
          e.preventDefault();
        }
        break;

      // open link
      case 'Enter':
        // TODO: add support for image search
        if (
          results.length > 0 &&
          currentIndex >= 0 &&
          currentIndex < results.length
        ) {
          switch (searchTabType) {
            case 'all':
              const link = results[currentIndex].querySelector('a');
              if (link instanceof HTMLAnchorElement && link.href) {
                if (e.ctrlKey || e.metaKey) {
                  window.open(link.href, '_blank');
                } else {
                  window.location.href = link.href;
                }
              }
              break;
            case 'image':
              // ToDo: it's complicated. Going up and down doesn't work when enlarging an image. More investigation needed.
              // const vhid = results[currentIndex].querySelector('div')?.dataset.vhid;
              // if (vhid) {
              //   const url = new URL(window.location.href);
              //   const currentHash = url.hash.replace('#', '');
              //   console.log(currentHash, vhid);
              //   if (currentHash === vhid) {
              //       url.hash = '';
              //   } else {
              //     url.hash = `#${vhid}`;
              //   }
              //   window.location.href = url.toString();
              // }
              break;
            default:
              break;
          }
        }
        break;

      // previous page
      case 'h':
      case 'ArrowLeft':
        {
          // TODO: add support for image search
          if (searchTabType === 'all') {
            const prevLink = document.querySelector('#pnprev');
            if (prevLink instanceof HTMLAnchorElement && prevLink.href) {
              window.location.href = prevLink.href;
            }
            e.preventDefault();
          }
        }
        break;

      // next page
      case 'l':
      case 'ArrowRight':
        {
          if (searchTabType === 'all') {
            const nextLink = document.querySelector('#pnnext');
            if (nextLink instanceof HTMLAnchorElement && nextLink.href) {
              window.location.href = nextLink.href;
            }
            e.preventDefault();
          }
        }
        break;

      // switch to image search
      case 'i':
        {
          if (searchTabType !== 'image') {
            const searchParams = new URLSearchParams(window.location.search);
            const query = searchParams.get('q');

            if (query) {
              // Construct image search URL
              const imageSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
              window.location.href = imageSearchUrl;
            }
            e.preventDefault();
          }
        }
        break;

      // switch to all search
      case 'a':
        {
          if (searchTabType !== 'all') {
            const searchParams = new URLSearchParams(window.location.search);
            const query = searchParams.get('q');
            if (!query) {
              window.location.href = 'https://www.google.com';
            } else {
              const allSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
              window.location.href = allSearchUrl;
            }
            e.preventDefault();
          }
        }
        break;
      default:
        break;
    }
  });
})();
