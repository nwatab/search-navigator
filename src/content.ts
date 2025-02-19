(() => {
  let currentIndex: number = -1;
  // Google の検索結果は DOM 構造が変更される可能性があるため、
  // 必要に応じてセレクターを調整してください。
  const results: Element[] = Array.from(document.querySelectorAll('div.g'));

  /**
   * 現在選択中の要素をハイライトし、中央にスクロールする
   * @param index - 選択中の結果のインデックス
   */
  function highlight(index: number): void {
    results.forEach((el, idx) => {
      if (idx === index) {
        (el as HTMLElement).style.backgroundColor = '#eef';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        (el as HTMLElement).style.backgroundColor = '';
      }
    });
  }

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // テキスト入力中はショートカットを無効にする
    const activeTag = (document.activeElement && document.activeElement.tagName) || '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      return;
    }

    switch (e.key) {
      case 'j': // 下へ移動
        if (currentIndex < results.length - 1) {
          currentIndex++;
          highlight(currentIndex);
        }
        e.preventDefault();
        break;
      case 'k': // 上へ移動
        if (currentIndex > 0) {
          currentIndex--;
          highlight(currentIndex);
        }
        e.preventDefault();
        break;
      case 'Enter': // リンクを開く
        if (currentIndex >= 0 && currentIndex < results.length) {
          const link = results[currentIndex].querySelector('a');
          if (link instanceof HTMLAnchorElement && link.href) {
            window.location.href = link.href;
          }
        }
        break;
      default:
        break;
    }
  });
})();
