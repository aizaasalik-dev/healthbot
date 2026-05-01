'use client'

import type { ReactNode } from 'react'

interface Props {
  title?: string
  onBack?: () => void
  right?: ReactNode
  children?: ReactNode
}

export function Topbar({ title, onBack, right, children }: Props) {
  return (
    <div className="topbar">
      {children ?? (
        <>
          <div className="topbar-back">
            {onBack && (
              <button className="back-btn" onClick={onBack}>←</button>
            )}
            {title && <span className="topbar-title">{title}</span>}
          </div>
          {right && <div>{right}</div>}
        </>
      )}
    </div>
  )
}
