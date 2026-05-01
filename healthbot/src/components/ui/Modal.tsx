'use client'

import type { ReactNode } from 'react'

// ── Modal ──────────────────────────────────────────────────────
interface ModalProps {
  title: string
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}

export function Modal({ title, onClose, footer, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

// ── Bottom Sheet ───────────────────────────────────────────────
interface SheetProps {
  title: string
  subtitle?: string
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}

export function BottomSheet({ title, subtitle, onClose, footer, children }: SheetProps) {
  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet-box">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div className="sheet-title">{title}</div>
          {subtitle && <div className="sheet-sub">{subtitle}</div>}
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}
