import './style.scss'

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

function getGoogleSearchResultsWithDivG(): Element[] {
  return Array.from(document.querySelectorAll('div.g'));
}


function getGoogleSearchResultsWithH3() {
  const searchRoot = document.getElementById('search');
  if (!searchRoot) return [];
  
  const h3Elements = Array.from(searchRoot.getElementsByTagName('h3'));
  
  const getAncestor = (element: Element, levels: number) => {
    let current: Element | null = element;
    for (let i = 0; i < levels; i++) {
      current = current?.parentElement || current;
    }
    return current;
  };
  return [...new Set(h3Elements.map(h3 => getAncestor(h3, 9)))];
}
 
const makeGetGoogleSearchResults = (
  getGoogleSearchResultsWithDivG: () => Element[],
  getGoogleSearchResultsWithH3: () => Element[]
) => (): Element[] => {
  const resultsDivG = getGoogleSearchResultsWithDivG()
  console.log('resultsDivG', resultsDivG)
  if (resultsDivG.length > 0) {
    return resultsDivG;
  }
  const resultsH3 = getGoogleSearchResultsWithH3();
  console.log('resultsH3', resultsH3)
  if (resultsH3.length > 0) {
    return resultsH3;
  }
  return [];
}

(() => {
  let currentIndex: number = 0;
  const getGoogleSearchResults = makeGetGoogleSearchResults(getGoogleSearchResultsWithDivG, getGoogleSearchResultsWithH3);
  const results: Element[] = getGoogleSearchResults();

  function highlight(index: number): void {
    const isDark = isGoogleSearchDarkTheme(window);
    const className = `sn-selected-${isDark ? 'dark' : 'light'}`;
    
    // Remove highlights from all elements
    results.forEach(el => {
      el.classList.remove('sn-selected-dark', 'sn-selected-light');
    });
    
    // Apply new styling only to the current element
    if (index >= 0 && index < results.length) {
      const selectedElement = results[index];
      selectedElement.classList.add(className);
      
      const rect = selectedElement.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        selectedElement.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    }
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
      case 'i': // switch to image search
        {
          const currentUrl = window.location.href;
          const searchParams = new URLSearchParams(window.location.search);
          const query = searchParams.get('q');
          
          if (query) {
            // Check if we're already on image search
            if (!currentUrl.includes('/imghp') && !currentUrl.includes('/search?tbm=isch')) {
              // Construct image search URL
              const imageSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
              window.location.href = imageSearchUrl;
            }
          }
          e.preventDefault();
        }
        break;
      case 'a': // switch to "All" search results
        {
          const currentUrl = window.location.href;
          const searchParams = new URLSearchParams(window.location.search);
          const query = searchParams.get('q');
          
          if (query) {
            // Check if we're already on "All" search (no tbm parameter)
            if (currentUrl.includes('udm=')) {
              // Construct "All" search URL (removing any tbm parameter)
              const allSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
              window.location.href = allSearchUrl;
            }
          }
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  });
})();
