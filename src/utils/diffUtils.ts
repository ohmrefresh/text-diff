import type { Change } from 'diff'
import type { DiffRow } from '../types'
import { splitLinesNoTrailingEmpty } from './textUtils'

export function buildAlignedRows(lineDiff: Change[]): DiffRow[] {
  const rows: DiffRow[] = []

  let pendingRemoved: string[] = []
  let pendingAdded: string[] = []
  let leftLineNumber = 1
  let rightLineNumber = 1

  const flushPending = () => {
    if (pendingRemoved.length === 0 && pendingAdded.length === 0) return
    const max = Math.max(pendingRemoved.length, pendingAdded.length)
    for (let i = 0; i < max; i += 1) {
      const leftText = pendingRemoved[i]
      const rightText = pendingAdded[i]
      if (leftText != null && rightText != null) {
        rows.push({
          kind: 'modified',
          leftText,
          rightText,
          leftLineNumber: leftLineNumber++,
          rightLineNumber: rightLineNumber++,
        })
      } else if (leftText != null) {
        rows.push({
          kind: 'removed',
          leftText,
          leftLineNumber: leftLineNumber++,
        })
      } else if (rightText != null) {
        rows.push({
          kind: 'added',
          rightText,
          rightLineNumber: rightLineNumber++,
        })
      }
    }

    pendingRemoved = []
    pendingAdded = []
  }

  lineDiff.forEach((part) => {
    const lines = splitLinesNoTrailingEmpty(part.value)
    if (part.removed) {
      pendingRemoved.push(...lines)
      return
    }
    if (part.added) {
      pendingAdded.push(...lines)
      return
    }

    flushPending()
    lines.forEach((line) => {
      rows.push({
        kind: 'unchanged',
        leftText: line,
        rightText: line,
        leftLineNumber: leftLineNumber++,
        rightLineNumber: rightLineNumber++,
      })
    })
  })

  flushPending()
  return rows
}

export function formatPlainDiff(changes: Change[]): string[] {
  const lines: string[] = []

  changes.forEach((part) => {
    const prefix = part.added ? '+' : part.removed ? '-' : ' '
    const normalized = part.value.replace(/\r\n/g, '\n')
    const segments = normalized.split('\n')

    segments.forEach((line, index) => {
      const isTrailingEmpty = index === segments.length - 1 && line === ''
      if (isTrailingEmpty) return
      lines.push(`${prefix} ${line}`)
    })
  })

  return lines.length ? lines : ['No differences']
}
