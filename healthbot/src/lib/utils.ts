import type { EventType, ReportCategory } from '@/types'

export function fmt(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function fmtLong(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PK', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function fmtMonth(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PK', {
    month: 'long', year: 'numeric',
  })
}

export function calcAge(dob: string): number | null {
  if (!dob) return null
  const b = new Date(dob)
  const n = new Date()
  let age = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--
  return age
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function uid(): string {
  return 'e' + Date.now() + Math.random().toString(36).slice(2, 5)
}

export function initials(name: string): string {
  const firstWord = (name || '?').trim().split(/\s+/)[0] || '?'
  return firstWord[0].toUpperCase()
}

export const EVENT_META: Record<EventType, { icon: string; bg: string; label: string; badgeClass: string }> = {
  DOCTOR_VISIT: { icon: '🩺', bg: '#E6F1FB', label: 'Doctor', badgeClass: 'badge-blue' },
  LAB_RESULT:   { icon: '🧪', bg: '#FAEEDA', label: 'Lab',    badgeClass: 'badge-amber' },
  SYMPTOM:      { icon: '🤒', bg: '#FCEBEB', label: 'Symptom', badgeClass: 'badge-red' },
  PRESCRIPTION: { icon: '💊', bg: '#EAF3DE', label: 'Rx',     badgeClass: 'badge-green' },
}

export const CAT_ICON: Record<ReportCategory, string> = {
  Haematology: '🩸',
  Biochemistry: '⚗️',
  Thyroid: '🦋',
  Diabetes: '🍬',
  Urine: '🔬',
  Radiology: '☢️',
  Other: '📋',
}

export const FAMILY_COLOR: Record<string, string> = {
  main: 'fme',
  abbu: 'fbl',
  ami:  'famb',
}

export function getFamilyColor(key: string): string {
  const colors = ['fme', 'fbl', 'famb', 'fpink']
  return FAMILY_COLOR[key] ?? colors[Object.keys(FAMILY_COLOR).length % colors.length]
}

export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      const mimeMatch = dataUrl.match(/data:([^;]+);/)
      resolve({
        dataUrl,
        base64: dataUrl.split(',')[1],
        mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
