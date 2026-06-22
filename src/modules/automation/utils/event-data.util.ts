export function getEventDataString(eventData: Record<string, unknown>, key: string): string {
  const value = eventData[key];
  return typeof value === 'string' ? value : '';
}
