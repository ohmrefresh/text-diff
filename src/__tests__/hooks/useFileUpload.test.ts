import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFileUpload } from '../../hooks/useFileUpload'

describe('useFileUpload', () => {
  it('should return a function', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))

    expect(typeof result.current).toBe('function')
  })

  it('should not call handlers if no file is selected', async () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))

    const event = {
      target: { files: [] },
    } as unknown as React.ChangeEvent<HTMLInputElement>

    await result.current(event)

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('should call onError if file reading fails', async () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))

    const mockFile = {
      text: vi.fn().mockRejectedValue(new Error('Read error')),
      name: 'test.txt',
    }
    const event = {
      target: { files: [mockFile] },
    } as unknown as React.ChangeEvent<HTMLInputElement>

    await result.current(event)

    // Wait for onError to be called
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Failed to read file: Read error')
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
