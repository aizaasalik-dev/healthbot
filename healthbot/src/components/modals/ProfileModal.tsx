'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select } from '@/components/ui/Field'
import { uid } from '@/lib/utils'
import type { FamilyMember } from '@/types'

interface Props {
  mode: 'edit' | 'add'
  onClose: () => void
}

export function ProfileModal({ mode, onClose }: Props) {
  const activeFam = useStore(s => s.activeFam)
  const famData = useStore(s => s.getFamilyData(activeFam))
  const updateProfile = useStore(s => s.updateProfile)
  const addFamilyMember = useStore(s => s.addFamilyMember)

  const existing = mode === 'edit' ? famData.profile : null

  const [name, setName] = useState(existing?.name ?? '')
  const [dob, setDob] = useState(existing?.dob ?? '')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(existing?.gender || 'Female')
  const [blood, setBlood] = useState(existing?.blood ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [relation, setRelation] = useState(existing?.relation ?? 'self')

  function handleSave() {
    if (!name.trim()) { alert('Please enter a name.'); return }

    if (mode === 'edit') {
      updateProfile(activeFam, { name: name.trim(), dob, gender, blood, phone })
    } else {
      const key = 'fam_' + Date.now()
      const newMember: FamilyMember = {
        profile: { name: name.trim(), dob, gender, blood, phone, relation },
        vitals: { bp: '—', pulse: '—', weight: '—' },
        events: [],
      }
      addFamilyMember(key, newMember)
    }
    onClose()
  }

  const isEdit = mode === 'edit'

  return (
    <Modal
      title={isEdit ? '👤 Edit Profile' : '👤 Add Family Member'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? 'Save' : 'Add Member'}
          </button>
        </>
      }
    >
      <Field label="Full Name">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Your Name" />
      </Field>

      {!isEdit && (
        <Field label="Relationship">
          <Select value={relation} onChange={e => setRelation(e.target.value)}>
            <option value="self">Myself</option>
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="spouse">Spouse</option>
            <option value="sibling">Sibling</option>
            <option value="child">Child</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      )}

      <Field label="Date of Birth">
        <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
      </Field>

      <Field label="Gender">
        <Select value={gender} onChange={e => setGender(e.target.value as any)}>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </Select>
      </Field>

      <Field label="Blood Group (optional)">
        <Select value={blood} onChange={e => setBlood(e.target.value)}>
          <option value="">Not set</option>
          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
        </Select>
      </Field>

      <Field label="Phone (optional)">
        <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0300-1234567" />
      </Field>
    </Modal>
  )
}
