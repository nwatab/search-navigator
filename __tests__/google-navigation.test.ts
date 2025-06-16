import { getGoogleSearchTabType } from '../src/services';

describe('getGoogleSearchTabType', () => {
  it('should return null when no search query is present', () => {
    const urlSearchParams = new URLSearchParams('');
    expect(getGoogleSearchTabType(urlSearchParams)).toBeNull();
  });
  it('should return "all" for all tab', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('all');
  });
  it('should return "image" for image tab', () => {
    const urlSearchParams = new URLSearchParams(
      'q=dummy+search+query&tbm=isch'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('image');
  });
  it('should return "videos" for videos tab', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&udm=7');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('videos');
  });
  it('should return "news" for news tab', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&tbm=nws');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('news');
  });
  it('should return "shopping" for shopping tab', () => {
    const urlSearchParams = new URLSearchParams(
      'q=dummy+search+query&tbm=shop'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('shopping');
  });

  // Additional edge cases and comprehensive testing
  it('should return "image" for UDM image search (udm=2)', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&udm=2');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('image');
  });

  it('should return "news" for UDM news search (udm=12)', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&udm=12');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('news');
  });

  it('should return "shopping" for UDM shopping search (udm=28)', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&udm=28');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('shopping');
  });

  it('should return null for unsupported UDM values', () => {
    const urlSearchParams = new URLSearchParams('q=dummy+search+query&udm=99');
    expect(getGoogleSearchTabType(urlSearchParams)).toBeNull();
  });

  it('should return null for unsupported TBM values', () => {
    const urlSearchParams = new URLSearchParams(
      'q=dummy+search+query&tbm=unknown'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBeNull();
  });

  it('should prioritize TBM over UDM when both are present', () => {
    const urlSearchParams = new URLSearchParams(
      'q=dummy+search+query&tbm=isch&udm=7'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('image');
  });

  it('should handle empty query parameter', () => {
    const urlSearchParams = new URLSearchParams('q=');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('all');
  });

  it('should handle complex query with special characters', () => {
    const urlSearchParams = new URLSearchParams('q=hello+world%21&tbm=nws');
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('news');
  });

  it('should handle multiple parameters with tbm', () => {
    const urlSearchParams = new URLSearchParams(
      'q=test&tbm=vid&start=10&num=20'
    );
    expect(getGoogleSearchTabType(urlSearchParams)).toBe('videos');
  });

  it('should handle case sensitivity correctly', () => {
    // TBM values should be case-sensitive
    const urlSearchParams = new URLSearchParams('q=test&tbm=ISCH');
    expect(getGoogleSearchTabType(urlSearchParams)).toBeNull();
  });
});
