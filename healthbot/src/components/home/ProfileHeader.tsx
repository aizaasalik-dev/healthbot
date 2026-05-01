'use client'

import { calcAge, fmtLong, initials } from '@/lib/utils'
import type { FamilyProfile } from '@/types'

interface Props {
  profile: FamilyProfile
  vitals: { bp: string; pulse: string; weight: string }
  onEdit: () => void
  onNotif: () => void
}

function InfoPill({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'rgba(255,255,255,.14)', borderRadius: 6,
      padding: '4px 8px',
    }}>
      <span style={{ fontSize: 11, opacity: 0.8 }}>{icon}</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.95)', fontWeight: 500 }}>{text}</span>
    </div>
  )
}

function IconBtn({ id, icon, label, onClick }: { id?: string; icon: string; label: string; onClick: () => void }) {
  return (
    <button
      id={id}
      title={label}
      onClick={onClick}
      style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
        color: 'white', fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontFamily: 'inherit',
      }}
    >
      {icon}
    </button>
  )
}

export function ProfileHeader({ profile, onEdit, onNotif }: Props) {
  const age = calcAge(profile.dob)
  const dobFmt = fmtLong(profile.dob)
  const gIcon = profile.gender === 'Male' ? '♂' : profile.gender === 'Female' ? '♀' : '⚧'
  const inits = initials(profile.name)

  return (
    <div style={{ background: 'linear-gradient(150deg,#0F766E 0%,#0D9488 60%,#14B8A6 100%)', padding: '16px 16px 14px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
          HealthBot
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconBtn icon="🔔" label="Notifications" onClick={onNotif} />
          <IconBtn icon="✏️" label="Edit Profile" onClick={onEdit} />
        </div>
      </div>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0, letterSpacing: '.5px',
        }}>{inits}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'white', lineHeight: 1.15, letterSpacing: '-.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.name || 'Your Name'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>Personal Health Record</div>
        </div>
      </div>

      {/* Info pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {profile.gender && <InfoPill icon={gIcon} text={profile.gender} />}
        {age !== null && <InfoPill icon="🎂" text={`${age} yrs`} />}
        {profile.dob && <InfoPill icon="📅" text={dobFmt} />}
        {profile.blood && <InfoPill icon="🩸" text={profile.blood} />}
      </div>
    </div>
  )
}
