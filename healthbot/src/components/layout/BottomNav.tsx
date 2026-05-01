'use client'

import type { Page } from '@/types'
import clsx from 'clsx'

interface Props {
  currentPage: Page
  navigate: (p: Page) => void
  openAdd: () => void
}

const TABS = [
  { page: 'home' as Page, icon: '🏠', label: 'Home' },
  { page: 'timeline' as Page, icon: '📅', label: 'Timeline' },
  null, // FAB slot
  { page: 'medicines' as Page, icon: '💊', label: 'Medicines' },
  { page: 'ask' as Page, icon: '🤖', label: 'AI Chat' },
]

export function BottomNav({ currentPage, navigate, openAdd }: Props) {
  return (
    <nav className="bnav">
      {TABS.map((tab, i) => {
        if (tab === null) {
          return (
            <div key="fab" className="nfab" onClick={openAdd}>
              <div className="fab">＋</div>
              <span className="nl" style={{ color: 'var(--t3)', fontSize: 9, fontWeight: 500, marginTop: 2 }}>Add</span>
            </div>
          )
        }
        return (
          <div
            key={tab.page}
            className={clsx('ntab', currentPage === tab.page && 'active')}
            onClick={() => navigate(tab.page)}
          >
            <span className="ni">{tab.icon}</span>
            <span className="nl">{tab.label}</span>
          </div>
        )
      })}
    </nav>
  )
}
