'use client'

import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@/store'
import { fmt } from '@/lib/utils'
import { Topbar } from '@/components/ui/Topbar'
import type { PageProps } from '@/components/layout/types'
import { AddMedicineModal } from '@/components/modals/AddMedicineModal'

export function MedicinesPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const events = useStore(s => s.getFamilyEvents(activeFam))
  const medReminders = useStore(s => s.medReminders)
  const setMedicineReminder = useStore(s => s.setMedicineReminder)
  const toggleMedicineReminder = useStore(s => s.toggleMedicineReminder)
  const [addOpen, setAddOpen] = useState(false)

  // Deduplicated medicine list with source event
  const meds = useMemo(() => {
    const seen = new Set<string>()
    const list: { name: string; dose: string; frequency: string; duration: string; date: string; from: string }[] = []
    events.forEach(e => {
      (e.medicines ?? []).forEach(m => {
        const k = m.name.toLowerCase()
        if (!seen.has(k)) {
          seen.add(k)
          list.push({ ...m, date: e.date, from: e.diagnosis || 'Health record' })
        }
      })
    })
    return list
  }, [events])

  function reminderKey(medName: string): string {
    return `${activeFam}:${medName.toLowerCase()}`
  }

  function reminderFor(medName: string) {
    return medReminders[reminderKey(medName)] ?? { enabled: false, time: '08:00' }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    const timers: number[] = []
    meds.forEach(med => {
      const reminder = reminderFor(med.name)
      if (!reminder.enabled || !reminder.time) return

      const [hh, mm] = reminder.time.split(':').map(Number)
      if (Number.isNaN(hh) || Number.isNaN(mm)) return

      const now = new Date()
      const next = new Date()
      next.setHours(hh, mm, 0, 0)
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1)

      const delayMs = next.getTime() - now.getTime()
      const timerId = window.setTimeout(() => {
        const body = `Time to take ${med.name}${med.dose ? ` (${med.dose})` : ''}.`
        if (Notification.permission === 'granted') {
          new Notification('HealthBot Reminder', { body })
        } else {
          alert(`⏰ ${body}`)
        }
      }, delayMs)

      timers.push(timerId)
    })

    return () => timers.forEach(t => window.clearTimeout(t))
  }, [activeFam, medReminders, meds])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar
        title="Medicines"
        onBack={goBack}
        right={
          <button className="topbar-add-btn" onClick={() => setAddOpen(true)}>
            ＋ Add
          </button>
        }
      />
      <div className="content">
        {meds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💊</div>
            <div className="empty-state-text">No medicines recorded yet.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: '4px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--t3)', padding: '10px 0 6px' }}>
              All unique medicines from your records, most recent first.
            </div>
            {meds.map((m, i) => (
              <div key={m.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < meds.length - 1 ? '1px solid var(--bdr)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>💊 {m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                    {[m.dose, m.frequency].filter(Boolean).join(' · ')}
                    {m.duration ? ` · ${m.duration}` : ''}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                    From: {m.from} · {fmt(m.date)}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <label style={{ fontSize: 11, color: 'var(--t2)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <input
                        type="checkbox"
                        checked={reminderFor(m.name).enabled}
                        onChange={e => {
                          const enabled = e.target.checked
                          if (enabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                            void Notification.requestPermission()
                          }
                          toggleMedicineReminder(activeFam, m.name, enabled)
                        }}
                      />
                      Reminder
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      value={reminderFor(m.name).time}
                      disabled={!reminderFor(m.name).enabled}
                      onChange={e => setMedicineReminder(activeFam, m.name, e.target.value)}
                      style={{ width: 120, padding: '5px 8px', fontSize: 11, background: 'white' }}
                    />
                  </div>
                </div>
                <span className="badge badge-teal">Active</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 12 }} />
      </div>
      {addOpen && <AddMedicineModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
