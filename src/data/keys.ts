export type KeyCategory = 'standard' | 'diacritic'

export type KeyItem = {
  id: string
  category: KeyCategory
  label: string
  insert: string
  codePoints: string[]
  position?: 'above' | 'below' | 'bridge'
  description?: string
  aliases?: string[]
}

const pointList = (value: string) => Array.from(value).map((character) => `U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`)

function standardAliases(id: string) {
  const parts = id.split('-')
  const base = parts[0].toLocaleLowerCase('tr-TR')
  const readable = id.replace(/-(upper|lower)$/u, '').replaceAll('-', ' ').toLocaleLowerCase('tr-TR')
  return Array.from(new Set([base, readable, ...parts.slice(1).filter((part) => part !== 'upper' && part !== 'lower')]))
}

const standardValues = [
  ['A-macron-upper', 'Ā'], ['a-macron-lower', 'ā'],
  ['D-line-upper', 'Ḏ'], ['d-line-lower', 'ḏ'],
  ['D-dot-upper', 'Ḍ'], ['d-dot-lower', 'ḍ'],
  ['E-dot-upper', 'Ė'], ['e-dot-lower', 'ė'],
  ['G-dot-upper', 'Ġ'], ['g-dot-lower', 'ġ'],
  ['H-dot-upper', 'Ḥ'], ['h-dot-lower', 'ḥ'],
  ['H-breve-upper', 'Ḫ'], ['h-breve-lower', 'ḫ'],
  ['I-macron-upper', 'Ī'], ['i-macron-lower', 'ī'],
  ['I-dot-macron-upper', 'İ̄'], ['i-dot-macron-lower', 'ı̇̄'],
  ['I-dot-breve-upper', 'İ̆'], ['i-dot-breve-lower', 'ı̇̆'],
  ['K-line-upper', 'Ḳ'], ['k-line-lower', 'ḳ'],
  ['N-tilde-upper', 'Ñ'], ['n-tilde-lower', 'ñ'],
  ['eng', 'ŋ'], ['n-tie-g', 'n͡g'],
  ['O-macron-upper', 'Ō'], ['o-macron-lower', 'ō'],
  ['S-line-upper', 'S̠'], ['s-line-lower', 's̠'],
  ['S-dot-upper', 'Ṣ'], ['s-dot-lower', 'ṣ'],
  ['T-line-upper', 'Ṯ'], ['t-line-lower', 'ṯ'],
  ['T-dot-upper', 'Ṭ'], ['t-dot-lower', 'ṭ'],
  ['U-macron-upper', 'Ū'], ['u-macron-lower', 'ū'],
  ['V-dot-upper', 'V̇'], ['v-dot-lower', 'v̇'],
  ['Z-acute-upper', 'Ż'], ['z-acute-lower', 'ż'],
  ['Z-dot-upper', 'Ẓ'], ['z-dot-lower', 'ẓ'],
  ['Z-line-upper', 'Ẕ'], ['z-line-lower', 'ẕ'],
  ['ayn', 'ʿ'], ['hamza', 'ʾ'],
] as const

const diacriticValues = [
  ['macron', '◌̄', '̄', 'above'],
  ['breve', '◌̆', '̆', 'above'],
  ['caron', '◌̌', '̌', 'above'],
  ['acute', '◌́', '́', 'above'],
  ['grave', '◌̀', '̀', 'above'],
  ['diaeresis', '◌̈', '̈', 'above'],
  ['dot-above', '◌̇', '̇', 'above'],
  ['ring-above', '◌̊', '̊', 'above'],
  ['vertical-line-above', '◌̍', '̍', 'above'],
  ['macron-below', '◌̠', '̠', 'below'],
  ['diaeresis-below', '◌̤', '̤', 'below'],
  ['dot-below', '◌̣', '̣', 'below'],
  ['ring-below', '◌̥', '̥', 'below'],
  ['syllabic', '◌̩', '̩', 'below'],
  ['tie-above', '◌͡◌', '͡', 'bridge'],
  ['tie-below', '◌͜◌', '͜', 'bridge'],
] as const

export const standardKeys: KeyItem[] = standardValues.map(([id, insert]) => ({
  id,
  category: 'standard',
  label: insert,
  insert,
  codePoints: pointList(insert),
  aliases: standardAliases(id),
  description: id === 'ayn' ? 'Ayn transliterasyonu; tırnak işareti değildir' : id === 'hamza' ? 'Hemze transliterasyonu; tırnak işareti değildir' : undefined,
}))

export const diacriticKeys: KeyItem[] = diacriticValues.map(([id, label, insert, position]) => ({
  id,
  category: 'diacritic',
  label,
  insert,
  codePoints: pointList(insert),
  position,
  description: `Birleştirici işaret · ${id.replaceAll('-', ' ')}`,
  aliases: [id.replaceAll('-', ' '), ...id.split('-')],
}))

export const allKeys = [...standardKeys, ...diacriticKeys]

export const keyById = new Map(allKeys.map((key) => [key.id, key]))

export const uppercaseKeys = standardKeys.filter((key) => key.id.endsWith('-upper'))
export const lowercaseKeys = standardKeys.filter((key) => key.id.endsWith('-lower'))
export const specialKeys = standardKeys.filter((key) => !key.id.endsWith('-upper') && !key.id.endsWith('-lower'))

// Shared characters do not have a case. They are visible in both case views
// and remain available in the dedicated Özel view.
export const uppercasePaletteKeys = [...uppercaseKeys, ...specialKeys]
export const lowercasePaletteKeys = [...lowercaseKeys, ...specialKeys]

export function keyForCase(key: KeyItem, target: 'upper' | 'lower') {
  if (key.category !== 'standard') return key
  const suffix = target === 'upper' ? '-upper' : '-lower'
  if (key.id.endsWith(suffix)) return key
  if (!key.id.endsWith('-upper') && !key.id.endsWith('-lower')) return key
  const parts = key.id.split('-')
  const sourceSuffix = parts.pop()
  const base = parts.shift()
  if (!sourceSuffix || !base) return key
  const counterpartBase = target === 'upper' ? base.toUpperCase() : base.toLowerCase()
  const counterpartId = [counterpartBase, ...parts, target].join('-')
  return keyById.get(counterpartId) ?? key
}
