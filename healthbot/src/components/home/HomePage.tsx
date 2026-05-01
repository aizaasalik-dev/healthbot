'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import type { PageProps } from '@/components/layout/types'
import { ProfileHeader } from './ProfileHeader'
import { FamilySwitcher } from './FamilySwitcher'
import { PillBoxTracker } from './PillBoxTracker'
import { VitalsWidget } from './VitalsWidget'
import { EventCard } from '@/components/ui/EventCard'
import { ProfileModal } from '@/components/modals/ProfileModal'

export function HomePage({ navigate, openAdd }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const getFamilyData = useStore(s => s.getFamilyData)
  const getFamilyEvents = useStore(s => s.getFamilyEvents)
  const getFamilyReports = useStore(s => s.getFamilyReports)
  const getFamilyPrescriptions = useStore(s => s.getFamilyPrescriptions)
  const getFamilyMRNumbers = useStore(s => s.getFamilyMRNumbers)

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileMode, setProfileMode] = useState<'edit' | 'add'>('edit')

  const famData = getFamilyData(activeFam)
  const events = getFamilyEvents(activeFam).slice(0, 5)
  const reportCount = getFamilyReports(activeFam).length
  const rxCount = getFamilyPrescriptions(activeFam).length
  const mrCount = getFamilyMRNumbers(activeFam).length

  function handleEditProfile() {
    setProfileMode('edit')
    setProfileModalOpen(true)
  }

  function handleAddMember() {
    setProfileMode('add')
    setProfileModalOpen(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 70 }}>
      <ProfileHeader
        profile={famData.profile}
        vitals={famData.vitals}
        isMe={activeFam === 'main'}
        onEdit={handleEditProfile}
        onNotif={() => navigate('export')}
      />

      <FamilySwitcher onAddMember={handleAddMember} />

      <div className="content">
        {/* Reminder alert */}
        <div className="alert" style={{ marginTop: 0 }}>
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">
            <strong>Reminder:</strong> Abu&apos;s follow-up with Dr Nadia is tomorrow. BP medicine refill also due.
          </span>
        </div>

        {/* Medicine pill boxes + Vitals */}
        <PillBoxTracker />
        <VitalsWidget />

        {/* Vault boxes */}
        <div className="vault-row">
          {[
            { icon: '🧪', label: 'Lab Reports', count: `${reportCount} reports`, page: 'reports' as const },
            { icon: '💊', label: 'Prescriptions', count: `${rxCount} saved`, page: 'prescriptions' as const },
            { icon: '🏥', label: 'MR Numbers', count: `${mrCount} hospitals`, page: 'mrnumbers' as const },
          ].map(v => (
            <div key={v.page} className="vault-box" onClick={() => navigate(v.page)}>
              <div className="vault-box-icon">{v.icon}</div>
              <div className="vault-box-label">{v.label}</div>
              <div className="vault-box-count">{v.count}</div>
            </div>
          ))}
        </div>

        {/* Quick add */}
        <div className="section-header">
          <span className="section-title">Quick add</span>
        </div>
        <div className="qgrid">
          {[
            { icon: '🩺', label: 'Doctor visit', sub: 'Add consultation' },
            { icon: '📋', label: 'Upload report', sub: 'Lab / prescription' },
            { icon: '🤒', label: 'Log symptom', sub: 'How are you feeling?' },
            { icon: '💊', label: 'Medicine taken', sub: 'Mark as taken' },
          ].map(q => (
            <div key={q.label} className="qbtn" onClick={openAdd}>
              <div className="qbtn-icon">{q.icon}</div>
              <div className="qbtn-label">{q.label}</div>
              <div className="qbtn-sub">{q.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent events */}
        <div className="section-header">
          <span className="section-title">Recent records</span>
          <span className="section-link" onClick={() => navigate('timeline')}>See all →</span>
        </div>
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No records yet. Add your first entry!</div>
          </div>
        ) : (
          events.map(e => <EventCard key={e.id} event={e} />)
        )}
        <div style={{ height: 12 }} />
      </div>

      {profileModalOpen && (
        <ProfileModal
          mode={profileMode}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  )
}
