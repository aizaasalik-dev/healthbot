'use client'

import { useStore } from '@/store'
import { Topbar } from '@/components/ui/Topbar'
import { fmt } from '@/lib/utils'
import type { PageProps } from '@/components/layout/types'

export function ExportPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const events = useStore(s => s.getFamilyEvents(activeFam))
  const famData = useStore(s => s.getFamilyData(activeFam))

  function exportHTML(type: string) {
    let filtered = events
    let title = 'HealthBot — Full Record'

    if (type === 'medicines') title = 'HealthBot — Current Medicines'
    else if (type === 'doctor') { filtered = events.filter(e => e.eventType === 'DOCTOR_VISIT'); title = 'HealthBot — Doctor Visits' }
    else if (type === 'recent') {
      const c = new Date(); c.setMonth(c.getMonth() - 3)
      filtered = events.filter(e => new Date(e.date) >= c)
      title = 'HealthBot — Last 3 Months'
    }

    if (type === 'wa') {
      const meds = Array.from(new Set(events.flatMap(e => (e.medicines ?? []).map(m => m.name))))
      const s = `*HealthBot Health Summary*\n\nPatient: ${famData.profile.name}\nGenerated: ${new Date().toLocaleDateString('en-PK')}\nRecords: ${events.length}\n\nRecent diagnoses:\n${events.slice(0, 3).map(e => `• ${e.diagnosis || 'Health event'} (${fmt(e.date)})`).join('\n')}\n\nActive medicines:\n${meds.map(n => `• ${n}`).join('\n')}\n\n_Exported from HealthBot. Not a substitute for professional medical advice._`
      window.open(`https://wa.me/?text=${encodeURIComponent(s)}`, '_blank')
      return
    }

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:Arial,sans-serif;max-width:600px;margin:30px auto;color:#1a1a1a;line-height:1.6}h1{font-size:20px;border-bottom:2px solid #1D9E75;padding-bottom:8px;color:#1D9E75}.event{margin-bottom:16px;padding:12px;border:1px solid #e2e8f0;border-radius:8px}.date{font-size:11px;color:#64748b}.disc{font-size:11px;color:#92400E;background:#FAEEDA;padding:8px;border-radius:6px;margin-top:20px}@media print{body{margin:15px}}</style>
</head><body>
<h1>🏥 ${title}</h1>
<p class="date">Patient: ${famData.profile.name} | Generated: ${new Date().toLocaleString('en-PK')} | Records: ${filtered.length}</p>
${filtered.map(e => `<div class="event"><span class="date">${fmt(e.date)} — ${e.eventType}</span><h2 style="margin:4px 0">${e.diagnosis || e.symptoms || 'Health Event'}</h2>${e.doctor ? `<div>Doctor: <strong>${e.doctor}</strong>${e.hospital ? ' · ' + e.hospital : ''}</div>` : ''}${(e.medicines ?? []).length ? `<div>Medicines: <strong>${e.medicines.map(m => `${m.name} ${m.dose}`).join(', ')}</strong></div>` : ''}</div>`).join('')}
<div class="disc">⚠️ Self-reported data. Not a certified medical record. Always consult a physician.</div>
<script>window.onload=()=>window.print()<\/script></body></html>`

    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  const options = [
    { icon: '📋', title: 'Full medical record', sub: 'All events, diagnoses, medicines', type: 'full' },
    { icon: '💊', title: 'Current medicines', sub: 'Active medications with doses', type: 'medicines' },
    { icon: '📆', title: 'Last 3 months', sub: 'Recent health events', type: 'recent' },
    { icon: '🩺', title: 'Doctor visits only', sub: 'Consultations and prescriptions', type: 'doctor' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar title="Export & Share" onBack={goBack} />
      <div className="content">
        <p style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 14 }}>Share with your doctor or save for yourself</p>
        {options.map(o => (
          <div key={o.type} className="export-row" onClick={() => exportHTML(o.type)}>
            <div className="export-icon">{o.icon}</div>
            <div>
              <div className="export-title">{o.title}</div>
              <div className="export-sub">{o.sub}</div>
            </div>
            <div style={{ fontSize: 18, color: 'var(--t3)', marginLeft: 'auto' }}>›</div>
          </div>
        ))}
        <div className="wa-btn" onClick={() => exportHTML('wa')}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>Share on WhatsApp</span>
        </div>
      </div>
    </div>
  )
}
