'use client'

import { useStore } from '@/store'
import { initials, getFamilyColor } from '@/lib/utils'
import clsx from 'clsx'

interface Props {
  onAddMember: () => void
}

export function FamilySwitcher({ onAddMember }: Props) {
  const activeFam = useStore(s => s.activeFam)
  const families = useStore(s => s.families)
  const setActiveFam = useStore(s => s.setActiveFam)

  const LABEL_MAP: Record<string, string> = { main: 'Me', abbu: 'Abbu', ami: 'Ami ji' }

  return (
    <div className="frow">
      {Object.entries(families).map(([key, fam]) => {
        const inits = initials(fam.profile.name)
        const label = LABEL_MAP[key] ?? fam.profile.name.split(' ')[0]
        const colorClass = getFamilyColor(key)
        return (
          <div key={key} className="fchip" onClick={() => setActiveFam(key)}>
            <div className={clsx('fav', colorClass, activeFam === key && 'active')}>
              {inits}
            </div>
            <span className="fn">{label}</span>
          </div>
        )
      })}
      <div className="fchip" onClick={onAddMember}>
        <div className="fav fadd">A</div>
        <span className="fn">Add</span>
      </div>
    </div>
  )
}
