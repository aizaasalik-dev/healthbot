import type { AnthropicContent } from '@/types'

const MODEL = 'claude-sonnet-4-20250514'

export async function callClaude(
  apiKey: string,
  system: string,
  messages: { role: 'user' | 'assistant'; content: string | AnthropicContent[] }[],
  maxTokens = 1024
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message ?? 'API error')
  return data.content?.[0]?.text ?? ''
}

export async function ocrImage(
  apiKey: string,
  base64: string,
  mimeType: string,
  context: 'report' | 'prescription' | 'medicine'
): Promise<Record<string, string>> {
  const prompts = {
    report: 'This is a lab report. Extract: title/test name, lab name, date (YYYY-MM-DD), key findings. Return ONLY valid JSON: {"title":"","lab":"","date":"","category":"one of Haematology|Biochemistry|Thyroid|Diabetes|Urine|Radiology|Other","notes":""}',
    prescription: 'This is a prescription. Extract: doctor name, hospital/clinic, date (YYYY-MM-DD), diagnosis. Return ONLY valid JSON: {"doctor":"","hospital":"","date":"","diagnosis":""}',
    medicine: 'This is a medicine box/strip. Extract: medicine name, dose/strength, frequency. Return ONLY valid JSON: {"name":"","dose":"","frequency":""}',
  }

  const text = await callClaude(
    apiKey,
    'You are a medical OCR assistant. Extract structured data from medical images and return ONLY valid JSON.',
    [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
        { type: 'text', text: prompts[context] },
      ] as AnthropicContent[],
    }],
    300
  )

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return {}
  }
}

// Simulate OCR when no API key
export function simulateOCR(context: 'report' | 'prescription' | 'medicine'): Record<string, string> {
  const today = new Date().toISOString().split('T')[0]
  const mocks = {
    report: { title: 'Blood CP', lab: 'IDC Labs', date: today, category: 'Haematology', notes: 'WBC: 8.2, Hb: 12.8 g/dL — Normal ranges' },
    prescription: { doctor: 'Dr Nadia Tariq', hospital: 'Shifa International', date: today, diagnosis: 'Hypertension follow-up' },
    medicine: { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily' },
  }
  return mocks[context]
}
