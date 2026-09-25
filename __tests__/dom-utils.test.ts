import {
  addClass,
  getDeepActiveElement,
  isEditableElement,
  isKeyEventFromEditable,
  removeClass,
  scrollIntoViewIfOutsideViewport,
} from '../src/services/dom-utils';

describe('addClass', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = document.getElementById('test')!;
  });

  it('should add class to element', () => {
    const result = addClass(element, 'test-class');

    expect(element.classList.contains('test-class')).toBe(true);
    expect(result).toBe(element);
  });
});

describe('removeClass', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="test" class="test-class another-class"></div>';
    element = document.getElementById('test')!;
  });

  it('should remove class from element', () => {
    const result = removeClass(element, 'test-class');

    expect(element.classList.contains('test-class')).toBe(false);
    expect(element.classList.contains('another-class')).toBe(true);
    expect(result).toBe(element);
  });

  it('should handle removing non-existent class', () => {
    removeClass(element, 'non-existent-class');

    expect(element.classList.contains('test-class')).toBe(true);
    expect(element.classList.contains('another-class')).toBe(true);
  });
});

describe('scrollIntoViewIfOutsideViewport', () => {
  let element: HTMLElement;
  let mockScrollIntoView: jest.Mock;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = document.getElementById('test')!;
    mockScrollIntoView = jest.fn();
    element.scrollIntoView = mockScrollIntoView;

    element.getBoundingClientRect = jest.fn();

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    });
  });

  it('should scroll element into view when above viewport', () => {
    (element.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: -50,
      bottom: 0,
    });

    const result = scrollIntoViewIfOutsideViewport(element);

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
    });
    expect(result).toBe(element);
  });

  it('should scroll element into view when below viewport', () => {
    (element.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: 850,
      bottom: 900,
    });

    scrollIntoViewIfOutsideViewport(element);

    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it('should not scroll element when within viewport', () => {
    (element.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: 100,
      bottom: 200,
    });

    const result = scrollIntoViewIfOutsideViewport(element);

    expect(mockScrollIntoView).not.toHaveBeenCalled();
    expect(result).toBe(element);
  });
});

describe('isEditableElement', () => {
  const elementFrom = (html: string): Element => {
    document.body.innerHTML = html;
    return document.body.firstElementChild!;
  };

  it.each([
    ['a textarea', '<textarea></textarea>'],
    ['a text input', '<input type="text">'],
    ['a select', '<select></select>'],
    ['a contenteditable element', '<div contenteditable="true"></div>'],
    ['contenteditable without a value', '<div contenteditable></div>'],
    ['role="textbox"', '<div role="textbox"></div>'],
    ['role="searchbox"', '<div role="searchbox"></div>'],
    ['role="combobox"', '<div role="combobox"></div>'],
  ])('is true for %s', (_, html) => {
    expect(isEditableElement(elementFrom(html))).toBe(true);
  });

  it('is true for a node inside a contenteditable region', () => {
    document.body.innerHTML =
      '<div contenteditable="true"><p><span id="inner">x</span></p></div>';
    expect(isEditableElement(document.getElementById('inner')!)).toBe(true);
  });

  it.each([
    ['a plain div', '<div></div>'],
    ['contenteditable="false"', '<div contenteditable="false"></div>'],
    ['a link', '<a href="#">x</a>'],
    ['a button', '<button>x</button>'],
  ])('is false for %s', (_, html) => {
    expect(isEditableElement(elementFrom(html))).toBe(false);
  });
});

describe('getDeepActiveElement', () => {
  it('returns the focused element in the document', () => {
    document.body.innerHTML = '<textarea id="box"></textarea>';
    const box = document.getElementById('box')!;
    box.focus();
    expect(getDeepActiveElement(document)).toBe(box);
  });

  it('descends into an open shadow root', () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host')!;
    const shadow = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('textarea');
    shadow.appendChild(inner);
    inner.focus();

    expect(document.activeElement).toBe(host);
    expect(getDeepActiveElement(document)).toBe(inner);
  });
});

describe('isKeyEventFromEditable', () => {
  // Observe the event from a document-level listener, like the content script.
  const enterSeenAtDocument = (target: Element): boolean | null => {
    let result: boolean | null = null;
    const listener = (e: Event) => {
      result = isKeyEventFromEditable(e as KeyboardEvent, document);
    };
    document.addEventListener('keydown', listener);
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      })
    );
    document.removeEventListener('keydown', listener);
    return result;
  };

  it('is true for Enter in a focused textarea', () => {
    document.body.innerHTML = '<textarea id="box"></textarea>';
    const box = document.getElementById('box')!;
    box.focus();
    expect(enterSeenAtDocument(box)).toBe(true);
  });

  it('is true even when the page blurs the box while handling the same keystroke', () => {
    document.body.innerHTML = '<textarea id="box"></textarea>';
    const box = document.getElementById('box')!;
    box.focus();
    // The page's own handler runs first (target phase) and moves focus away
    // before the event reaches the document.
    box.addEventListener('keydown', () => box.blur());

    expect(enterSeenAtDocument(box)).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  it('is true for a textarea inside an open shadow root', () => {
    document.body.innerHTML = '<div id="host"></div>';
    const host = document.getElementById('host')!;
    const shadow = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('textarea');
    shadow.appendChild(inner);
    inner.focus();
    expect(enterSeenAtDocument(inner)).toBe(true);
  });

  it('is true for a contenteditable box', () => {
    document.body.innerHTML =
      '<div id="box" contenteditable="true" role="textbox"></div>';
    const box = document.getElementById('box')!;
    box.focus();
    expect(enterSeenAtDocument(box)).toBe(true);
  });

  it('is false for a keystroke on the body', () => {
    document.body.innerHTML = '<div><h3>Result</h3><a href="#">x</a></div>';
    expect(enterSeenAtDocument(document.body)).toBe(false);
  });

  it('is false for a keystroke on a focused link', () => {
    document.body.innerHTML = '<a id="link" href="#">x</a>';
    const link = document.getElementById('link')!;
    link.focus();
    expect(enterSeenAtDocument(link)).toBe(false);
  });
});
