import type { ChangeEvent } from 'react'

type TextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  ariaLabel: string
}

export function TextInput({
  label,
  value,
  onChange,
  onFileUpload,
  placeholder,
  ariaLabel,
}: TextInputProps) {
  return (
    <div className="input-card">
      <div className="input-card__header">
        <span>{label}</span>
        <label className="file-upload-btn" title="Open file" aria-label="Upload file">
          Upload
          <input
            type="file"
            accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv,.log,text/*"
            onChange={onFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <div className="textarea-wrapper">
        <textarea
          aria-label={ariaLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
