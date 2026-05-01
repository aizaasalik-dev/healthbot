'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { ImageUploadZone } from '@/components/ui/ImageUploadZone'

// ── AddPrescriptionModal ────────────────────────────────────────
export function AddPrescriptionModal({ onClose }: { onClose: () => void }) {
  const activeFam = useStore(s => s.activeFam)
  const addPrescription = useStore(s => s.addPrescription)

  const [doctor, setDoctor] = useState('')
  const [hospital, setHospital] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [diagnosis, setDiagnosis] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>()

  function handleOCR(data: Record<string, string>, dataUrl: string) {
    if (data.doctor) setDoctor(data.doctor)
    if (data.hospital) setHospital(data.hospital)
    if (data.date) setDate(data.date)
    if (data.diagnosis) setDiagnosis(data.diagnosis)
    setImageDataUrl(dataUrl)
  }

  function handleSave() {
    if (!doctor.trim() && !hospital.trim()) { alert('Please fill in at least the doctor or hospital name.'); return }
    addPrescription({ doctor: doctor.trim() || 'Unknown', hospital: hospital.trim(), date, diagnosis: diagnosis.trim(), patient: activeFam, imageDataUrl })
    onClose()
  }

  return (
    <Modal
      title="💊 Add Prescription"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Prescription</button>
        </>
      }
    >
      <ImageUploadZone context="prescription" onResult={handleOCR} />
      <Field label="Doctor Name"><Input value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="e.g. Dr Nadia Tariq" /></Field>
      <Field label="Hospital / Clinic"><Input value={hospital} onChange={e => setHospital(e.target.value)} placeholder="e.g. Shifa International" /></Field>
      <Field label="Date"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
      <Field label="Diagnosis (optional)"><Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Hypertension, URTI" /></Field>
    </Modal>
  )
}

// ── AddMRModal ──────────────────────────────────────────────────
export function AddMRModal({ onClose }: { onClose: () => void }) {
  const activeFam = useStore(s => s.activeFam)
  const addMRNumber = useStore(s => s.addMRNumber)

  const [hospital, setHospital] = useState('')
  const [mrNo, setMrNo] = useState('')
  const [note, setNote] = useState('')

  function handleSave() {
    if (!hospital.trim() || !mrNo.trim()) { alert('Please fill in hospital and MR number.'); return }
    addMRNumber({ hospital: hospital.trim(), mrNo: mrNo.trim(), patient: activeFam, note: note.trim() })
    onClose()
  }

  return (
    <Modal
      title="🏥 Add MR Number"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </>
      }
    >
      <Field label="Hospital Name"><Input value={hospital} onChange={e => setHospital(e.target.value)} placeholder="e.g. Shifa International" /></Field>
      <Field label="MR / Patient Number"><Input value={mrNo} onChange={e => setMrNo(e.target.value)} placeholder="e.g. SH-2024-44821" /></Field>
      <Field label="Note (optional)"><Input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Cardiology OPD" /></Field>
    </Modal>
  )
}
