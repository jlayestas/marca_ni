// Spanish phonetic normalization — collapses common spelling variants so
// trigram similarity sees "Koka" and "Coca" as the same token.
// Rules are ordered so multi-char patterns are replaced before single-char ones.

const RULES: [RegExp, string][] = [
  // Multi-char first
  [/PH/g, 'F'],
  [/QU/g, 'K'],
  [/GU(?=[EI])/g, 'G'],   // GUE/GUI → GE/GI
  [/LL/g, 'Y'],
  [/CH/g, 'X'],
  [/RR/g, 'R'],
  [/TZ/g, 'S'],
  [/TS/g, 'S'],

  // Single-char
  [/K/g, 'C'],
  [/W/g, 'V'],
  [/Z/g, 'S'],
  [/X(?=[AEIOU])/g, 'S'], // X at start of syllable sounds like S in Spanish
  [/Y(?![AEIOU])/g, 'I'], // Y as vowel
  [/V/g, 'B'],
  [/H/g, ''],              // Silent H
  [/Ñ/g, 'N'],
  [/Ü/g, 'U'],
]

export function phoneticNormalize(text: string): string {
  let s = text.toUpperCase()
  for (const [pattern, replacement] of RULES) {
    s = s.replace(pattern, replacement)
  }
  return s
}
