type HeaderProps = {
  leftTextLength: number
  rightTextLength: number
  diffMode: string
}

export function Header({ leftTextLength, rightTextLength, diffMode }: HeaderProps) {
  return (
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
            {leftTextLength.toLocaleString()} chars
          </span>
        </div>
        <div>
          <span className="stat-label">Right</span>
          <span className="stat-value">
            {rightTextLength.toLocaleString()} chars
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
  )
}
