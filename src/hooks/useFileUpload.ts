import type { ChangeEvent } from 'react'

export function useFileUpload(
  onSuccess: (text: string, filename: string) => void,
  onError: (error: string) => void
) {
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      onSuccess(text, file.name)
    } catch {
      onError('Failed to read file')
    }
  }

  return handleFileUpload
}
