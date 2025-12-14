import { useState } from 'react'
import type { DiffMode, FormatMode } from './types'
import { useDiff } from './hooks/useDiff'
import { useFileUpload } from './hooks/useFileUpload'
import { Header } from './components/Header'
import { TextInput } from './components/TextInput'
import { Toolbar } from './components/Toolbar'
import { DiffView } from './components/DiffView'
import './App.css'

const INITIAL_LEFT = ``
const INITIAL_RIGHT = ``

function App() {
  const [leftText, setLeftText] = useState(INITIAL_LEFT)
  const [rightText, setRightText] = useState(INITIAL_RIGHT)
  const [diffMode, setDiffMode] = useState<DiffMode>('line')
  const [formatMode, setFormatMode] = useState<FormatMode>('highlight')
  const [status, setStatus] = useState<string>('')

  const { alignedRows, plainText, hasChanges } = useDiff(leftText, rightText)

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

  const handleLeftFileUpload = useFileUpload(
    (text, filename) => {
      setLeftText(text)
      setStatus(`Loaded ${filename}`)
    },
    (error) => setStatus(error)
  )

  const handleRightFileUpload = useFileUpload(
    (text, filename) => {
      setRightText(text)
      setStatus(`Loaded ${filename}`)
    },
    (error) => setStatus(error)
  )

  return (
    <div className="page">
      <div className="container">
        <Header
          leftTextLength={leftText.length}
          rightTextLength={rightText.length}
          diffMode={diffMode}
        />

        <section className="input-grid">
          <TextInput
            label="Original text"
            value={leftText}
            onChange={setLeftText}
            onFileUpload={handleLeftFileUpload}
            placeholder="Paste or type the original text here"
            ariaLabel="Original text"
          />
          <TextInput
            label="Updated text"
            value={rightText}
            onChange={setRightText}
            onFileUpload={handleRightFileUpload}
            placeholder="Paste or type the updated text here"
            ariaLabel="Updated text"
          />
        </section>

        <Toolbar
          diffMode={diffMode}
          formatMode={formatMode}
          onDiffModeChange={setDiffMode}
          onFormatModeChange={setFormatMode}
          onCopy={handleCopy}
          onDownload={handleDownload}
          hasContent={!!plainText}
        />

        <DiffView
          alignedRows={alignedRows}
          diffMode={diffMode}
          formatMode={formatMode}
          hasChanges={hasChanges}
          status={status}
        />
      </div>
    </div>
  )
}

export default App
