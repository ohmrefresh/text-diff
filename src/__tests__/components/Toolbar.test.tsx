import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from '../../components/Toolbar'

describe('Toolbar', () => {
  const defaultProps = {
    diffMode: 'line' as const,
    formatMode: 'highlight' as const,
    onDiffModeChange: vi.fn(),
    onFormatModeChange: vi.fn(),
    onCopy: vi.fn(),
    onDownload: vi.fn(),
    hasContent: true,
  }

  it('should render diff mode select', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByLabelText('Diff mode')).toBeInTheDocument()
  })

  it('should call onDiffModeChange when mode is changed', async () => {
    const user = userEvent.setup()
    const handleModeChange = vi.fn()
    render(<Toolbar {...defaultProps} onDiffModeChange={handleModeChange} />)

    const select = screen.getByLabelText('Diff mode')
    await user.selectOptions(select, 'word')

    expect(handleModeChange).toHaveBeenCalledWith('word')
  })

  it('should render format toggle buttons', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('Highlighted')).toBeInTheDocument()
    expect(screen.getByText('Plain text')).toBeInTheDocument()
  })

  it('should highlight active format button', () => {
    render(<Toolbar {...defaultProps} formatMode="highlight" />)
    const highlightBtn = screen.getByText('Highlighted')
    expect(highlightBtn).toHaveClass('active')
  })

  it('should call onFormatModeChange when format button is clicked', async () => {
    const user = userEvent.setup()
    const handleFormatChange = vi.fn()
    render(<Toolbar {...defaultProps} onFormatModeChange={handleFormatChange} />)

    const plainBtn = screen.getByText('Plain text')
    await user.click(plainBtn)

    expect(handleFormatChange).toHaveBeenCalledWith('plain')
  })

  it('should render copy button', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('Copy diff')).toBeInTheDocument()
  })

  it('should call onCopy when copy button is clicked', async () => {
    const user = userEvent.setup()
    const handleCopy = vi.fn()
    render(<Toolbar {...defaultProps} onCopy={handleCopy} />)

    await user.click(screen.getByText('Copy diff'))

    expect(handleCopy).toHaveBeenCalled()
  })

  it('should disable buttons when hasContent is false', () => {
    render(<Toolbar {...defaultProps} hasContent={false} />)
    expect(screen.getByText('Copy diff')).toBeDisabled()
    expect(screen.getByText('Export as .txt')).toBeDisabled()
  })

  it('should render download button', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('Export as .txt')).toBeInTheDocument()
  })

  it('should call onDownload when download button is clicked', async () => {
    const user = userEvent.setup()
    const handleDownload = vi.fn()
    render(<Toolbar {...defaultProps} onDownload={handleDownload} />)

    await user.click(screen.getByText('Export as .txt'))

    expect(handleDownload).toHaveBeenCalled()
  })
})
