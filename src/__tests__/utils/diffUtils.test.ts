import { describe, it, expect } from 'vitest'
import { diffLines } from 'diff'
import { buildAlignedRows, formatPlainDiff } from '../../utils/diffUtils'

describe('diffUtils', () => {
  describe('buildAlignedRows', () => {
    it('should handle unchanged lines', () => {
      const changes = diffLines('line1\nline2', 'line1\nline2')
      const rows = buildAlignedRows(changes)

      expect(rows).toHaveLength(2)
      expect(rows[0]).toMatchObject({
        kind: 'unchanged',
        leftText: 'line1',
        rightText: 'line1',
        leftLineNumber: 1,
        rightLineNumber: 1,
      })
    })

    it('should handle added lines', () => {
      const changes = diffLines('line1', 'line1\nline2')
      const rows = buildAlignedRows(changes)

      expect(rows).toHaveLength(2)
      // Note: diffLines may treat this as a modified block
      expect(rows.some(row => row.rightText === 'line2')).toBe(true)
    })

    it('should handle removed lines', () => {
      const changes = diffLines('line1\nline2', 'line1')
      const rows = buildAlignedRows(changes)

      expect(rows).toHaveLength(2)
      // Note: diffLines may treat this as a modified block
      expect(rows.some(row => row.leftText === 'line2')).toBe(true)
    })

    it('should handle modified lines', () => {
      const changes = diffLines('line1\nline2', 'line1\nmodified')
      const rows = buildAlignedRows(changes)

      expect(rows).toHaveLength(2)
      expect(rows[0].kind).toBe('unchanged')
      expect(rows[1]).toMatchObject({
        kind: 'modified',
        leftText: 'line2',
        rightText: 'modified',
        leftLineNumber: 2,
        rightLineNumber: 2,
      })
    })

    it('should handle empty input', () => {
      const changes = diffLines('', '')
      const rows = buildAlignedRows(changes)

      expect(rows).toHaveLength(0)
    })

    it('should handle multiple changes', () => {
      const changes = diffLines('line1\nline2\nline3', 'line1\nmodified\nline3\nline4')
      const rows = buildAlignedRows(changes)

      expect(rows.length).toBeGreaterThanOrEqual(4)
      // Verify modifications exist
      expect(rows.some(row => row.kind === 'modified' || row.kind === 'added')).toBe(true)
    })
  })

  describe('formatPlainDiff', () => {
    it('should format unchanged lines with space prefix', () => {
      const changes = diffLines('line1', 'line1')
      const formatted = formatPlainDiff(changes)

      expect(formatted).toEqual(['  line1'])
    })

    it('should format added lines with + prefix', () => {
      const changes = diffLines('', 'line1')
      const formatted = formatPlainDiff(changes)

      expect(formatted).toEqual(['+ line1'])
    })

    it('should format removed lines with - prefix', () => {
      const changes = diffLines('line1', '')
      const formatted = formatPlainDiff(changes)

      expect(formatted).toEqual(['- line1'])
    })

    it('should format mixed changes', () => {
      const changes = diffLines('line1\nline2', 'line1\nline3')
      const formatted = formatPlainDiff(changes)

      expect(formatted).toEqual(['  line1', '- line2', '+ line3'])
    })

    it('should return "No differences" for empty input', () => {
      const changes = diffLines('', '')
      const formatted = formatPlainDiff(changes)

      expect(formatted).toEqual(['No differences'])
    })

    it('should handle CRLF line endings', () => {
      const changes = [{ value: 'line1\r\n', added: false, removed: false, count: 1 }]
      const formatted = formatPlainDiff(changes)

      expect(formatted).toEqual(['  line1'])
    })
  })
})
