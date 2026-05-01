'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { ImageUploadZone } from '@/components/ui/ImageUploadZone'

interface Props {
  onClose: () => void
}

export function AddMedicineModal({ onClose }: Props) {
  const activeFam = useStore(s => s.activeFam)
  const addEvent = useStore(s => s.addEvent)
  const setMedicineReminder = useStore(s => s.setMedicineReminder)
  const toggleMedicineReminder = useStore(s => s.toggleMedicineReminder)

  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState('Once daily')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)

  function handleOCR(data: Record<string, string>, dataUrl: string) {
    if (data.name) setName(data.name)
    if (data.dose) setDose(data.dose)
    if (data.frequency) setFrequency(data.frequency)
    setImageDataUrl(dataUrl)
  }

  function handleSave() {
    if (!name.trim()) {
      alert('Please enter a medicine name.')
      return
    }

    addEvent(activeFam, {
      date,
      eventType: 'PRESCRIPTION',
      confirmed: true,
      aiExtracted: !!imageDataUrl,
      doctor: '',
      hospital: '',
      diagnosis: 'Medicine entry',
      symptoms: '',
      followUp: '',
      rawNote: imageDataUrl ? 'Added from medicine image upload.' : '',
      medicines: [{
        name: name.trim(),
        dose: dose.trim(),
        frequency: frequency.trim(),
        duration: duration.trim(),
      }],
      tests: [],
    })

    toggleMedicineReminder(activeFam, name.trim(), reminderEnabled)
    if (reminderEnabled) {
      setMedicineReminder(activeFam, name.trim(), reminderTime)
    }

    onClose()
  }

  return (
    <Modal
      title="💊 Add Medicine"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Medicine</button>
        </>
      }
    >
      <ImageUploadZone context="medicine" onResult={handleOCR} />
      <Field label="Medicine Name">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amlodipine" />
      </Field>
      <Field label="Dose / Strength">
        <Input value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 5mg" />
      </Field>
      <Field label="Frequency">
        <Input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g. Once daily" />
      </Field>
      <Field label="Duration">
        <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 30 days / Ongoing" />
      </Field>
      <Field label="Start Date">
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </Field>

      <div style={{ border: '1px solid var(--bdr)', borderRadius: 10, padding: 10, marginTop: 6 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
          <span>Set reminder</span>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={e => {
              const enabled = e.target.checked
              setReminderEnabled(enabled)
              if (enabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                void Notification.requestPermission()
              }
            }}
          />
        </label>
        <Input
          type="time"
          value={reminderTime}
          onChange={e => setReminderTime(e.target.value)}
          disabled={!reminderEnabled}
        />
      </div>
    </Modal>
  )
}
