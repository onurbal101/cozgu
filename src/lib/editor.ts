export type Selection = {
  start: number
  end: number
}

export type TextEdit = {
  text: string
  selection: Selection
}

type Segment = {
  segment: string
  index: number
}

const combiningMark = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/u

export function segmentGraphemes(text: string): Segment[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('tr', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (item) => ({ segment: item.segment, index: item.index }))
  }

  const segments: Segment[] = []
  let index = 0
  for (const character of Array.from(text)) {
    if (combiningMark.test(character) && segments.length > 0) {
      segments[segments.length - 1].segment += character
    } else {
      segments.push({ segment: character, index })
    }
    index += character.length
  }
  return segments
}

export function insertAtSelection(text: string, selection: Selection, insert: string): TextEdit {
  const nextText = `${text.slice(0, selection.start)}${insert}${text.slice(selection.end)}`
  const cursor = selection.start + insert.length
  return { text: nextText, selection: { start: cursor, end: cursor } }
}

/**
 * Add a combining mark one or more times to the selected graphemes.
 *
 * The returned selection stays on the same text range. This matters for a
 * toolbar workflow: a researcher can apply several marks without having to
 * select the text again after every action.
 */
export function applyDiacriticRepeated(text: string, selection: Selection, mark: string, count = 1): TextEdit {
  const repeat = Math.max(0, Math.floor(count))
  if (repeat === 0 || !mark) return { text, selection }
  const marks = mark.repeat(repeat)
  const segments = segmentGraphemes(text)

  if (selection.start !== selection.end) {
    const selected = segments.filter((item, index) => {
      const end = item.index + item.segment.length
      const nextStart = segments[index + 1]?.index ?? text.length
      return item.index < selection.end && nextStart > selection.start && end > selection.start
    })
    const nonWhitespace = selected.filter(({ segment }) => !/\s/u.test(segment))
    if (nonWhitespace.length === 0) return { text, selection }

    const first = selected[0]
    const last = selected[selected.length - 1]
    const rangeStart = first.index
    const rangeEnd = last.index + last.segment.length
    const selectedText = text.slice(rangeStart, rangeEnd)
    const selectedSegments = segmentGraphemes(selectedText)
    const replacement = selectedSegments
      .map(({ segment }) => /\s/u.test(segment) ? segment : `${segment}${marks}`)
      .join('')
    const nextText = `${text.slice(0, rangeStart)}${replacement}${text.slice(rangeEnd)}`
    const addedLength = nonWhitespace.length * marks.length
    return {
      text: nextText,
      selection: { start: selection.start, end: selection.end + addedLength },
    }
  }

  const previous = [...segments].reverse().find((item) => item.index < selection.start)
  if (!previous || /\s/u.test(previous.segment)) return insertAtSelection(text, selection, marks)

  const end = previous.index + previous.segment.length
  const nextText = `${text.slice(0, end)}${marks}${text.slice(end)}`
  const cursor = end + marks.length
  return { text: nextText, selection: { start: cursor, end: cursor } }
}

export function applyDiacritic(text: string, selection: Selection, mark: string): TextEdit {
  return applyDiacriticRepeated(text, selection, mark, 1)
}

export function applyDiacriticToSelection(text: string, selection: Selection, mark: string): TextEdit {
  return applyDiacriticRepeated(text, selection, mark, 1)
}

export function countGraphemes(text: string): number {
  return segmentGraphemes(text).length
}

export function countCodePoints(text: string): number {
  return Array.from(text).length
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/u).length : 0
}

export function countParagraphs(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\n\s*\n/u).filter(Boolean).length : 0
}

export function countLines(text: string): number {
  return text ? text.split('\n').length : 0
}
