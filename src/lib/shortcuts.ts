import type { KeyItem } from '../data/keys'

/**
 * Keyboard sequences for the three diacritic rows.
 *
 * The sequence is typed after the target grapheme. The first key chooses the
 * row, and the second key chooses the item in that row. The catalogue order
 * is the visual order in each row.
 */
export const DIACRITIC_SHORTCUT_IDS: Readonly<Record<string, string>> = {
  '11': 'macron',
  '12': 'breve',
  '13': 'caron',
  '1q': 'acute',
  '1w': 'grave',
  '1e': 'diaeresis',
  '1z': 'dot-above',
  '1x': 'ring-above',
  '1c': 'vertical-line-above',
  '2q': 'macron-below',
  '2w': 'diaeresis-below',
  '2e': 'dot-below',
  '2a': 'ring-below',
  '2s': 'syllabic',
  '31': 'tie-above',
  '32': 'tie-below',
}

export const DIACRITIC_SHORTCUTS_BY_ID: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(DIACRITIC_SHORTCUT_IDS).map(([shortcut, id]) => [id, shortcut]),
)

export function getDiacriticShortcut(sequence: string, keysById: ReadonlyMap<string, KeyItem>) {
  const id = DIACRITIC_SHORTCUT_IDS[sequence.toLocaleLowerCase('en-US')]
  return id ? keysById.get(id) : undefined
}

export function getDiacriticShortcutCode(id: string) {
  return DIACRITIC_SHORTCUTS_BY_ID[id]
}
