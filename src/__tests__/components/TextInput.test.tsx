import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInput } from '../../components/TextInput'

describe('TextInput', () => {
  it('should render with label', () => {
    render(
      <TextInput
        label="Test Label"
        value=""
        onChange={vi.fn()}
        onFileUpload={vi.fn()}
        placeholder="Enter text"
        ariaLabel="Test input"
      />
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render textarea with value', () => {
    render(
      <TextInput
        label="Test"
        value="test content"
        onChange={vi.fn()}
        onFileUpload={vi.fn()}
        placeholder="Enter text"
        ariaLabel="Test input"
      />
    )
    const textarea = screen.getByRole('textbox', { name: 'Test input' })
    expect(textarea).toHaveValue('test content')
  })

  it('should call onChange when typing', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <TextInput
        label="Test"
        value=""
        onChange={handleChange}
        onFileUpload={vi.fn()}
        placeholder="Enter text"
        ariaLabel="Test input"
      />
    )

    const textarea = screen.getByRole('textbox', { name: 'Test input' })
    await user.type(textarea, 'hello')

    expect(handleChange).toHaveBeenCalled()
  })

  it('should render placeholder', () => {
    render(
      <TextInput
        label="Test"
        value=""
        onChange={vi.fn()}
        onFileUpload={vi.fn()}
        placeholder="Test placeholder"
        ariaLabel="Test input"
      />
    )
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })

  it('should render file upload button', () => {
    render(
      <TextInput
        label="Test"
        value=""
        onChange={vi.fn()}
        onFileUpload={vi.fn()}
        placeholder="Enter text"
        ariaLabel="Test input"
      />
    )
    expect(screen.getByTitle('Open file')).toBeInTheDocument()
  })

  it('should have correct file input accept attribute', () => {
    render(
      <TextInput
        label="Test"
        value=""
        onChange={vi.fn()}
        onFileUpload={vi.fn()}
        placeholder="Enter text"
        ariaLabel="Test input"
      />
    )
    const fileInput = screen.getByTitle('Open file').querySelector('input[type="file"]')
    expect(fileInput).toHaveAttribute(
      'accept',
      '.txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv,.log,text/*'
    )
  })
})
