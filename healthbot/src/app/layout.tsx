import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HealthBot — Your Personal Health Memory',
  description: 'AI-powered personal health tracker for Pakistan',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  )
}
