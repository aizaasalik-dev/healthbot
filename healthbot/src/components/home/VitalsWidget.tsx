'use client'

import { useStore } from '@/store'

export function VitalsWidget() {
  const activeFam = useStore(s => s.activeFam)
  const vitals = useStore(s => s.getFamilyData(activeFam).vitals)
  const updateVitals = useStore(s => s.updateVitals)

  function prompt(field: keyof typeof vitals, label: string, placeholder: string) {
    const cur = vitals[field] || ''
    const val = window.prompt(`${label}\n${placeholder}`, cur)
    if (val !== null && val.trim()) {
      updateVitals(activeFam, { [field]: val.trim() })
    }
  }

  return (
    <div className="widget-card">
      <div className="widget-head">
        <span className="widget-title">📊 Latest Vitals</span>
        <span className="widget-sub">Tap any to update</span>
      </div>
      <div className="vitals-grid">
        <div className="vital-card" onClick={() => prompt('bp', 'Blood Pressure', 'e.g. 120/80')}>
          <div className="vital-icon">🩺</div>
          <div className="vital-val">{vitals.bp || '—'}</div>
          <div className="vital-label">Blood Pressure</div>
          <div className="vital-unit">mmHg</div>
          <div className="vital-hint">tap to edit</div>
        </div>
        <div className="vital-card" onClick={() => prompt('pulse', 'Pulse Rate', 'e.g. 72')}>
          <div className="vital-icon">💓</div>
          <div className="vital-val">{vitals.pulse || '—'}</div>
          <div className="vital-label">Pulse</div>
          <div className="vital-unit">bpm</div>
          <div className="vital-hint">tap to edit</div>
        </div>
        <div className="vital-card" onClick={() => prompt('weight', 'Body Weight', 'e.g. 60')}>
          <div className="vital-icon">🧍</div>
          <div className="vital-val">{vitals.weight || '—'}</div>
          <div className="vital-label">Weight</div>
          <div className="vital-unit">kg</div>
          <div className="vital-hint">tap to edit</div>
        </div>
      </div>
    </div>
  )
}
