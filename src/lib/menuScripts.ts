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
  { id: 'cyrillic', label: 'Cyrillic' },
]

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

function replaceCharacters(value: string, table: Record<string, string>) {
  return Array.from(value, (character) => table[character] ?? character).join('')
}

export function toCyrillic(value: string) {
  return replaceCharacters(value, latinToCyrillic)
}

export function toLatin(value: string) {
  return replaceCharacters(value, cyrillicToLatin)
}

export function applyMenuScript(value: string, script: MenuScript) {
  if (script === 'cyrillic') return toCyrillic(value)
  if (script === 'latin') return toLatin(value)
  return value
}

export function menuScriptLabel(language: LanguageId, script: MenuScript) {
  if (script === 'native') return language === 'tr' ? 'Yerel' : 'Native'
  return script === 'latin' ? 'Latin' : 'Cyrillic'
}
