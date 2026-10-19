/** True on macOS and iOS, where the command key is Cmd rather than Ctrl. */
export function isApple(): boolean {
  if (typeof navigator === 'undefined') return false;
  const data = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = data?.platform || navigator.platform || navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** "Cmd" on Apple machines, "Ctrl" elsewhere. */
export function modKeyName(): 'Cmd' | 'Ctrl' {
  return isApple() ? 'Cmd' : 'Ctrl';
}
