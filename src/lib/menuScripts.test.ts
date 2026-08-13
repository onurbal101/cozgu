import { describe, expect, it } from 'vitest'
import { applyMenuScript, menuScriptLabel, toCyrillic, toLatin } from './menuScripts'

describe('menu-only script display', () => {
  it('transliterates Latin menu labels to a Cyrillic display form', () => {
    expect(toCyrillic('Dosya')).toBe('Досйа')
    expect(applyMenuScript('Düzenle', 'cyrillic')).toBe('Дүзенле')
  })

  it('transliterates Cyrillic menu labels back to Latin', () => {
    expect(toLatin('Файл')).toBe('Fayl')
    expect(toLatin('Досйа')).toBe('Dosya')
  })

  it('keeps native display unchanged and exposes stable selector labels', () => {
    expect(applyMenuScript('Dosya', 'native')).toBe('Dosya')
    expect(menuScriptLabel('tr', 'native')).toBe('Yerel')
    expect(menuScriptLabel('en', 'cyrillic')).toBe('Cyrillic')
  })
})
