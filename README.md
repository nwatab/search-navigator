[![Tests](https://github.com/nwatab/search-navigator/actions/workflows/main.yml/badge.svg)](https://github.com/nwatab/search-navigator/actions/workflows/main.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![version](https://img.shields.io/github/v/tag/nwatab/search-navigator?label=version&sort=semver)](https://github.com/nwatab/search-navigator/releases)

# Search Navigator

## What is this?

A lightweight bookmarklet that enhances your Google search experience with intuitive keyboard navigation and quick category switching.

## Usage

### Keyboard Navigation

- **j** or **↓**: Navigate down through search results.
- **k** or **↑**: Navigate up through search results.
- **h** or **←**: Go to the previous search results page.
- **l** or **→**: Go to the next search results page.
- **i**: Switch to the Images search tab.
- **v**: Switch to the Videos search tab.
- **n**: Switch to the News search tab.
- **s**: Switch to the Shopping search tab.
- **a**: Switch to the All search tab.
- **m**: Go to Google Maps (opens in same tab).
- **y**: Go to YouTube (opens in same tab).
- **Enter**: Open the highlighted result; hold `Ctrl` (Windows) or `Cmd` (macOS) to open in a new tab, or hold `Shift` to open in a new window.

**Note:** The **i**, **v**, **n**, **s**, and **a** shortcuts switch between Google search tabs and allow you to navigate back. The **m** and **y** shortcuts take you to external services (Google Maps and YouTube) and are one-way navigation.

All shortcuts except the arrow keys can be customized in the popup.

### Customization

Open the popup to customize your shortcut keys.  
**Note:** Arrow keys are fixed by default and cannot be changed at this time.

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
