/**
 * Utility to check if a string contains Telugu script characters.
 */
export function isTeluguText(text: string | null | undefined): boolean {
  if (!text) return false;
  // Unicode range for Telugu script: \u0C00-\u0C7F
  const teluguRegex = /[\u0C00-\u0C7F]/;
  return teluguRegex.test(text);
}
