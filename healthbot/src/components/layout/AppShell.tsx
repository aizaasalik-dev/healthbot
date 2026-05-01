'use client'

import { useState, useCallback } from 'react'
import type { Page } from '@/types'
import { BottomNav } from './BottomNav'
import { HomePage } from '@/components/home/HomePage'
import { TimelinePage } from '@/components/timeline/TimelinePage'
import { MedicinesPage } from '@/components/medicines/MedicinesPage'
import { AskPage } from '@/components/chat/AskPage'
import { ExportPage } from '@/components/layout/ExportPage'
import { ReportsPage } from '@/components/reports/ReportsPage'
import { PrescriptionsPage } from '@/components/prescriptions/PrescriptionsPage'
import { MRNumbersPage } from '@/components/mrnumbers/MRNumbersPage'
import { AddEntrySheet } from '@/components/modals/AddEntrySheet'

export function AppShell() {
  const [page, setPage] = useState<Page>('home')
  const [prevPage, setPrevPage] = useState<Page>('home')
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const navigate = useCallback((to: Page) => {
    setPrevPage(page)
    setPage(to)
  }, [page])

  const goBack = useCallback(() => {
    setPage(prevPage)
  }, [prevPage])

  const openAdd = useCallback(() => setAddSheetOpen(true), [])
  const closeAdd = useCallback(() => setAddSheetOpen(false), [])

  const sharedProps = { navigate, goBack, openAdd }

  return (
    <>
      {page === 'home'          && <HomePage          {...sharedProps} />}
      {page === 'timeline'      && <TimelinePage      {...sharedProps} />}
      {page === 'medicines'     && <MedicinesPage     {...sharedProps} />}
      {page === 'ask'           && <AskPage           {...sharedProps} />}
      {page === 'export'        && <ExportPage        {...sharedProps} />}
      {page === 'reports'       && <ReportsPage       {...sharedProps} />}
      {page === 'prescriptions' && <PrescriptionsPage {...sharedProps} />}
      {page === 'mrnumbers'     && <MRNumbersPage     {...sharedProps} />}

      <BottomNav currentPage={page} navigate={navigate} openAdd={openAdd} />

      {addSheetOpen && (
        <AddEntrySheet onClose={closeAdd} />
      )}
    </>
  )
}
