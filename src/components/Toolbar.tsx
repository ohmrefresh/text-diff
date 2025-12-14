import type { DiffMode, FormatMode } from '../types'

type ToolbarProps = {
  diffMode: DiffMode
  formatMode: FormatMode
  onDiffModeChange: (mode: DiffMode) => void
  onFormatModeChange: (mode: FormatMode) => void
  onCopy: () => void
  onDownload: () => void
  hasContent: boolean
}

export function Toolbar({
  diffMode,
  formatMode,
  onDiffModeChange,
  onFormatModeChange,
  onCopy,
  onDownload,
  hasContent,
}: ToolbarProps) {
  return (
    <section className="toolbar">
      <div className="control-group">
        <label htmlFor="mode">Diff mode</label>
        <select
          id="mode"
          value={diffMode}
          onChange={(event) => onDiffModeChange(event.target.value as DiffMode)}
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
            onClick={() => onFormatModeChange('highlight')}
          >
            Highlighted
          </button>
          <button
            type="button"
            aria-pressed={formatMode === 'plain'}
            className={formatMode === 'plain' ? 'active' : ''}
            onClick={() => onFormatModeChange('plain')}
          >
            Plain text
          </button>
        </div>
      </div>
      <div className="actions">
        <button type="button" onClick={onCopy} disabled={!hasContent}>
          Copy diff
        </button>
        <button
          type="button"
          className="ghost"
          onClick={onDownload}
          disabled={!hasContent}
        >
          Export as .txt
        </button>
      </div>
    </section>
  )
}
