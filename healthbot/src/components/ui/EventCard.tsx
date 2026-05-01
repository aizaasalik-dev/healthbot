'use client'

import { fmt, EVENT_META } from '@/lib/utils'
import type { HealthEvent } from '@/types'

interface Props {
  event: HealthEvent
  onClick?: () => void
}

export function EventCard({ event, onClick }: Props) {
  const meta = EVENT_META[event.eventType]
  const title = event.diagnosis || event.symptoms || 'Health Event'
  const sub = [event.doctor, event.hospital].filter(Boolean).join(' · ') || meta.label

  return (
    <div className="ecard" onClick={onClick}>
      <div className="ecard-ico" style={{ background: meta.bg }}>{meta.icon}</div>
      <div className="ecard-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span className="ecard-title">{title}</span>
          <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
          {event.aiExtracted && !event.confirmed && (
            <span style={{ fontSize: 9, background: '#FEF9C3', color: '#A16207', border: '1px solid #FDE68A', borderRadius: 4, padding: '1px 4px' }}>
              Verify
            </span>
          )}
        </div>
        <div className="ecard-sub">{sub}</div>
      </div>
      <div className="ecard-date">{fmt(event.date)}</div>
    </div>
  )
}
