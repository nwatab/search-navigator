(() => {
  let currentIndex: number = 0;
  const results: Element[] = Array.from(document.querySelectorAll('div.g'));
  function highlight(index: number): void {

    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const highlightColor = isDark ? "rgb(51, 51, 51)" : "rgb(205, 204, 204)";

    results.forEach((el, idx) => {
      if (idx === index) {
        (el as HTMLElement).style.backgroundColor = '#eef';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      case 'j': // down
        if (currentIndex < results.length - 1) {
          currentIndex++;
          highlight(currentIndex);
        }
        e.preventDefault();
        break;
      case 'k': // up
        if (currentIndex > 0) {
          currentIndex--;
          highlight(currentIndex);
        }
        e.preventDefault();
        break;
      case 'Enter': // open
        if (currentIndex >= 0 && currentIndex < results.length) {
          const link = results[currentIndex].querySelector('a');
          if (link instanceof HTMLAnchorElement && link.href) {
            window.location.href = link.href;
          }
        }
        break;
      case 'h': // previous
        {
          const prevLink = document.querySelector('#pnprev');
          if (prevLink instanceof HTMLAnchorElement && prevLink.href) {
            window.location.href = prevLink.href;
          }
          e.preventDefault();
        }
        break;
      case 'l': // next
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
