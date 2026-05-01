import type { Page } from '@/types'

export interface PageProps {
  navigate: (p: Page) => void
  goBack: () => void
  openAdd: () => void
}
