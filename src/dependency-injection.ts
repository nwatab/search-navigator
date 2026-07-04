import { createKeymapManager, makeStorageSync } from './services';

// Composition root for the browser-extension boundary: only dependencies
// that wrap Chrome APIs are wired here, so tests can replace them with
// fakes. Pure services are imported directly where they are used.
export const storageSync = makeStorageSync(chrome.storage.sync);
export const keymapManagerPromise = createKeymapManager(storageSync);
