import type { ChromeStorage } from '../src/services/chrome-storage';
import {
  defaultRatingState,
  getRatingState,
  incrementOpens,
  markDismissed,
  markRated,
  RATE_PROMPT_OPENS_THRESHOLD,
  saveRatingState,
  shouldShowRatePrompt,
  type RatingState,
} from '../src/services/rating-prompt';

describe('rating-prompt pure transitions', () => {
  describe('incrementOpens', () => {
    it('increments while pending and below the threshold', () => {
      expect(incrementOpens({ opens: 0, status: 'pending' })).toEqual({
        opens: 1,
        status: 'pending',
      });
    });

    it('caps at the threshold and returns the same reference (no redundant write)', () => {
      const atCap: RatingState = {
        opens: RATE_PROMPT_OPENS_THRESHOLD,
        status: 'pending',
      };
      expect(incrementOpens(atCap)).toBe(atCap);
    });

    it('does not count once the prompt is resolved', () => {
      const rated: RatingState = { opens: 3, status: 'rated' };
      const dismissed: RatingState = { opens: 3, status: 'dismissed' };
      expect(incrementOpens(rated)).toBe(rated);
      expect(incrementOpens(dismissed)).toBe(dismissed);
    });
  });

  describe('markRated / markDismissed', () => {
    it('sets status without mutating the input', () => {
      const state: RatingState = { opens: 5, status: 'pending' };
      expect(markRated(state)).toEqual({ opens: 5, status: 'rated' });
      expect(markDismissed(state)).toEqual({ opens: 5, status: 'dismissed' });
      expect(state.status).toBe('pending');
    });
  });

  describe('shouldShowRatePrompt', () => {
    it('is true only when pending and at/over the threshold', () => {
      expect(
        shouldShowRatePrompt({
          opens: RATE_PROMPT_OPENS_THRESHOLD,
          status: 'pending',
        })
      ).toBe(true);
    });

    it('is false below the threshold', () => {
      expect(
        shouldShowRatePrompt({
          opens: RATE_PROMPT_OPENS_THRESHOLD - 1,
          status: 'pending',
        })
      ).toBe(false);
    });

    it('is false once rated or dismissed even past the threshold', () => {
      const opens = RATE_PROMPT_OPENS_THRESHOLD + 5;
      expect(shouldShowRatePrompt({ opens, status: 'rated' })).toBe(false);
      expect(shouldShowRatePrompt({ opens, status: 'dismissed' })).toBe(false);
    });
  });
});

describe('rating-prompt storage adapters', () => {
  let mockStorage: jest.Mocked<ChromeStorage>;

  beforeEach(() => {
    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    };
  });

  it('returns defaults when nothing is stored', async () => {
    mockStorage.get.mockResolvedValue({});
    await expect(getRatingState(mockStorage)).resolves.toEqual(
      defaultRatingState
    );
  });

  it('merges stored state over the defaults', async () => {
    mockStorage.get.mockResolvedValue({ rating_state: { opens: 7 } });
    await expect(getRatingState(mockStorage)).resolves.toEqual({
      opens: 7,
      status: 'pending',
    });
  });

  it('persists under the rating_state key', async () => {
    mockStorage.set.mockResolvedValue();
    const state: RatingState = { opens: 2, status: 'pending' };
    await saveRatingState(mockStorage, state);
    expect(mockStorage.set).toHaveBeenCalledWith({ rating_state: state });
  });
});
