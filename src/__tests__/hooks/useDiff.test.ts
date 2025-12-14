import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDiff } from '../../hooks/useDiff'

describe('useDiff', () => {
  it('should return empty arrays for empty input', () => {
    const { result } = renderHook(() => useDiff('', ''))

    expect(result.current.alignedRows).toEqual([])
    expect(result.current.plainText).toBe('No differences')
    expect(result.current.hasChanges).toBe(false)
  })

  it('should detect no changes for identical text', () => {
    const { result } = renderHook(() => useDiff('line1\nline2', 'line1\nline2'))

    expect(result.current.hasChanges).toBe(false)
    expect(result.current.alignedRows).toHaveLength(2)
    expect(result.current.alignedRows[0].kind).toBe('unchanged')
  })

  it('should detect added lines', () => {
    const { result } = renderHook(() => useDiff('line1', 'line1\nline2'))

    expect(result.current.hasChanges).toBe(true)
    expect(result.current.alignedRows).toHaveLength(2)
    // diffLines treats this differently - checks that there IS a difference detected
    expect(result.current.alignedRows.some(row => row.kind !== 'unchanged')).toBe(true)
  })

  it('should detect removed lines', () => {
    const { result } = renderHook(() => useDiff('line1\nline2', 'line1'))

    expect(result.current.hasChanges).toBe(true)
    expect(result.current.alignedRows).toHaveLength(2)
    // diffLines treats this differently - checks that there IS a difference detected
    expect(result.current.alignedRows.some(row => row.kind !== 'unchanged')).toBe(true)
  })

  it('should detect modified lines', () => {
    const { result } = renderHook(() => useDiff('line1\nline2', 'line1\nmodified'))

    expect(result.current.hasChanges).toBe(true)
    expect(result.current.alignedRows).toHaveLength(2)
    // diffLines treats this as removal + addition (modified)
    expect(result.current.alignedRows[1].kind).toBe('modified')
  })

  it('should generate plain text output', () => {
    const { result } = renderHook(() => useDiff('line1', 'line2'))

    expect(result.current.plainText).toContain('line1')
    expect(result.current.plainText).toContain('line2')
  })

  it('should update when input changes', () => {
    const { result, rerender } = renderHook(
      ({ left, right }) => useDiff(left, right),
      { initialProps: { left: 'old', right: 'old' } }
    )

    expect(result.current.hasChanges).toBe(false)

    rerender({ left: 'old', right: 'new' })

    expect(result.current.hasChanges).toBe(true)
  })
})
