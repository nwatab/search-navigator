import type { KeyConfigs } from './services';
import {
  createKeymapManager,
  defaultKeyConfigs,
  keyConfigToString,
  stringToKeyConfig,
} from './services';
import { storageSync } from './dependency-injection';
import {
  MOVE_DOWN_ID,
  MOVE_UP_ID,
  NAVIGATE_NEXT_ID,
  NAVIGATE_PREVIOUS_ID,
  OPEN_LINK_ID,
  SWITCH_TO_ALL_SEARCH_ID,
  SWITCH_TO_IMAGE_SEARCH_ID,
  SWITCH_TO_YOUTUBE_ID,
  UPDATE_KEYMAPPINGS_MESSAGE,
} from './constants';

document.addEventListener('DOMContentLoaded', async () => {
  const keymapManager = await createKeymapManager(storageSync);
  const currentKeyConfigs = keymapManager.getKeyConfigs();

  setupInputFields(currentKeyConfigs);
  setupKeyCaptureListeners();
  setupSaveButton();
  setupResetButton();

  /**
   * Sets up all input fields with the current key configurations
   */
  function setupInputFields(keyConfigs: KeyConfigs<string>): void {
    const [
      moveUpInput,
      moveDownInput,
      openLinkInput,
      previousPageInput,
      nextPageInput,
      switchToImageSearchInput,
      switchToAllSearchInput,
      switchToVideosInput,
      switchToShoppingInput,
      switchToNewsInput,
      switchToMapInput,
      switchToYoutubeInput,
    ] = [
      MOVE_UP_ID,
      MOVE_DOWN_ID,
      OPEN_LINK_ID,
      NAVIGATE_PREVIOUS_ID,
      NAVIGATE_NEXT_ID,
      SWITCH_TO_IMAGE_SEARCH_ID,
      SWITCH_TO_ALL_SEARCH_ID,
      'switchToVideos',
      'switchToShopping',
      'switchToNews',
      'switchToMap',
      SWITCH_TO_YOUTUBE_ID,
    ].map((id) => {
      const el = document.getElementById(id);
      if (!el) {
        throw new Error(
          `setupInputFields: #${id} is missing. Did you rename or remove it?`
        );
      }
      return el as HTMLInputElement;
    });

    // Set the values using the helper function to convert KeyConfig to display string
    moveUpInput.value = keyConfigToString(keyConfigs.move_up);
    moveDownInput.value = keyConfigToString(keyConfigs.move_down);
    openLinkInput.value = keyConfigToString(keyConfigs.open_link);
    previousPageInput.value = keyConfigToString(keyConfigs.navigate_previous);
    nextPageInput.value = keyConfigToString(keyConfigs.navigate_next);
    switchToImageSearchInput.value = keyConfigToString(
      keyConfigs.switch_to_image_search
    );
    switchToAllSearchInput.value = keyConfigToString(
      keyConfigs.switch_to_all_search
    );
    switchToVideosInput.value = keyConfigToString(keyConfigs.switch_to_videos);
    switchToShoppingInput.value = keyConfigToString(
      keyConfigs.switch_to_shopping
    );
    switchToNewsInput.value = keyConfigToString(keyConfigs.switch_to_news);
    switchToMapInput.value = keyConfigToString(keyConfigs.switch_to_map);
    switchToYoutubeInput.value = keyConfigToString(
      keyConfigs.switch_to_youtube
    );
  }

  /**
   * Sets up event listeners to capture key presses for all shortcut input fields
   */
  function setupKeyCaptureListeners(): void {
    const shortcutInputs = Array.from(
      document.querySelectorAll('.shortcut-input')
    ) as HTMLInputElement[];

    shortcutInputs.forEach((input) => {
      let originalValue: string;
      let didCapture = false;

      input.addEventListener('focus', () => {
        originalValue = input.value;
        didCapture = false;
        input.value = '';
        input.placeholder = 'Press';
        input.select();
      });

      // ToDo: need test for key down
      input.addEventListener('keydown', (event) => {
        // keys that we swallow and wait for a "real" key
        const swallowKeys = new Set([
          'Shift',
          'Control',
          'Alt',
          'Meta', // Cmd / Windows
        ]);
        // 0) If it's a pure modifier, just swallow it—don't blur.
        if (swallowKeys.has(event.key)) {
          event.preventDefault();
          return; // stay in the input, wait for a "real" key
        }

        // 1) whitelist test
        const isCharKey = event.key.length === 1; // letters, digits, punctuation, Space, Brackets, parentheses, at-sign, etc.
        // const isArrowKey = [
        //   'ArrowUp',
        //   'ArrowDown',
        //   'ArrowLeft',
        //   'ArrowRight',
        // ].includes(event.key);
        // The arrow keys are used by default. To customize them, the default settings should be overridden in the keymap manager.
        const isFunctionKey = /^F\d{1,2}$/.test(event.key); // F1–F12
        const isEnter = event.key === 'Enter';

        if (!(isCharKey || isFunctionKey || isEnter)) {
          event.preventDefault();
          input.blur();
          // ToDo: Feedback a user that this is not a valid key
          return;
        }

        // 2) Now build the combo (this will include event.ctrlKey, etc.)
        const combo =
          input.id === OPEN_LINK_ID
            ? keyConfigToString({
                key: event.key,
              })
            : keyConfigToString({
                key: event.key,
                ctrl: event.ctrlKey,
                alt: event.altKey,
                shift: event.shiftKey,
                meta: event.metaKey,
              });

        // 3) Check for conflicts
        const otherCombos = shortcutInputs
          .filter((el) => el !== input)
          .map((el) => el.value)
          .filter((v) => v);

        if (otherCombos.includes(combo)) {
          event.preventDefault();
          alert(`"${combo}" is already in use by another shortcut.`);
          input.blur();
          return;
        }

        // 4) Accept and blur
        input.value = combo;
        input.placeholder = '';
        didCapture = true;
        input.blur();
      });

      input.addEventListener('blur', () => {
        input.placeholder = '';
        if (!didCapture) {
          // restore original if no valid combo was captured
          input.value = originalValue;
        }
      });
    });
  }

  /**
   * Sets up the save button to save the key configurations
   */
  function setupSaveButton(): void {
    const saveButton = document.getElementById('save');
    if (saveButton) {
      saveButton.addEventListener('click', saveKeyConfigs);
    }
  }

  /**
   * Saves the key configurations from the input fields to storage
   */
  async function saveKeyConfigs(): Promise<void> {
    const [
      moveUpInput,
      moveDownInput,
      openLinkInput,
      previousPageInput,
      nextPageInput,
      switchToImageSearchInput,
      switchToAllSearchInput,
      switchToVideosInput,
      switchToShoppingInput,
      switchToNewsInput,
      switchToMapInput,
      switchToYoutubeInput,
    ] = [
      MOVE_DOWN_ID,
      MOVE_UP_ID,
      OPEN_LINK_ID,
      NAVIGATE_PREVIOUS_ID,
      NAVIGATE_NEXT_ID,
      SWITCH_TO_IMAGE_SEARCH_ID,
      SWITCH_TO_ALL_SEARCH_ID,
      'switchToVideos',
      'switchToShopping',
      'switchToNews',
      'switchToMap',
      SWITCH_TO_YOUTUBE_ID,
    ].map((id) => {
      const el = document.getElementById(id);
      if (!el) {
        throw new Error(
          `saveKeyConfigs: #${id} is missing. Did you rename or remove it?`
        );
      }
      return el as HTMLInputElement;
    });

    const inputs: Record<keyof KeyConfigs<string>, HTMLInputElement | null> = {
      move_up: moveUpInput,
      move_down: moveDownInput,
      open_link: openLinkInput,
      navigate_previous: previousPageInput,
      navigate_next: nextPageInput,
      switch_to_image_search: switchToImageSearchInput,
      switch_to_all_search: switchToAllSearchInput,
      switch_to_videos: switchToVideosInput,
      switch_to_shopping: switchToShoppingInput,
      switch_to_news: switchToNewsInput,
      switch_to_map: switchToMapInput,
      switch_to_youtube: switchToYoutubeInput,
    };

    const userOverrideConfigs = (
      Object.keys(inputs) as (keyof KeyConfigs<string>)[]
    ).reduce(
      (acc, key) => {
        const el = inputs[key];
        if (el?.value) {
          acc[key] = stringToKeyConfig(el.value);
        }
        return acc;
      },
      {} as Partial<KeyConfigs<string>>
    );

    const newKeyConfigs: KeyConfigs<string> = {
      ...defaultKeyConfigs,
      ...userOverrideConfigs,
    };

    await keymapManager.saveKeyConfigs(newKeyConfigs);

    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Settings saved successfully! Reload to apply.';
      status.className = 'status success';
      status.style.display = 'block';

      chrome.runtime.sendMessage({
        type: UPDATE_KEYMAPPINGS_MESSAGE,
        keyConfigs: newKeyConfigs,
      });
      // Hide notification after 3 seconds
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
    // Send message to background script to update settings across all tabs
  }

  function setupResetButton(): void {
    const resetButton = document.getElementById('reset');
    if (!resetButton) {
      throw new Error(
        'setupResetButton: #reset button is missing. Did you rename or remove it?'
      );
    }
    resetButton.addEventListener('click', async () => {
      // 1) Clear from storage
      await keymapManager.clearKeyConfigs();
      // 2) Restore defaultKeyConfigs in UI
      setupInputFields(defaultKeyConfigs);
      // 3) Notify user
      const status = document.getElementById('status')!;
      status.textContent = 'Settings reset to defaults.';
      status.className = 'status success';
      status.style.display = 'block';
      // Send message to background script to update settings across all tabs
      chrome.runtime.sendMessage({
        type: UPDATE_KEYMAPPINGS_MESSAGE,
        keyConfigs: defaultKeyConfigs,
      });
      setTimeout(() => (status.style.display = 'none'), 3000);
    });
  }
});
