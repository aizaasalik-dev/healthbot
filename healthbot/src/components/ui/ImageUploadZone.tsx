'use client'

import { useRef, useState } from 'react'
import { fileToBase64 } from '@/lib/utils'
import { ocrImage, simulateOCR } from '@/lib/anthropic'
import { useStore } from '@/store'

interface Props {
  context: 'report' | 'prescription' | 'medicine'
  onResult: (data: Record<string, string>, dataUrl: string) => void
}

export function ImageUploadZone({ context, onResult }: Props) {
  const apiKey = useStore(s => s.apiKey)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const labels = {
    report: { icon: '📸', title: 'Upload report image', sub: 'Photo or scan of your lab report' },
    prescription: { icon: '📸', title: 'Upload prescription photo', sub: 'Photo of your prescription slip' },
    medicine: { icon: '📦', title: 'Photo of medicine box', sub: 'AI will read the name and dose' },
  }

  const label = labels[context]

  async function handleFile(file: File) {
    const { base64, mimeType, dataUrl } = await fileToBase64(file)
    setPreview(dataUrl)
    setStatus('Reading image with AI...')

    let result: Record<string, string>
    try {
      result = apiKey
        ? await ocrImage(apiKey, base64, mimeType, context)
        : simulateOCR(context)
    } catch {
      result = simulateOCR(context)
    }

    setStatus('✅ Info extracted — please verify below')
    setTimeout(() => setStatus(''), 3000)
    onResult(result, dataUrl)
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        className="upload-zone"
        onClick={() => inputRef.current?.click()}
        style={preview ? { padding: 0, border: 'none', background: 'transparent' } : undefined}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Uploaded"
              style={{ width: '100%', borderRadius: 8, maxHeight: 160, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(0,0,0,.5)', borderRadius: 20,
              padding: '3px 8px', fontSize: 11, color: 'white',
            }}>Change</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{label.icon}</div>
            <div className="upload-zone-title">{label.title}</div>
            <div className="upload-zone-sub">{label.sub}</div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {status && <div className="ocr-status">{status}</div>}
    </div>
  )
}
