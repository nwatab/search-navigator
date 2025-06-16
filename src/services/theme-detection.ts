// Theme detection utilities
export function determineThemeFromRgb(
  rgb: [number, number, number],
  brightnessThreshold: number = 128
): 'light' | 'dark' {
  const [r, g, b] = rgb;
  return r * 299 + g * 587 + b * 114 < brightnessThreshold * 1000
    ? 'dark'
    : 'light';
}
