import { describe, expect, it } from 'vitest'
import { applyMenuScript, isNativeMenuScript, menuScriptLabel, nativeMenuScript, normalizeMenuScript, toCyrillic, toLatin } from './menuScripts'

describe('menu-only script display', () => {
  it('transliterates Latin menu labels to a Cyrillic display form', () => {
    expect(toCyrillic('Dosya')).toBe('Досйа')
    expect(applyMenuScript('Düzenle', 'cyrillic')).toBe('Дүзенле')
  })

  it('transliterates Cyrillic menu labels back to Latin', () => {
    expect(toLatin('Файл')).toBe('Fayl')
    expect(toLatin('Досйа')).toBe('Dosya')
  })

  it('uses safe language-specific Latin and Cyrillic display pairs', () => {
    expect(toCyrillic('Əli', 'az')).toBe('Әли')
    expect(toCyrillic('G‘ozal', 'uz')).toBe('Ғозал')
    expect(toLatin('Қазақ', 'kk')).toBe('Qazaq')
  })

  it('uses concrete script options and migrates the old native value', () => {
    expect(applyMenuScript('Dosya', 'latin')).toBe('Dosya')
    expect(menuScriptLabel('tr', 'latin')).toBe('Latin')
    expect(menuScriptLabel('en', 'cyrillic')).toBe('Kiril')
    expect(nativeMenuScript('tr')).toBe('latin')
    expect(nativeMenuScript('kk')).toBe('cyrillic')
    expect(normalizeMenuScript('native', 'tr')).toBe('latin')
    expect(normalizeMenuScript('native', 'kk')).toBe('cyrillic')
    expect(isNativeMenuScript('tr', 'latin')).toBe(true)
    expect(isNativeMenuScript('tr', 'cyrillic')).toBe(false)
  })

  it('keeps technical terms unchanged while converting surrounding labels', () => {
    expect(applyMenuScript('Normalleştirme · NFC · Shift · grave · acute · Kiril', 'cyrillic')).toBe('Нормаллештирме · NFC · Shift · grave · acute · Kiril')
  })

  it('converts the status line, palette controls, groups, and accessibility prose', () => {
    expect(applyMenuScript('1 satır, 0 kelime, 0 karakter', 'cyrillic')).toBe('1 сатыр, 0 келиме, 0 карактер')
    expect(applyMenuScript('Büyük Küçük Özel Diyakritikler Yıldızla Sık Son A→Z Karakter ara Üstte Altta Bağlayıcı', 'cyrillic')).toBe('Бүйүк Күчүк Өзел Дийакритиклер Йылдызла Сык Сон А→З Карактер ара Үстте Алтта Бағлайыцы')
  })

  it('converts the complete count line, including zero values', () => {
    expect(applyMenuScript('0 satır, 0 kelime, 0 karakter', 'cyrillic', 'tr')).toBe('0 сатыр, 0 келиме, 0 карактер')
  })
})
