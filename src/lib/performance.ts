export function getConnectionSpeed(): 'slow' | 'fast' {
  if (typeof navigator !== 'undefined' && (navigator as any).connection) {
    const downlink = (navigator as any).connection.downlink as number | undefined;
    if (typeof downlink === 'number' && downlink < 1.5) return 'slow';
  }
  return 'fast';
}

export function getAdaptiveVideoQuality(): 'low' | 'high' {
  return getConnectionSpeed() === 'slow' ? 'low' : 'high';
}
