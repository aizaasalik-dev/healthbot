'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select } from '@/components/ui/Field'
import { ImageUploadZone } from '@/components/ui/ImageUploadZone'
import type { ReportCategory } from '@/types'

const CATS: ReportCategory[] = ['Haematology','Biochemistry','Thyroid','Diabetes','Urine','Radiology','Other']

export function AddReportModal({ onClose }: { onClose: () => void }) {
  const activeFam = useStore(s => s.activeFam)
  const addReport = useStore(s => s.addReport)

  const [title, setTitle] = useState('')
  const [lab, setLab] = useState('')
  const [category, setCategory] = useState<ReportCategory>('Haematology')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  function handleOCR(data: Record<string, string>, dataUrl: string) {
    if (data.title) setTitle(data.title)
    if (data.lab) setLab(data.lab)
    if (data.date) setDate(data.date)
    if (data.notes) setNotes(data.notes)
    if (data.category && CATS.includes(data.category as ReportCategory)) setCategory(data.category as ReportCategory)
    setImageDataUrl(dataUrl)
  }

  function handleSave() {
    if (!title.trim()) { alert('Please enter a report title.'); return }
    addReport({ title: title.trim(), lab: lab.trim(), category, date, notes: notes.trim(), patient: activeFam, imageDataUrl })
    onClose()
  }

  return (
    <Modal
      title="🧪 Add Lab Report"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Report</button>
        </>
      }
    >
      <ImageUploadZone context="report" onResult={handleOCR} />
      <Field label="Report Title"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Blood CP, Thyroid Profile" /></Field>
      <Field label="Lab Name"><Input value={lab} onChange={e => setLab(e.target.value)} placeholder="e.g. IDC Labs, Chughtai Lab" /></Field>
      <Field label="Category">
        <Select value={category} onChange={e => setCategory(e.target.value as ReportCategory)}>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </Select>
      </Field>
      <Field label="Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      <Field label="Notes / Key findings"><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. TSH slightly elevated" /></Field>
    </Modal>
  )
}
