import { useDeferredValue, useMemo, useState, type ChangeEvent } from 'react'
import type { Change } from 'diff'
import { diffLines, diffWordsWithSpace } from 'diff'
import './App.css'

type DiffMode = 'line' | 'word'
type FormatMode = 'highlight' | 'plain'

const INITIAL_LEFT = ``

const INITIAL_RIGHT = ``

type DiffRowKind = 'unchanged' | 'removed' | 'added' | 'modified'

type DiffRow = {
  kind: DiffRowKind
  leftText?: string
  rightText?: string
  leftLineNumber?: number
  rightLineNumber?: number
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n')
}

function splitLinesNoTrailingEmpty(text: string): string[] {
  const normalized = normalizeNewlines(text)
  const segments = normalized.split('\n')
  const lastIndex = segments.length - 1
  if (lastIndex >= 0 && segments[lastIndex] === '') segments.pop()
  return segments
}

function buildAlignedRows(lineDiff: Change[]): DiffRow[] {
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

function formatPlainDiff(changes: Change[]): string[] {
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

function App() {
  const [leftText, setLeftText] = useState(INITIAL_LEFT)
  const [rightText, setRightText] = useState(INITIAL_RIGHT)
  const [diffMode, setDiffMode] = useState<DiffMode>('line')
  const [formatMode, setFormatMode] = useState<FormatMode>('highlight')
  const [status, setStatus] = useState<string>('')
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true)

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

  const handleCopy = async () => {
    if (!plainText) return
    try {
      await navigator.clipboard.writeText(plainText)
      setStatus('Copied diff to clipboard')
    } catch {
      setStatus('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    if (!plainText) return
    const blob = new Blob([plainText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'text-diff.txt'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Downloaded diff as text')
  }

  const handleFileUpload =
    (side: 'left' | 'right') => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      if (side === 'left') {
        setLeftText(text)
      } else {
        setRightText(text)
      }
      setStatus(`Loaded ${file.name}`)
    } catch {
      setStatus('Failed to read file')
    }
  }

  const renderHighlightedLine = (row: DiffRow, side: 'left' | 'right') => {
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

    const cls =
      row.kind === 'unchanged'
        ? 'unchanged'
        : row.kind === 'removed'
          ? side === 'left'
            ? 'removed'
            : 'unchanged'
          : row.kind === 'added'
            ? side === 'right'
              ? 'added'
              : 'unchanged'
            : side === 'left'
              ? 'removed'
              : 'added'

    return <span className={`chunk ${cls}`}>{text}</span>
  }

  const renderPlainLine = (row: DiffRow, side: 'left' | 'right') => {
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

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">Client-side only</p>
            <h1>Compare text differences instantly</h1>
            <p className="lede">
              Paste two blocks of text, choose a diff mode, and see additions,
              removals, and unchanged content highlighted in real time.
            </p>
          </div>
          <div className="stats">
            <div>
              <span className="stat-label">Left</span>
              <span className="stat-value">
                {leftText.length.toLocaleString()} chars
              </span>
            </div>
            <div>
              <span className="stat-label">Right</span>
              <span className="stat-value">
                {rightText.length.toLocaleString()} chars
              </span>
            </div>
            <div>
              <span className="stat-label">Mode</span>
              <span className="stat-value">
                {diffMode === 'line' ? 'Line by line' : 'Word level'}
              </span>
            </div>
          </div>
        </header>

        <section className="input-grid">
          <div className="input-card">
            <div className="input-card__header">
              <span>Original text</span>
              <label className="file-upload-btn" title="Open file">
                📁
                <input
                  type="file"
                  accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv,.log,text/*"
                  onChange={handleFileUpload('left')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className={`textarea-wrapper ${showLineNumbers ? 'with-line-numbers' : ''}`}>
              {showLineNumbers && (
                <div className="line-numbers">
                  {leftText.split('\n').map((_, index) => (
                    <div key={index} className="line-number">{index + 1}</div>
                  ))}
                </div>
              )}
              <textarea
                aria-label="Original text"
                value={leftText}
                onChange={(event) => setLeftText(event.target.value)}
                placeholder="Paste or type the original text here"
              />
            </div>
          </div>
          <div className="input-card">
            <div className="input-card__header">
              <span>Updated text</span>
              <label className="file-upload-btn" title="Open file">
                📁
                <input
                  type="file"
                  accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv,.log,text/*"
                  onChange={handleFileUpload('right')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className={`textarea-wrapper ${showLineNumbers ? 'with-line-numbers' : ''}`}>
              {showLineNumbers && (
                <div className="line-numbers">
                  {rightText.split('\n').map((_, index) => (
                    <div key={index} className="line-number">{index + 1}</div>
                  ))}
                </div>
              )}
              <textarea
                aria-label="Updated text"
                value={rightText}
                onChange={(event) => setRightText(event.target.value)}
                placeholder="Paste or type the updated text here"
              />
            </div>
          </div>
        </section>

        <section className="toolbar">
          <div className="control-group">
            <label htmlFor="mode">Diff mode</label>
            <select
              id="mode"
              value={diffMode}
              onChange={(event) => setDiffMode(event.target.value as DiffMode)}
            >
              <option value="line">Line by line</option>
              <option value="word">Word level</option>
            </select>
          </div>
          <div className="control-group">
            <label>Formatting</label>
            <div className="button-group" role="group" aria-label="Toggle formatting">
              <button
                type="button"
                aria-pressed={formatMode === 'highlight'}
                className={formatMode === 'highlight' ? 'active' : ''}
                onClick={() => setFormatMode('highlight')}
              >
                Highlighted
              </button>
              <button
                type="button"
                aria-pressed={formatMode === 'plain'}
                className={formatMode === 'plain' ? 'active' : ''}
                onClick={() => setFormatMode('plain')}
              >
                Plain text
              </button>
            </div>
          </div>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
              />
              {' '}Line numbers
            </label>
          </div>
          <div className="actions">
            <button type="button" onClick={handleCopy} disabled={!plainText}>
              Copy diff
            </button>
            <button
              type="button"
              className="ghost"
              onClick={handleDownload}
              disabled={!plainText}
            >
              Export as .txt
            </button>
          </div>
        </section>

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
                    <div className={showLineNumbers ? 'with-line-numbers diff-pane__body' : 'diff-pane__body'}>
                      {showLineNumbers && (
                        <div className="line-numbers" aria-hidden="true">
                          {alignedRows.map((row, index) => (
                            <div key={index} className="line-number">
                              {row.leftLineNumber ?? ''}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="diff-content diff-lines" aria-label="Original highlighted lines">
                        {alignedRows.map((row, index) => (
                          <div key={index} className="diff-line">
                            {renderHighlightedLine(row, 'left')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="diff-pane" aria-label="Updated text pane">
                    <div className="diff-pane__label">Updated text</div>
                    <div className={showLineNumbers ? 'with-line-numbers diff-pane__body' : 'diff-pane__body'}>
                      {showLineNumbers && (
                        <div className="line-numbers" aria-hidden="true">
                          {alignedRows.map((row, index) => (
                            <div key={index} className="line-number">
                              {row.rightLineNumber ?? ''}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="diff-content diff-lines" aria-label="Updated highlighted lines">
                        {alignedRows.map((row, index) => (
                          <div key={index} className="diff-line">
                            {renderHighlightedLine(row, 'right')}
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
                    <div className={showLineNumbers ? 'with-line-numbers diff-pane__body' : 'diff-pane__body'}>
                      {showLineNumbers && (
                        <div className="line-numbers" aria-hidden="true">
                          {alignedRows.map((row, index) => (
                            <div key={index} className="line-number">
                              {row.leftLineNumber ?? ''}
                            </div>
                          ))}
                        </div>
                      )}
                      <pre className="diff-content diff-lines" aria-label="Original plain lines">
                        {alignedRows
                          .map((row) => renderPlainLine(row, 'left'))
                          .join('\n')}
                      </pre>
                    </div>
                  </div>

                  <div className="diff-pane" aria-label="Updated text pane">
                    <div className="diff-pane__label">Updated text</div>
                    <div className={showLineNumbers ? 'with-line-numbers diff-pane__body' : 'diff-pane__body'}>
                      {showLineNumbers && (
                        <div className="line-numbers" aria-hidden="true">
                          {alignedRows.map((row, index) => (
                            <div key={index} className="line-number">
                              {row.rightLineNumber ?? ''}
                            </div>
                          ))}
                        </div>
                      )}
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
      </div>
    </div>
  )
}

export default App
