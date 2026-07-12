export const RATE_PROMPT_TOAST_ID = 'sn-rate-prompt';

export interface RatePromptToastHandlers {
  onRate: () => void;
  onDismiss: () => void;
}

// Pure DOM factory: builds a detached, dismissible toast. The caller decides
// when to append it and what the handlers do, keeping this free of side effects.
export const createRatePromptToast = (
  theme: 'light' | 'dark',
  handlers: RatePromptToastHandlers
): HTMLElement => {
  const toast = document.createElement('div');
  toast.id = RATE_PROMPT_TOAST_ID;
  toast.className = `sn-rate-prompt sn-rate-prompt-${theme}`;
  toast.setAttribute('role', 'dialog');
  toast.setAttribute('aria-label', 'Rate Search Navigator');

  const message = document.createElement('span');
  message.className = 'sn-rate-prompt__message';
  message.textContent = 'Enjoying Search Navigator?';

  const actions = document.createElement('div');
  actions.className = 'sn-rate-prompt__actions';

  const rateButton = document.createElement('button');
  rateButton.type = 'button';
  rateButton.className = 'sn-rate-prompt__btn sn-rate-prompt__btn--primary';
  rateButton.textContent = 'Rate ★';
  rateButton.addEventListener('click', handlers.onRate);

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.className = 'sn-rate-prompt__btn';
  dismissButton.textContent = 'Not now';
  dismissButton.addEventListener('click', handlers.onDismiss);

  actions.append(rateButton, dismissButton);
  toast.append(message, actions);
  return toast;
};
