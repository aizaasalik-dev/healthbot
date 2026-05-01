'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Topbar } from '@/components/ui/Topbar'
import { AddMRModal } from '@/components/modals/AddMRModal'
import type { PageProps } from '@/components/layout/types'

export function MRNumbersPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const mrs = useStore(s => s.getFamilyMRNumbers(activeFam))
  const famData = useStore(s => s.getFamilyData(activeFam))
  const [addOpen, setAddOpen] = useState(false)

  const patName = famData.profile.name

  function copyMR(num: string) {
    navigator.clipboard?.writeText(num)
      .then(() => alert(`Copied: ${num}`))
      .catch(() => alert(`MR Number: ${num}`))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar
        title="MR Numbers"
        onBack={goBack}
        right={<button className="topbar-add-btn" onClick={() => setAddOpen(true)}>＋ Add</button>}
      />

      <div className="content">
        <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 12, lineHeight: 1.6 }}>
          MR numbers for <strong>{patName}</strong>. Show these at hospital reception for faster registration.
        </p>

        {mrs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏥</div>
            <div className="empty-state-text">No MR numbers for {patName} yet.<br />Tap + Add to add one.</div>
          </div>
        ) : (
          mrs.map(m => (
            <div key={m.id} className="mr-card">
              <div className="mr-hosp">🏥 {m.hospital}</div>
              <div className="mr-number">{m.mrNo}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>{m.note && <div className="mr-note">{m.note}</div>}</div>
                <button
                  onClick={() => copyMR(m.mrNo)}
                  style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, border: '1px solid var(--bdr2)', background: 'transparent', color: 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          ))
        )}
        <div style={{ height: 12 }} />
      </div>

      {addOpen && <AddMRModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
