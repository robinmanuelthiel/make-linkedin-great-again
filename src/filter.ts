export function getBannedWordPattern(word: string): RegExp {
  return new RegExp(`((^|\\s|["'])|#)${word}(\\s|$|[\\s.,!?;]|\\W)`, 'gi');
}
