'use client'

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldProps {
  label: string
  children: React.ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="form-input" {...props} />
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="form-input" {...props}>{children}</select>
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="form-input" {...props} />
}
