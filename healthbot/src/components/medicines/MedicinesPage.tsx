'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { useMedSlots } from '@/hooks/useMedSlots'
import { fmt } from '@/lib/utils'
import { Topbar } from '@/components/ui/Topbar'
import type { PageProps } from '@/components/layout/types'

export function MedicinesPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const events = useStore(s => s.getFamilyEvents(activeFam))

  // Deduplicated medicine list with source event
  const meds = (() => {
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
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar
        title="Medicines"
        onBack={goBack}
        right={
          <button className="topbar-add-btn" onClick={() => alert('Use Add Entry to log a medicine')}>
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
                </div>
                <span className="badge badge-teal">Active</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 12 }} />
      </div>
    </div>
  )
}
