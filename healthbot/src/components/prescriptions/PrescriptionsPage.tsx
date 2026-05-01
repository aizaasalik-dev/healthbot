'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { fmt } from '@/lib/utils'
import { Topbar } from '@/components/ui/Topbar'
import { AddPrescriptionModal } from '@/components/modals/AddPrescriptionModal'
import type { PageProps } from '@/components/layout/types'

export function PrescriptionsPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const rxs = useStore(s => s.getFamilyPrescriptions(activeFam))
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = rxs.filter(r =>
    !search ||
    r.doctor.toLowerCase().includes(search.toLowerCase()) ||
    r.hospital.toLowerCase().includes(search.toLowerCase()) ||
    (r.diagnosis ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar
        title="Prescriptions"
        onBack={goBack}
        right={<button className="topbar-add-btn" onClick={() => setAddOpen(true)}>＋ Add</button>}
      />

      <div style={{ padding: '10px 12px', background: 'var(--card)', borderBottom: '1px solid var(--bdr)' }}>
        <input
          className="form-input"
          placeholder="🔍  Search by doctor, hospital, diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '7px 10px', fontSize: 12 }}
        />
      </div>

      <div className="content">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💊</div>
            <div className="empty-state-text">No prescriptions saved yet.</div>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="rpt-card">
              <div className="rpt-top">
                <div className="rpt-ico" style={{ background: 'var(--green-l)' }}>💊</div>
                <div className="rpt-body">
                  <div className="rpt-title">{r.doctor}</div>
                  <div className="rpt-lab">{r.hospital}</div>
                  <div className="rpt-meta">
                    <span className="rpt-cat" style={{ background: 'var(--green-l)', color: 'var(--green)' }}>Prescription</span>
                    <span className="rpt-date">{fmt(r.date)}</span>
                  </div>
                  {r.diagnosis && <div className="rpt-notes">Dx: {r.diagnosis}</div>}
                </div>
                {r.imageDataUrl && (
                  <img src={r.imageDataUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                )}
              </div>
            </div>
          ))
        )}
        <div style={{ height: 12 }} />
      </div>

      {addOpen && <AddPrescriptionModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
