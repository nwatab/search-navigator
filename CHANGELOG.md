# Changelog

All notable changes to this project will be documented in this file.  
This project adheres to [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.7.2] - 2025-05-29

### Fixed

- Fix Google search results scraping algorithm (#42)
- Fix "People also ask" section to be selectable and openable (#6)

### Maintenance

- Set up Jest
- Added GitHub Actions to run tests on pull requests against main

## [1.7.1] - 2025-05-29

### Fixed

- Fix tab type detector to work on all tabs (#35).

### Maintenance

- Set up Jest

## [1.7.0] - 2025-05-09

### Added

- Switch search tabs between videos, news, shopping, and map

## [1.6.2] - 2025-05-05

### Fixed

- Fix modifier key to click a link not working. In customization of open link, modifer keys are no longer allowed.

- Remove gradient background of popup.

## [1.6.1] - 2025-05-05

### Fixed

- Replace an error-prone blacklist with a whitelist for customizable shortcut keys to avoid a bug.

## [1.6.0] - 2025-05-04

### Added

- Add extension icons.
- Customize shortcut keys from popup (#20).

## [1.5.0] - 2025-04-04

### Added

- Open in a new tab ([#18](https://github.com/nwatab/search-navigator/pull/18)) by @nwatab

## [1.4.2] - 2025-04-03

### Fixed

- Stop scrolling on content load; only call `scrollIntoView` when a selected item is outside the viewport.
- Disable incorrect image-search element selection.

### Maintenance

- Separate some side-effects to improve maintainability.
- Add Prettier for consistent code formatting.

## [1.4.1] - 2025-03-21

### Changed

- Adapt to Google Search result HTML variations.

## [1.4.0] - 2025-03-14

### Added

- Google Image search support.
- Highlight visibility enhancements.

## [1.3.0] - 2025-03-14

### Fixed

- Corrected light/dark theme detection.
- Improved arrow-key navigation.

---

[1.7.2]: https://github.com/nwatab/search-navigator/compare/v1.7.1...v1.7.2
[1.7.1]: https://github.com/nwatab/search-navigator/compare/v1.7.0...v1.7.1
[1.7.0]: https://github.com/nwatab/search-navigator/compare/v1.6.2...v1.7.0
[1.6.2]: https://github.com/nwatab/search-navigator/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/nwatab/search-navigator/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/nwatab/search-navigator/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/nwatab/search-navigator/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/nwatab/search-navigator/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/nwatab/search-navigator/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/nwatab/search-navigator/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/nwatab/search-navigator/releases/tag/v1.3.0
