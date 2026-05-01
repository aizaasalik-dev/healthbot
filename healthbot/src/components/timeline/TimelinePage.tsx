'use client'

import { useStore } from '@/store'
import { fmtMonth } from '@/lib/utils'
import { Topbar } from '@/components/ui/Topbar'
import { EventCard } from '@/components/ui/EventCard'
import type { PageProps } from '@/components/layout/types'

export function TimelinePage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const events = useStore(s => s.getFamilyEvents(activeFam))

  // Group by month
  const grouped: Record<string, typeof events> = {}
  events.forEach(e => {
    const m = fmtMonth(e.date)
    if (!grouped[m]) grouped[m] = []
    grouped[m].push(e)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <Topbar title="Timeline" onBack={goBack} />
      <div className="content">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No records yet.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([month, evs]) => (
            <div key={month}>
              <div className="month-label">{month}</div>
              {evs.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          ))
        )}
        <div style={{ height: 12 }} />
      </div>
    </div>
  )
}
