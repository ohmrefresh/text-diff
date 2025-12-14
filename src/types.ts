import type { Change } from 'diff'

export type DiffMode = 'line' | 'word'
export type FormatMode = 'highlight' | 'plain'

export type DiffRowKind = 'unchanged' | 'removed' | 'added' | 'modified'

export type DiffRow = {
  kind: DiffRowKind
  leftText?: string
  rightText?: string
  leftLineNumber?: number
  rightLineNumber?: number
}

export type { Change }
