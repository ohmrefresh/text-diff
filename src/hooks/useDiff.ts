import { useDeferredValue, useMemo } from 'react'
import { diffLines } from 'diff'
import type { Change } from '../types'
import { normalizeNewlines } from '../utils/textUtils'
import { buildAlignedRows, formatPlainDiff } from '../utils/diffUtils'

export function useDiff(leftText: string, rightText: string) {
  const deferredLeft = useDeferredValue(leftText)
  const deferredRight = useDeferredValue(rightText)

  const lineDiff = useMemo<Change[]>(() => {
    if (!deferredLeft && !deferredRight) return []
    return diffLines(normalizeNewlines(deferredLeft), normalizeNewlines(deferredRight))
  }, [deferredLeft, deferredRight])

  const alignedRows = useMemo(() => buildAlignedRows(lineDiff), [lineDiff])

  const plainLines = useMemo(() => formatPlainDiff(lineDiff), [lineDiff])
  const plainText = useMemo(() => plainLines.join('\n'), [plainLines])
  const hasChanges = lineDiff.some((change) => change.added || change.removed)

  return {
    lineDiff,
    alignedRows,
    plainText,
    hasChanges,
  }
}
