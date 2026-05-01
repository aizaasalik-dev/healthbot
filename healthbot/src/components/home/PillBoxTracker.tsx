'use client'

import { useStore } from '@/store'
import { useMedSlots } from '@/hooks/useMedSlots'
import type { Medicine } from '@/types'
import clsx from 'clsx'

type Slot = 'morning' | 'afternoon' | 'night'

interface PillBoxProps {
  slot: Slot
  emoji: string
  label: string
  meds: Medicine[]
}

function PillBox({ slot, emoji, label, meds }: PillBoxProps) {
  const activeFam = useStore(s => s.activeFam)
  const isMedTaken = useStore(s => s.isMedTaken)
  const toggleMedDose = useStore(s => s.toggleMedDose)

  const isEmpty = meds.length === 0
  const takenCount = meds.filter(m => isMedTaken(activeFam, slot, m.name)).length
  const allTaken = !isEmpty && takenCount === meds.length
  const partial = takenCount > 0 && takenCount < meds.length

  const bg = allTaken ? 'var(--teal)' : partial ? '#E8F8F3' : 'var(--card)'
  const border = allTaken ? 'var(--teal)' : partial ? 'var(--teal-m)' : 'var(--bdr)'
  const checkmark = allTaken ? '✓' : partial ? '◑' : '○'
  const iconColor = allTaken ? 'white' : partial ? 'var(--teal-d)' : 'var(--t3)'
  const labelColor = allTaken ? 'white' : partial ? 'var(--teal-d)' : 'var(--t2)'
  const subText = isEmpty ? '—' : allTaken ? 'Done' : partial ? `${takenCount}/${meds.length}` : `${meds.length} pill${meds.length > 1 ? 's' : ''}`

  function handleClick() {
    if (isEmpty) return
    meds.forEach(m => {
      const shouldTake = !allTaken
      const key = `${activeFam}:${slot}:${m.name}`
      if (isMedTaken(activeFam, slot, m.name) !== shouldTake) {
        toggleMedDose(activeFam, slot, m.name)
      }
    })
  }

  return (
    <div
      onClick={handleClick}
      style={{
        flex: 1, background: bg, border: `1.5px solid ${border}`, borderRadius: 14,
        padding: '13px 6px 11px', textAlign: 'center',
        cursor: isEmpty ? 'default' : 'pointer',
        transition: 'all .25s', opacity: isEmpty ? 0.4 : 1,
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 5 }}>{emoji}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: iconColor, lineHeight: 1, marginBottom: 3 }}>{checkmark}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: labelColor, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 9, color: allTaken ? 'rgba(255,255,255,.7)' : partial ? 'var(--teal)' : 'var(--t3)' }}>{subText}</div>
    </div>
  )
}

export function PillBoxTracker() {
  const slots = useMedSlots()
  const totalMeds = new Set([...slots.morning, ...slots.afternoon, ...slots.night].map(m => m.name)).size
  const today = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="widget-card">
      <div className="widget-head">
        <span className="widget-title">💊 Today&apos;s Medicines</span>
        <span className="widget-date">{today}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '11px 11px 12px' }}>
        <PillBox slot="morning" emoji="🌅" label="Morning" meds={slots.morning} />
        <PillBox slot="afternoon" emoji="☀️" label="Afternoon" meds={slots.afternoon} />
        <PillBox slot="night" emoji="🌙" label="Night" meds={slots.night} />
      </div>
      <div style={{ padding: '0 11px 11px', fontSize: 10, color: 'var(--t3)', textAlign: 'center' }}>
        {totalMeds > 0
          ? 'Tap a box to mark all taken · Go to Medicines for details'
          : 'Add medicines via a health entry to track them here'}
      </div>
    </div>
  )
}
