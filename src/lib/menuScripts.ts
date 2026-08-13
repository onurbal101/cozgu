import type { LanguageId } from '../i18n'

/**
 * A menu script changes the visible labels in the application menus only.
 * It never changes editor text, palette characters, file names, or exports.
 */
export type MenuScript = 'native' | 'latin' | 'cyrillic'

export type MenuScriptOption = {
  id: MenuScript
  label: string
}

export const MENU_SCRIPT_OPTIONS: MenuScriptOption[] = [
  { id: 'native', label: 'Native' },
  { id: 'latin', label: 'Latin' },
  { id: 'cyrillic', label: 'Kiril' },
]

type ScriptEntry = [string, string]

type ScriptProfile = {
  latinToCyrillic?: ScriptEntry[]
  cyrillicToLatin?: ScriptEntry[]
}

// This is deliberately a small, reversible, display-only transliteration.
// It is useful for a quick script-switching demonstration without claiming
// that a historical alphabet conversion has taken place.
const latinToCyrillic: Record<string, string> = {
  A: 'А', B: 'Б', C: 'Ц', Ç: 'Ч', D: 'Д', E: 'Е', F: 'Ф', G: 'Г', Ğ: 'Ғ', H: 'Х', I: 'Ы', İ: 'И', J: 'Ж', K: 'К', L: 'Л', M: 'М', N: 'Н', O: 'О', Ö: 'Ө', P: 'П', Q: 'Қ', R: 'Р', S: 'С', Ş: 'Ш', T: 'Т', U: 'У', Ü: 'Ү', V: 'В', W: 'В', X: 'Кс', Y: 'Й', Z: 'З',
  a: 'а', b: 'б', c: 'ц', ç: 'ч', d: 'д', e: 'е', f: 'ф', g: 'г', ğ: 'ғ', h: 'х', ı: 'ы', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', ö: 'ө', p: 'п', q: 'қ', r: 'р', s: 'с', ş: 'ш', t: 'т', u: 'у', ü: 'ү', v: 'в', w: 'в', x: 'кс', y: 'й', z: 'з',
}

const cyrillicToLatin: Record<string, string> = {
  А: 'A', Б: 'B', В: 'V', Г: 'G', Ғ: 'Ğ', Д: 'D', Е: 'E', Ё: 'Yo', Ж: 'J', З: 'Z', И: 'İ', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', Ө: 'Ö', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ү: 'Ü', Ф: 'F', Х: 'H', Ц: 'C', Ч: 'Ç', Ш: 'Ş', Щ: 'Şç', Ы: 'I', Э: 'E', Ю: 'Yu', Я: 'Ya', Ъ: '', Ы̆: 'I',
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'ğ', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', ө: 'ö', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'ü', ф: 'f', х: 'h', ц: 'c', ч: 'ç', ш: 'ş', щ: 'şç', ы: 'ı', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '',
}

// These are controlled, menu-only display profiles. They cover the common
// modern Latin/Cyrillic pairs without claiming to convert the user's text.
// Longer entries run before single-character entries, so Uzbek and Uyghur
// digraphs keep their intended display forms.
const scriptProfiles: Partial<Record<LanguageId, ScriptProfile>> = {
  az: {
    latinToCyrillic: [['Ə', 'Ә'], ['ə', 'ә'], ['Q', 'Г'], ['q', 'г'], ['G', 'Ҝ'], ['g', 'ҝ'], ['C', 'Ҹ'], ['c', 'ҹ'], ['H', 'Һ'], ['h', 'һ'], ['X', 'Х'], ['x', 'х'], ['Y', 'Ј'], ['y', 'ј']],
    cyrillicToLatin: [['Ә', 'Ə'], ['ә', 'ə'], ['Г', 'Q'], ['г', 'q'], ['Ҝ', 'G'], ['ҝ', 'g'], ['Ҹ', 'C'], ['ҹ', 'c'], ['Һ', 'H'], ['һ', 'h'], ['Х', 'X'], ['х', 'x'], ['Ј', 'Y'], ['ј', 'y']],
  },
  uz: {
    latinToCyrillic: [['O‘', 'Ў'], ['o‘', 'ў'], ['G‘', 'Ғ'], ['g‘', 'ғ'], ['Sh', 'Ш'], ['sh', 'ш'], ['Ch', 'Ч'], ['ch', 'ч'], ['Yo', 'Ё'], ['yo', 'ё'], ['Yu', 'Ю'], ['yu', 'ю'], ['Ya', 'Я'], ['ya', 'я'], ['Q', 'Қ'], ['q', 'қ'], ['X', 'Х'], ['x', 'х'], ['H', 'Ҳ'], ['h', 'ҳ']],
    cyrillicToLatin: [['Ў', 'O‘'], ['ў', 'o‘'], ['Ғ', 'G‘'], ['ғ', 'g‘'], ['Ш', 'Sh'], ['ш', 'sh'], ['Ч', 'Ch'], ['ч', 'ch'], ['Ё', 'Yo'], ['ё', 'yo'], ['Ю', 'Yu'], ['ю', 'yu'], ['Я', 'Ya'], ['я', 'ya'], ['Қ', 'Q'], ['қ', 'q'], ['Х', 'X'], ['х', 'x'], ['Ҳ', 'H'], ['ҳ', 'h']],
  },
  kk: {
    latinToCyrillic: [['Ä', 'Ә'], ['ä', 'ә'], ['Ğ', 'Ғ'], ['ğ', 'ғ'], ['Q', 'Қ'], ['q', 'қ'], ['Ñ', 'Ң'], ['ñ', 'ң'], ['Ö', 'Ө'], ['ö', 'ө'], ['Ū', 'Ұ'], ['ū', 'ұ'], ['Ü', 'Ү'], ['ü', 'ү'], ['İ', 'І'], ['i', 'і']],
    cyrillicToLatin: [['Ә', 'Ä'], ['ә', 'ä'], ['Ғ', 'Ğ'], ['ғ', 'ğ'], ['Қ', 'Q'], ['қ', 'q'], ['Ң', 'Ñ'], ['ң', 'ñ'], ['Ө', 'Ö'], ['ө', 'ö'], ['Ұ', 'Ū'], ['ұ', 'ū'], ['Ү', 'Ü'], ['ү', 'ü'], ['І', 'İ'], ['і', 'i']],
  },
  tk: {
    latinToCyrillic: [['Ä', 'Ә'], ['ä', 'ә'], ['Ž', 'Ж'], ['ž', 'ж'], ['Ç', 'Ч'], ['ç', 'ч'], ['Ş', 'Ш'], ['ş', 'ш'], ['Ň', 'Ң'], ['ň', 'ң'], ['Ý', 'Й'], ['ý', 'й']],
    cyrillicToLatin: [['Ә', 'Ä'], ['ә', 'ä'], ['Ж', 'Ž'], ['ж', 'ž'], ['Ч', 'Ç'], ['ч', 'ç'], ['Ш', 'Ş'], ['ш', 'ş'], ['Ң', 'Ň'], ['ң', 'ň'], ['Й', 'Ý'], ['й', 'ý']],
  },
  tt: {
    latinToCyrillic: [['Ä', 'Ә'], ['ä', 'ә'], ['Ö', 'Ө'], ['ö', 'ө'], ['Ü', 'Ү'], ['ü', 'ү'], ['C', 'Җ'], ['c', 'җ'], ['Ñ', 'Ң'], ['ñ', 'ң'], ['H', 'Һ'], ['h', 'һ'], ['Q', 'Къ'], ['q', 'къ'], ['X', 'Х'], ['x', 'х'], ['Ğ', 'Гъ'], ['ğ', 'гъ']],
    cyrillicToLatin: [['Ә', 'Ä'], ['ә', 'ä'], ['Ө', 'Ö'], ['ө', 'ö'], ['Ү', 'Ü'], ['ү', 'ü'], ['Җ', 'C'], ['җ', 'c'], ['Ң', 'Ñ'], ['ң', 'ñ'], ['Һ', 'H'], ['һ', 'h'], ['Къ', 'Q'], ['къ', 'q'], ['Х', 'X'], ['х', 'x'], ['Гъ', 'Ğ'], ['гъ', 'ğ']],
  },
  ky: {
    latinToCyrillic: [['Ö', 'Ө'], ['ö', 'ө'], ['Ü', 'Ү'], ['ü', 'ү'], ['Ñ', 'Ң'], ['ñ', 'ң'], ['Ç', 'Ч'], ['ç', 'ч'], ['Ş', 'Ш'], ['ş', 'ш'], ['Y', 'Ы'], ['y', 'ы']],
    cyrillicToLatin: [['Ө', 'Ö'], ['ө', 'ö'], ['Ү', 'Ü'], ['ү', 'ü'], ['Ң', 'Ñ'], ['ң', 'ñ'], ['Ч', 'Ç'], ['ч', 'ç'], ['Ш', 'Ş'], ['ш', 'ş'], ['Ы', 'Y'], ['ы', 'y']],
  },
  ug: {
    latinToCyrillic: [['Gh', 'Ғ'], ['gh', 'ғ'], ['Ng', 'Ң'], ['ng', 'ң'], ['Sh', 'Ш'], ['sh', 'ш'], ['Ch', 'Ч'], ['ch', 'ч'], ['Q', 'Қ'], ['q', 'қ'], ['X', 'Х'], ['x', 'х'], ['H', 'Һ'], ['h', 'һ'], ['J', 'Җ'], ['j', 'җ']],
    cyrillicToLatin: [['Ғ', 'Gh'], ['ғ', 'gh'], ['Ң', 'Ng'], ['ң', 'ng'], ['Ш', 'Sh'], ['ш', 'sh'], ['Ч', 'Ch'], ['ч', 'ch'], ['Қ', 'Q'], ['қ', 'q'], ['Х', 'X'], ['х', 'x'], ['Һ', 'H'], ['һ', 'h'], ['Җ', 'J'], ['җ', 'j']],
  },
  ba: {
    latinToCyrillic: [['Ä', 'Ә'], ['ä', 'ә'], ['Ğ', 'Ғ'], ['ğ', 'ғ'], ['D̦', 'Ҙ'], ['d̦', 'ҙ'], ['Q', 'Ҡ'], ['q', 'ҡ'], ['Ñ', 'Ң'], ['ñ', 'ң'], ['Ö', 'Ө'], ['ö', 'ө'], ['Ş', 'ҫ'], ['ş', 'ҫ'], ['Ü', 'Ү'], ['ü', 'ү'], ['H', 'Һ'], ['h', 'һ'], ['X', 'Х'], ['x', 'х']],
    cyrillicToLatin: [['Ә', 'Ä'], ['ә', 'ä'], ['Ғ', 'Ğ'], ['ғ', 'ğ'], ['Ҙ', 'D̦'], ['ҙ', 'd̦'], ['Ҡ', 'Q'], ['ҡ', 'q'], ['Ң', 'Ñ'], ['ң', 'ñ'], ['Ө', 'Ö'], ['ө', 'ö'], ['ҫ', 'ş'], ['Ү', 'Ü'], ['ү', 'ü'], ['Һ', 'H'], ['һ', 'h'], ['Х', 'X'], ['х', 'x']],
  },
}

// Keep stable technical names readable in every menu script. These are labels
// and notation, not prose: NFC/NFD, keyboard shortcuts, script names, and
// diacritic names such as grave and acute must not become transliterations.
const technicalTermPattern = /NFC|NFD|Caps Lock|Shift|QQ|Latin|Kiril|Cyrillic|Native|Unicode|grave|acute|breve|caron|macron(?:-below)?|diaeresis(?:-below)?|dot-(?:above|below)|ring-(?:above|below)|vertical-line-above|tie-(?:above|below)|syllabic|U\+[0-9A-F]+/giu

function applyWithProtectedTechnicalTerms(value: string, transform: (input: string) => string) {
  const protectedTerms: string[] = []
  const masked = value.replace(technicalTermPattern, (term) => {
    const index = protectedTerms.push(term) - 1
    return `\uE000${index}\uE001`
  })
  return transform(masked).replace(/\uE000(\d+)\uE001/gu, (_, index: string) => protectedTerms[Number(index)] ?? '')
}

function replaceCharacters(value: string, table: Record<string, string>) {
  return Array.from(value, (character) => table[character] ?? character).join('')
}

function replaceEntries(value: string, entries: ScriptEntry[]) {
  return entries
    .slice()
    .sort(([left], [right]) => right.length - left.length)
    .reduce((result, [from, to]) => result.split(from).join(to), value)
}

export function toCyrillic(value: string, language: LanguageId = 'tr') {
  const profile = scriptProfiles[language]
  const profileEntries = profile?.latinToCyrillic ?? []
  const profileValue = replaceEntries(value, profileEntries)
  return replaceCharacters(profileValue, latinToCyrillic)
}

export function toLatin(value: string, language: LanguageId = 'tr') {
  const profile = scriptProfiles[language]
  const profileEntries = profile?.cyrillicToLatin ?? []
  const profileValue = replaceEntries(value, profileEntries)
  return replaceCharacters(profileValue, cyrillicToLatin)
}

export function applyMenuScript(value: string, script: MenuScript, language: LanguageId = 'tr') {
  if (script === 'cyrillic') return applyWithProtectedTechnicalTerms(value, (input) => toCyrillic(input, language))
  if (script === 'latin') return applyWithProtectedTechnicalTerms(value, (input) => toLatin(input, language))
  return value
}

export function menuScriptLabel(language: LanguageId, script: MenuScript) {
  if (script === 'native') return language === 'tr' ? 'Yerel' : 'Native'
  return script === 'latin' ? 'Latin' : 'Kiril'
}
