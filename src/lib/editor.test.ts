import { describe, expect, it } from 'vitest'
import { keyById, keyForCase } from '../data/keys'
import { applyDiacritic, applyDiacriticRepeated, applyDiacriticToSelection, countCodePoints, countGraphemes, countLines, countParagraphs, countWords, insertAtSelection } from './editor'
import { getDiacriticShortcut, getDiacriticShortcutCode } from './shortcuts'

describe('Unicode editor operations', () => {
  it('inserts a multi-codepoint sequence at the cursor', () => {
    const result = insertAtSelection('Türk', { start: 4, end: 4 }, 'n͡g')
    expect(result.text).toBe('Türkn͡g')
    expect(result.selection.start).toBe('Türkn͡g'.length)
  })

  it('applies a mark to the previous grapheme', () => {
    const result = applyDiacritic('ḳa', { start: 2, end: 2 }, '̄')
    expect(result.text).toBe('ḳā')
  })

  it('applies a mark to one selected grapheme without replacing it', () => {
    const result = applyDiacritic('abc', { start: 1, end: 2 }, '̄')
    expect(result.text).toBe('ab̄c')
  })

  it('applies a mark to every grapheme in a selection', () => {
    const result = applyDiacriticToSelection('aaa aa', { start: 0, end: 6 }, '̄')
    expect(result.text).toBe('āāā āā')
  })

  it('stacks a repeated mark on every selected grapheme and keeps the selection', () => {
    const result = applyDiacriticRepeated('aaa', { start: 0, end: 3 }, '̄', 2)
    expect(result.text).toBe('ā̄ā̄ā̄')
    expect(result.selection).toEqual({ start: 0, end: 9 })
    expect(result.text).not.toContain('�')
  })

  it('stacks a repeated mark at a collapsed cursor', () => {
    const result = applyDiacriticRepeated('a', { start: 1, end: 1 }, '͡', 3)
    expect(result.text).toBe('a͡͡͡')
    expect(result.selection).toEqual({ start: 4, end: 4 })
  })

  it('counts visible graphemes and code points separately', () => {
    expect(countGraphemes('n͡g ḳ̄')).toBe(4)
    expect(countCodePoints('n͡g ḳ̄')).toBe(6)
  })

  it('counts words and blank-line paragraphs', () => {
    const text = 'Türük bodunıŋ\n\nilig bodunıŋ üze'
    expect(countWords(text)).toBe(5)
    expect(countParagraphs(text)).toBe(2)
    expect(countLines(text)).toBe(3)
  })

  it('maps case variants when catalogue ids use different base-case letters', () => {
    expect(keyForCase(keyById.get('A-macron-upper')!, 'lower').insert).toBe('ā')
    expect(keyForCase(keyById.get('d-dot-lower')!, 'upper').insert).toBe('Ḍ')
    expect(keyForCase(keyById.get('I-dot-macron-upper')!, 'lower').insert).toBe('ı̇̄')
  })

  it('maps numeric diacritic shortcuts in visual row order', () => {
    expect(getDiacriticShortcut('11', keyById)?.id).toBe('macron')
    expect(getDiacriticShortcut('1q', keyById)?.id).toBe('acute')
    expect(getDiacriticShortcut('1c', keyById)?.id).toBe('vertical-line-above')
    expect(getDiacriticShortcut('2q', keyById)?.id).toBe('macron-below')
    expect(getDiacriticShortcut('2s', keyById)?.id).toBe('syllabic')
    expect(getDiacriticShortcut('31', keyById)?.id).toBe('tie-above')
    expect(getDiacriticShortcut('32', keyById)?.id).toBe('tie-below')
    expect(getDiacriticShortcutCode('macron')).toBe('11')
    expect(getDiacriticShortcutCode('ring-below')).toBe('2a')
  })
})
