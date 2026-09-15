import { UPDATE_KEYMAPPINGS_MESSAGE } from './constants';
import type { KeyConfigs } from './services/keymap-manager';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === UPDATE_KEYMAPPINGS_MESSAGE) {
    // Forward the keymap update to all supported search tabs
    broadcastKeymapUpdate(message.keyConfigs);
    sendResponse({ success: true });
  }
});

/**
 * Broadcasts keymap updates to all supported search tabs
 */
async function broadcastKeymapUpdate(
  keyConfigs: KeyConfigs<string>
): Promise<void> {
  try {
    // Query all tabs that match Google search, YouTube and Brave Search patterns
    const urlPatterns = [
      'https://www.google.com/search*',
      'https://www.youtube.com/*',
      'https://search.brave.com/*',
    ] as const;
    const tabs = (
      await Promise.all(urlPatterns.map((url) => chrome.tabs.query({ url })))
    ).flat();

    // Send the keymap update message to each matching tab
    const promises = tabs.map(async (tab) => {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: UPDATE_KEYMAPPINGS_MESSAGE,
            keyConfigs: keyConfigs,
          });
        } catch (error) {
          // Ignore errors for tabs that may have been closed or aren't ready
          console.log(`Failed to send message to tab ${tab.id}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Error broadcasting keymap update:', error);
  }
}
