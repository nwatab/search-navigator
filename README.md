# Search Navigator

[![Tests](https://github.com/nwatab/search-navigator/actions/workflows/main.yml/badge.svg)](https://github.com/nwatab/search-navigator/actions/workflows/main.yml)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/fpinaaaiplppifhmkjdfkimodkkdnoha)](https://chrome.google.com/webstore/detail/search-result-navigator/fpinaaaiplppifhmkjdfkimodkkdnoha)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/fpinaaaiplppifhmkjdfkimodkkdnoha)](https://chrome.google.com/webstore/detail/search-result-navigator/fpinaaaiplppifhmkjdfkimodkkdnoha)

## What is this?

A lightweight Google Chrome extension that enhances your Google search experience with intuitive keyboard navigation and quick category switching.

## Installation

### Chrome Web Store

Install the extension directly from the Chrome Web Store:

**[Install Search Navigator](https://chromewebstore.google.com/detail/search-navigator/fpinaaaiplppifhmkjdfkimodkkdnoha)**

### Manual Installation

For development or if you prefer to install manually:

1. Download the latest release from [Releases](https://github.com/nwatab/search-navigator/releases)
2. Extract the ZIP file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extracted folder

## Usage

Navigate Google search results with your keyboard:

**Navigation**

- `j/k` or `↓/↑` - Move through results
- `h/l` or `←/→` - Previous/next page
- `Enter` - Open result (+ `Ctrl`/`Cmd` for new tab, `Shift` for new window)

  _Note: Navigation controls are currently not supported on Shopping pages_

**Switch Between Tabs**

- `a` - All • `i` - Images • `v` - Videos • `n` - News • `s` - Shopping

**Quick Access**

- `m` - Google Maps • `y` - YouTube

**Customize shortcuts** by clicking the extension icon. Arrow keys cannot be changed.

## Important Notes

⚠️ **YouTube functionality is currently unstable and in preview version.** Navigation features may not work consistently on YouTube Search Result pages. Full YouTube support is planned for future releases.

## Roadmap

- [x] Light/Dark Theme support
- [x] Keyboard shortcut customization
- [x] Switch between All, Images, Videos, News, and Shopping search tabs
- [x] Navigate to Google Maps and YouTube with current search query
- [ ] YouTube support: move up/down, open, save to “Watch Later”
- [x] Image/Video/News support: move up/down, open

## Developer Contribution Guidelines

To set up the project locally and contribute, follow these steps:

1. **Install Dependencies:**  
   Run `pnpm install` to install all dependencies.

2. **Build the Project:**  
   Run `pnpm run build:dev` or `pnpm run build:prod` to compile; output goes to `/dist`.

3. **Load the Extension:**  
   In Chrome, go to `chrome://extensions/`, click “Load unpacked,” and select the `/dist` folder.

   Your contributions are welcome! To ensure your pull request aligns with our goals, please open an issue to discuss your idea before submitting it.
