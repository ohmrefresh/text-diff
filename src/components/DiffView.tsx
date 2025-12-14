import { diffWordsWithSpace } from 'diff'
import type { DiffRow, DiffMode, FormatMode } from '../types'

type DiffViewProps = {
  alignedRows: DiffRow[]
  diffMode: DiffMode
  formatMode: FormatMode
  hasChanges: boolean
  status: string
}

function getDiffRowClass(kind: DiffRow['kind'], side: 'left' | 'right'): string {
  if (kind === 'unchanged') {
    return 'unchanged'
  } else if (kind === 'removed') {
    return side === 'left' ? 'removed' : 'unchanged'
  } else if (kind === 'added') {
    return side === 'right' ? 'added' : 'unchanged'
  } else {
    // kind === 'modified'
    return side === 'left' ? 'removed' : 'added'
  }
}

function renderHighlightedLine(row: DiffRow, side: 'left' | 'right', diffMode: DiffMode) {
  const text = side === 'left' ? row.leftText : row.rightText
  if (text == null) return <span className="chunk unchanged"></span>

  if (
    diffMode === 'word' &&
    row.kind === 'modified' &&
    row.leftText != null &&
    row.rightText != null
  ) {
    const wordChanges = diffWordsWithSpace(row.leftText, row.rightText)
    return wordChanges
      .map((part, index) => {
        if (side === 'left' && part.added) return null
        if (side === 'right' && part.removed) return null
        const cls = part.added ? 'added' : part.removed ? 'removed' : 'unchanged'
        return (
          <span key={index} className={`chunk ${cls}`}>
            {part.value}
          </span>
        )
      })
      .filter(Boolean)
  }

  const cls = getDiffRowClass(row.kind, side)

  return <span className={`chunk ${cls}`}>{text}</span>
}

function renderPlainLine(row: DiffRow, side: 'left' | 'right') {
  const text = side === 'left' ? row.leftText : row.rightText
  if (text == null) return ''

  const prefix =
    side === 'left'
      ? row.kind === 'removed' || row.kind === 'modified'
        ? '-'
        : ' '
      : row.kind === 'added' || row.kind === 'modified'
        ? '+'
        : ' '

  return `${prefix} ${text}`
}

export function DiffView({ alignedRows, diffMode, formatMode, hasChanges, status }: DiffViewProps) {
  return (
    <section className="diff-card" aria-live="polite">
      <div className="diff-card__header">
        <div>
          <p className="eyebrow">Diff result</p>
          <h2>{hasChanges ? 'Changes detected' : 'No changes detected'}</h2>
          <p className="muted">
            Switch between highlighted and plain views. Use the buttons to
            copy or export.
          </p>
        </div>
        {status ? <div className="status">{status}</div> : null}
      </div>

      {formatMode === 'highlight' ? (
        <div className="diff-output highlighted" aria-label="Highlighted diff view">
          {alignedRows.length === 0 ? (
            <p className="placeholder">Start typing above to see the differences.</p>
          ) : (
            <div className="diff-split" aria-label="Split diff panes">
              <div className="diff-pane" aria-label="Original text pane">
                <div className="diff-pane__label">Original text</div>
                <div className="diff-pane__body">
                  <div className="diff-content diff-lines" aria-label="Original highlighted lines">
                    {alignedRows.map((row, index) => (
                      <div key={index} className="diff-line">
                        {renderHighlightedLine(row, 'left', diffMode)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="diff-pane" aria-label="Updated text pane">
                <div className="diff-pane__label">Updated text</div>
                <div className="diff-pane__body">
                  <div className="diff-content diff-lines" aria-label="Updated highlighted lines">
                    {alignedRows.map((row, index) => (
                      <div key={index} className="diff-line">
                        {renderHighlightedLine(row, 'right', diffMode)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="diff-output plain" aria-label="Plain text diff">
          {alignedRows.length ? (
            <div className="diff-split" aria-label="Split plain diff panes">
              <div className="diff-pane" aria-label="Original text pane">
                <div className="diff-pane__label">Original text</div>
                <div className="diff-pane__body">
                  <pre className="diff-content diff-lines" aria-label="Original plain lines">
                    {alignedRows
                      .map((row) => renderPlainLine(row, 'left'))
                      .join('\n')}
                  </pre>
                </div>
              </div>

              <div className="diff-pane" aria-label="Updated text pane">
                <div className="diff-pane__label">Updated text</div>
                <div className="diff-pane__body">
                  <pre className="diff-content diff-lines" aria-label="Updated plain lines">
                    {alignedRows
                      .map((row) => renderPlainLine(row, 'right'))
                      .join('\n')}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            'Start typing above to see the differences.'
          )}
        </div>
      )}
    </section>
  )
}
