'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { BottomSheet } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { uid } from '@/lib/utils'
import type { EventType } from '@/types'

type Mode = 'chat' | 'upload' | 'form'

interface Props { onClose: () => void }

export function AddEntrySheet({ onClose }: Props) {
  const activeFam = useStore(s => s.activeFam)
  const addEvent = useStore(s => s.addEvent)
  const apiKey = useStore(s => s.apiKey)

  const [mode, setMode] = useState<Mode>('chat')
  const [chatText, setChatText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<Record<string, string> | null>(null)

  // Form fields
  const [fType, setFType] = useState<EventType>('DOCTOR_VISIT')
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fDoc, setFDoc] = useState('')
  const [fDiag, setFDiag] = useState('')
  const [fMeds, setFMeds] = useState('')
  const [fNotes, setFNotes] = useState('')

  async function handleExtract() {
    if (!chatText.trim()) return
    setExtracting(true)

    if (apiKey) {
      try {
        const { callClaude } = await import('@/lib/anthropic')
        const text = await callClaude(apiKey,
          'You are a medical data extractor. Extract structured data from the user\'s health note. Return ONLY valid JSON with keys: date (YYYY-MM-DD), doctor, hospital, diagnosis, symptoms, medicines (comma-separated), followUp.',
          [{ role: 'user', content: chatText }], 400
        )
        setExtracted(JSON.parse(text.replace(/```json|```/g, '').trim()))
      } catch {
        setExtracted(simpleExtract(chatText))
      }
    } else {
      await new Promise(r => setTimeout(r, 900))
      setExtracted(simpleExtract(chatText))
    }
    setExtracting(false)
  }

  function handleSave() {
    if (mode === 'chat' || mode === 'upload') {
      if (!extracted) { alert('Please extract first.'); return }
      addEvent(activeFam, {
        date: extracted.date || new Date().toISOString().split('T')[0],
        eventType: 'DOCTOR_VISIT',
        confirmed: false,
        aiExtracted: true,
        doctor: extracted.doctor || '',
        hospital: extracted.hospital || '',
        diagnosis: extracted.diagnosis || '',
        symptoms: extracted.symptoms || '',
        followUp: extracted.followUp || '',
        rawNote: chatText,
        medicines: (extracted.medicines || '').split(',').map((s: string) => ({ name: s.trim(), dose: '', frequency: '', duration: '' })).filter(m => m.name),
        tests: [],
      })
    } else {
      if (!fDiag && !fNotes) { alert('Please fill in at least the diagnosis or notes.'); return }
      addEvent(activeFam, {
        date: fDate,
        eventType: fType,
        confirmed: true,
        aiExtracted: false,
        doctor: fDoc,
        hospital: '',
        diagnosis: fDiag,
        symptoms: fNotes,
        followUp: '',
        rawNote: '',
        medicines: fMeds.split(',').map(s => ({ name: s.trim(), dose: '', frequency: '', duration: '' })).filter(m => m.name),
        tests: [],
      })
    }
    onClose()
  }

  return (
    <BottomSheet
      title="Add health entry"
      subtitle="Type naturally — AI will extract the details"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save ✓</button>
        </>
      }
    >
      <div className="entry-modes">
        {(['chat','upload','form'] as Mode[]).map(m => (
          <button
            key={m}
            className={`entry-mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m === 'chat' ? '💬 Chat' : m === 'upload' ? '📎 Upload' : '📝 Form'}
          </button>
        ))}
      </div>

      {(mode === 'chat' || mode === 'upload') && (
        <>
          <Textarea
            value={chatText}
            onChange={e => setChatText(e.target.value)}
            rows={3}
            placeholder="e.g. Saw Dr Ahmed today for shoulder pain. He prescribed Brufen 400mg for 5 days..."
          />
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>Type naturally — AI will extract the details</div>
          <button
            className="btn btn-primary"
            onClick={handleExtract}
            disabled={extracting || !chatText.trim()}
            style={{ width: '100%', marginBottom: 12 }}
          >
            {extracting ? '⏳ Extracting...' : '✨ Extract & Review'}
          </button>

          {extracted && (
            <div style={{ background: 'var(--teal-l)', border: '1px solid var(--teal-m)', borderRadius: 'var(--r)', padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal-d)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 10 }}>
                🤖 AI Extracted — please verify
              </div>
              {Object.entries(extracted).map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, color: 'var(--teal-d)', fontWeight: 500, minWidth: 90, textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontSize: 12, color: 'var(--teal-dp)', flex: 1 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === 'form' && (
        <>
          <Field label="Event type">
            <Select value={fType} onChange={e => setFType(e.target.value as EventType)}>
              <option value="DOCTOR_VISIT">🩺 Doctor Visit</option>
              <option value="SYMPTOM">🤒 Symptom</option>
              <option value="LAB_RESULT">🧪 Lab Report</option>
              <option value="PRESCRIPTION">💊 Prescription</option>
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={fDate} onChange={e => setFDate(e.target.value)} /></Field>
          <Field label="Doctor / Hospital"><Input value={fDoc} onChange={e => setFDoc(e.target.value)} placeholder="e.g. Dr Khalid, Shifa Hospital" /></Field>
          <Field label="Diagnosis / Complaint"><Input value={fDiag} onChange={e => setFDiag(e.target.value)} placeholder="e.g. Knee pain, high BP" /></Field>
          <Field label="Medicines"><Input value={fMeds} onChange={e => setFMeds(e.target.value)} placeholder="e.g. Brufen 400mg, Panadol 500mg" /></Field>
          <Field label="Notes"><Textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={2} /></Field>
        </>
      )}
    </BottomSheet>
  )
}

// Simple regex-based extraction fallback
function simpleExtract(text: string): Record<string, string> {
  const t = text.toLowerCase()
  const drMatch = text.match(/Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
  const dateStr = new Date().toISOString().split('T')[0]
  const diagMap: Record<string, string> = {
    'shoulder': 'Shoulder pain', 'knee': 'Knee pain', 'back': 'Back pain',
    'headache': 'Headache', 'fever': 'Fever', 'throat': 'Sore throat',
    'blood pressure': 'Hypertension', 'diabetes': 'Diabetes',
  }
  const diagnosis = Object.entries(diagMap).find(([k]) => t.includes(k))?.[1] ?? ''
  const medMatch = text.match(/\b(Panadol|Brufen|Ibuprofen|Amoxicillin|Augmentin|Amlodipine|Metformin|Voltaren)\b/gi)

  return {
    date: dateStr,
    doctor: drMatch ? `Dr ${drMatch[1]}` : '',
    diagnosis,
    medicines: medMatch ? medMatch.join(', ') : '',
    followUp: text.match(/follow[- ]?up[^.]+/i)?.[0] ?? '',
  }
}
