import { useDeferredValue, useMemo, useState } from 'react'
import type { Change } from 'diff'
import { diffLines, diffWordsWithSpace } from 'diff'
import './App.css'

type DiffMode = 'line' | 'word'
type FormatMode = 'highlight' | 'plain'

const INITIAL_LEFT = ``

const INITIAL_RIGHT = ``

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

  const diffResult = useMemo<Change[]>(() => {
    if (!deferredLeft && !deferredRight) return []

    return diffMode === 'line'
      ? diffLines(deferredLeft, deferredRight)
      : diffWordsWithSpace(deferredLeft, deferredRight)
  }, [deferredLeft, deferredRight, diffMode])

  const plainLines = useMemo(() => formatPlainDiff(diffResult), [diffResult])
  const plainText = useMemo(() => plainLines.join('\n'), [plainLines])
  const hasChanges = diffResult.some((change) => change.added || change.removed)

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

  const handleFileUpload = (side: 'left' | 'right') => async (event: React.ChangeEvent<HTMLInputElement>) => {
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
              {diffResult.length === 0 ? (
                <p className="placeholder">Start typing above to see the differences.</p>
              ) : (
                <div className={showLineNumbers ? 'with-line-numbers' : ''}>
                  {showLineNumbers && (
                    <div className="line-numbers">
                      {plainLines.map((_, index) => (
                        <div key={index} className="line-number">{index + 1}</div>
                      ))}
                    </div>
                  )}
                  <div className="diff-content">
                    {diffResult.map((part, index) => (
                      <span
                        key={`${index}-${part.count ?? 0}`}
                        className={`chunk ${
                          part.added ? 'added' : part.removed ? 'removed' : 'unchanged'
                        }`}
                      >
                        {part.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="diff-output plain" aria-label="Plain text diff">
              {plainText ? (
                <div className={showLineNumbers ? 'with-line-numbers' : ''}>
                  {showLineNumbers && (
                    <div className="line-numbers">
                      {plainLines.map((_, index) => (
                        <div key={index} className="line-number">{index + 1}</div>
                      ))}
                    </div>
                  )}
                  <pre className="diff-content">{plainText}</pre>
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
