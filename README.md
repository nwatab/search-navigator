## What is this?

A lightweight bookmarklet that enhances your Google search experience with intuitive keyboard navigation and quick category switching.

## Usage

### Keyboard Navigation

- **j** or **↓**: Navigate down through search results.
- **k** or **↑**: Navigate up through search results.
- **h** or **←**: Go to the previous search results page.
- **l** or **→**: Go to the next search results page.
- **i**: Switch to the Image search tab.
- **a**: Switch to the All tab.
- **Enter**: Open the highlighted result; hold `Ctrl` (Windows) or `Cmd` (macOS) to open in a new tab, or hold `Shift` to open in a new window.

All shortcuts except the arrow keys can be customized in the popup.

### Customization

Open the popup to customize your shortcut keys.  
**Note:** Arrow keys are fixed by default and cannot be changed at this time.

## Roadmap

- [x] Light/Dark Theme support
- [x] Keyboard shortcut customization
- [ ] Switch between All, Images, Videos, Maps, News, and YouTube
- [ ] YouTube support: move up/down, open, save to “Watch Later”
- [ ] Image/Video/News support: move up/down, open

## Developer Contribution Guidelines

To set up the project locally and contribute, follow these steps:

1. **Install Dependencies:**  
   Run `pnpm install` to install all dependencies.

2. **Build the Project:**  
   Run `pnpm run build` to compile; output goes to `/dist`.

3. **Load the Extension:**  
   In Chrome, go to `chrome://extensions/`, click “Load unpacked,” and select the `/dist` folder.

   Your contributions are welcome! To ensure your pull request aligns with our goals, please open an issue to discuss your idea before submitting it.
