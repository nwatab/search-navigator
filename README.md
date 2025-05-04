## What is this?

A lightweight bookmarklet that enhances your Google search experience with intuitive keyboard navigation and quick category switching.

## Usage

1. **Keyboard Navigation:**

- **j** or **↓**: Navigate down through search results.
- **k** or **↑**: Navigate up through search results.
- **h** or **←**: Go to the previous search results page.
- **l** or **→**: Go to the next search results page.
- **i**: Go to Google Image search.
- **a**: Go to Google Search All tab.
- **Enter**: Open the highlighted search result. Open in a new tab with Ctrl + Enter (Win) or Cmd + Enter (macos). Open in a new window with Shift + Enter.

## Roadmap

- [ ] YouTube Support
- [x] Light/Dark Theme Support
- [x] Customizable Keyboard Shortcuts
- [x] Scroll up/down only when a selected item is out of the viewport.
- [x] Google Images
- [ ] Google Maps
- [ ] Google Shopping
- [ ] Google News
- [ ] Google Video

## Developer Contribution Guidelines

To set up the project locally and contribute, follow these steps:

1. **Install Dependencies:**  
   Run `pnpm run install` to install all necessary packages.

2. **Build the Project:**  
   Execute `pnpm run build` to compile the project. The build artifacts will be generated in the `/dist` directory.

3. **Load the Extension:**  
   Open `chrome://extensions/` in your Chrome browser and use the "Load unpacked" option to load the `/dist` directory.
   Your contributions are welcome! To ensure your pull request aligns with our goals, please open an issue to discuss your idea before submitting it.
