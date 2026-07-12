import {
  createRatePromptToast,
  RATE_PROMPT_TOAST_ID,
} from '../src/services/rate-prompt-toast';

describe('createRatePromptToast', () => {
  it('builds a themed, detached toast with a stable id', () => {
    const toast = createRatePromptToast('dark', {
      onRate: jest.fn(),
      onDismiss: jest.fn(),
    });
    expect(toast.id).toBe(RATE_PROMPT_TOAST_ID);
    expect(toast.className).toContain('sn-rate-prompt-dark');
    expect(toast.getAttribute('role')).toBe('dialog');
    // Not attached to the document until the caller appends it.
    expect(toast.isConnected).toBe(false);
  });

  it('wires the Rate button to onRate', () => {
    const onRate = jest.fn();
    const onDismiss = jest.fn();
    const toast = createRatePromptToast('light', { onRate, onDismiss });

    const rate = toast.querySelector(
      '.sn-rate-prompt__btn--primary'
    ) as HTMLButtonElement;
    rate.click();

    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('wires the "Not now" button to onDismiss', () => {
    const onRate = jest.fn();
    const onDismiss = jest.fn();
    const toast = createRatePromptToast('light', { onRate, onDismiss });

    const buttons = toast.querySelectorAll('.sn-rate-prompt__btn');
    const dismiss = Array.from(buttons).find(
      (b) => !b.classList.contains('sn-rate-prompt__btn--primary')
    ) as HTMLButtonElement;
    dismiss.click();

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onRate).not.toHaveBeenCalled();
  });
});
