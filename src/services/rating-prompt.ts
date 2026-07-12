import type { ChromeStorage } from './chrome-storage';

// Chrome Web Store reviews page for this extension.
export const RATE_URL =
  'https://chromewebstore.google.com/detail/fpinaaaiplppifhmkjdfkimodkkdnoha/reviews';

// How many result-opens a user makes before we ask, once, for a rating.
export const RATE_PROMPT_OPENS_THRESHOLD = 15;

const STORAGE_KEY = 'rating_state';

export type RatePromptStatus = 'pending' | 'rated' | 'dismissed';

export interface RatingState {
  readonly opens: number;
  readonly status: RatePromptStatus;
}

export const defaultRatingState: RatingState = { opens: 0, status: 'pending' };

// --- pure state transitions ---

// Count one result-open. Stops once the prompt is resolved or already due, so
// the stored counter (and its sync writes) stay bounded. Returns the same
// reference when nothing changes, so callers can skip a redundant write.
export const incrementOpens = (state: RatingState): RatingState =>
  state.status !== 'pending' || state.opens >= RATE_PROMPT_OPENS_THRESHOLD
    ? state
    : { ...state, opens: state.opens + 1 };

export const markRated = (state: RatingState): RatingState => ({
  ...state,
  status: 'rated',
});

export const markDismissed = (state: RatingState): RatingState => ({
  ...state,
  status: 'dismissed',
});

export const shouldShowRatePrompt = (
  state: RatingState,
  threshold: number = RATE_PROMPT_OPENS_THRESHOLD
): boolean => state.status === 'pending' && state.opens >= threshold;

// --- storage adapters (the only Chrome API seam here) ---

export const getRatingState = async (
  storage: ChromeStorage
): Promise<RatingState> => {
  const stored = await storage.get<{ rating_state?: Partial<RatingState> }>(
    STORAGE_KEY
  );
  return { ...defaultRatingState, ...(stored?.rating_state ?? {}) };
};

export const saveRatingState = (
  storage: ChromeStorage,
  state: RatingState
): Promise<void> => storage.set({ [STORAGE_KEY]: state });
