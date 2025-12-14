import { describe, it, expect } from 'vitest'
import { normalizeNewlines, splitLinesNoTrailingEmpty } from '../../utils/textUtils'

describe('textUtils', () => {
  describe('normalizeNewlines', () => {
    it('should convert CRLF to LF', () => {
      expect(normalizeNewlines('hello\r\nworld')).toBe('hello\nworld')
    })

    it('should leave LF unchanged', () => {
      expect(normalizeNewlines('hello\nworld')).toBe('hello\nworld')
    })

    it('should handle multiple CRLF', () => {
      expect(normalizeNewlines('line1\r\nline2\r\nline3')).toBe('line1\nline2\nline3')
    })

    it('should handle empty string', () => {
      expect(normalizeNewlines('')).toBe('')
    })
  })

  describe('splitLinesNoTrailingEmpty', () => {
    it('should split lines by newline', () => {
      expect(splitLinesNoTrailingEmpty('line1\nline2\nline3')).toEqual([
        'line1',
        'line2',
        'line3',
      ])
    })

    it('should remove trailing empty line', () => {
      expect(splitLinesNoTrailingEmpty('line1\nline2\n')).toEqual(['line1', 'line2'])
    })

    it('should handle CRLF', () => {
      expect(splitLinesNoTrailingEmpty('line1\r\nline2\r\n')).toEqual(['line1', 'line2'])
    })

    it('should handle single line', () => {
      expect(splitLinesNoTrailingEmpty('single')).toEqual(['single'])
    })

    it('should handle empty string', () => {
      expect(splitLinesNoTrailingEmpty('')).toEqual([])
    })

    it('should keep empty lines in the middle', () => {
      expect(splitLinesNoTrailingEmpty('line1\n\nline3')).toEqual(['line1', '', 'line3'])
    })
  })
})
