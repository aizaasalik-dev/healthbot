'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { fmt, CAT_ICON } from '@/lib/utils'
import { Topbar } from '@/components/ui/Topbar'
import { AddReportModal } from '@/components/modals/AddReportModal'
import type { PageProps } from '@/components/layout/types'
import type { ReportCategory } from '@/types'

const CATEGORIES: ReportCategory[] = ['Haematology', 'Biochemistry', 'Thyroid', 'Diabetes', 'Urine', 'Radiology', 'Other']

export function ReportsPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const allReports = useStore(s => s.getFamilyReports(activeFam))
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = allReports
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.lab.toLowerCase().includes(search.toLowerCase()))
    .filter(r => !catFilter || r.category === catFilter)

  const grouped: Record<string, typeof filtered> = {}
  filtered.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar
        title="Lab Reports"
        onBack={goBack}
        right={<button className="topbar-add-btn" onClick={() => setAddOpen(true)}>＋ Add</button>}
      />

      {/* Search + filter bar */}
      <div style={{ padding: '10px 12px', background: 'var(--card)', borderBottom: '1px solid var(--bdr)', display: 'flex', gap: 8 }}>
        <input
          className="form-input"
          placeholder="🔍  Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
        />
        <select
          className="form-input"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ width: 'auto', padding: '7px 10px', fontSize: 12 }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="content">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧪</div>
            <div className="empty-state-text">No reports found.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, rpts]) => (
            <div key={cat}>
              <div className="cat-group-label">{CAT_ICON[cat as ReportCategory] ?? '📋'} {cat}</div>
              {rpts.map(r => (
                <div key={r.id} className="rpt-card">
                  <div className="rpt-top">
                    <div className="rpt-ico">{CAT_ICON[r.category] ?? '📋'}</div>
                    <div className="rpt-body">
                      <div className="rpt-title">{r.title}</div>
                      <div className="rpt-lab">{r.lab}</div>
                      <div className="rpt-meta">
                        <span className="rpt-cat">{r.category}</span>
                        <span className="rpt-date">{fmt(r.date)}</span>
                      </div>
                      {r.notes && <div className="rpt-notes">📝 {r.notes}</div>}
                    </div>
                    {r.imageDataUrl && (
                      <img src={r.imageDataUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div style={{ height: 12 }} />
      </div>

      {addOpen && <AddReportModal onClose={() => setAddOpen(false)} />}
    </div>
  )
}
