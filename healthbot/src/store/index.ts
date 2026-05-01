'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppStore, HealthEvent, Report, Prescription, MRNumber,
  FamilyMember, FamilyProfile, Vitals,
} from '@/types'
import { DEFAULT_STORE } from '@/lib/seed'
import { todayKey, uid } from '@/lib/utils'

interface Actions {
  // Family
  setActiveFam: (key: string) => void
  addFamilyMember: (key: string, member: FamilyMember) => void
  updateProfile: (famKey: string, profile: Partial<FamilyProfile>) => void
  updateVitals: (famKey: string, vitals: Partial<Vitals>) => void

  // Events
  addEvent: (famKey: string, event: Omit<HealthEvent, 'id'>) => void
  deleteEvent: (famKey: string, eventId: string) => void

  // Medicine doses
  toggleMedDose: (famKey: string, slot: string, medName: string) => void
  isMedTaken: (famKey: string, slot: string, medName: string) => boolean
  setMedicineReminder: (famKey: string, medName: string, time: string) => void
  toggleMedicineReminder: (famKey: string, medName: string, enabled: boolean) => void

  // Reports
  addReport: (report: Omit<Report, 'id'>) => void

  // Prescriptions
  addPrescription: (rx: Omit<Prescription, 'id'>) => void

  // MR Numbers
  addMRNumber: (mr: Omit<MRNumber, 'id'>) => void

  // API key
  setApiKey: (key: string) => void

  // Selectors (derived)
  getFamilyEvents: (famKey: string) => HealthEvent[]
  getFamilyData: (famKey: string) => FamilyMember
  getFamilyReports: (famKey: string) => Report[]
  getFamilyPrescriptions: (famKey: string) => Prescription[]
  getFamilyMRNumbers: (famKey: string) => MRNumber[]
}

type Store = AppStore & Actions

function neutralizeLegacySeedName(key: string, name: string): string {
  const n = (name || '').trim()
  if (!n) return key === 'main' ? 'Your Name' : 'Family Member'

  if (/^aiza salik$/i.test(n)) return 'Your Name'
  if (/abbu|tariq salik/i.test(n)) return 'Family Member 1'
  if (/ami|sabina salik/i.test(n)) return 'Family Member 2'

  return n
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STORE,
      activeFam: 'main',
      apiKey: '',

      // ── Family ──────────────────────────────────────────────
      setActiveFam: (key) => set({ activeFam: key }),

      addFamilyMember: (key, member) =>
        set(s => ({ families: { ...s.families, [key]: member } })),

      updateProfile: (famKey, profile) =>
        set(s => ({
          families: {
            ...s.families,
            [famKey]: {
              ...s.families[famKey],
              profile: { ...s.families[famKey].profile, ...profile },
            },
          },
        })),

      updateVitals: (famKey, vitals) =>
        set(s => ({
          families: {
            ...s.families,
            [famKey]: {
              ...s.families[famKey],
              vitals: { ...s.families[famKey].vitals, ...vitals },
            },
          },
        })),

      // ── Events ──────────────────────────────────────────────
      addEvent: (famKey, event) => {
        const newEvent = { ...event, id: uid() }
        set(s => ({
          families: {
            ...s.families,
            [famKey]: {
              ...s.families[famKey],
              events: [newEvent, ...(s.families[famKey]?.events ?? [])],
            },
          },
        }))
      },

      deleteEvent: (famKey, eventId) =>
        set(s => ({
          families: {
            ...s.families,
            [famKey]: {
              ...s.families[famKey],
              events: s.families[famKey].events.filter(e => e.id !== eventId),
            },
          },
        })),

      // ── Medicine doses ───────────────────────────────────────
      toggleMedDose: (famKey, slot, medName) => {
        const key = `${famKey}:${todayKey()}:${slot}:${medName.toLowerCase()}`
        set(s => ({
          medDosesTaken: { ...s.medDosesTaken, [key]: !s.medDosesTaken[key] },
        }))
      },

      isMedTaken: (famKey, slot, medName) => {
        const key = `${famKey}:${todayKey()}:${slot}:${medName.toLowerCase()}`
        return get().medDosesTaken[key] === true
      },

      setMedicineReminder: (famKey, medName, time) => {
        const key = `${famKey}:${medName.toLowerCase()}`
        set(s => ({
          medReminders: {
            ...s.medReminders,
            [key]: {
              enabled: s.medReminders[key]?.enabled ?? true,
              time,
            },
          },
        }))
      },

      toggleMedicineReminder: (famKey, medName, enabled) => {
        const key = `${famKey}:${medName.toLowerCase()}`
        set(s => ({
          medReminders: {
            ...s.medReminders,
            [key]: {
              enabled,
              time: s.medReminders[key]?.time ?? '08:00',
            },
          },
        }))
      },

      // ── Reports ─────────────────────────────────────────────
      addReport: (report) =>
        set(s => ({ reports: [{ ...report, id: uid() }, ...s.reports] })),

      // ── Prescriptions ────────────────────────────────────────
      addPrescription: (rx) =>
        set(s => ({ prescriptions: [{ ...rx, id: uid() }, ...s.prescriptions] })),

      // ── MR Numbers ───────────────────────────────────────────
      addMRNumber: (mr) =>
        set(s => ({ mrNumbers: [{ ...mr, id: uid() }, ...s.mrNumbers] })),

      // ── API Key ──────────────────────────────────────────────
      setApiKey: (key) => set({ apiKey: key }),

      // ── Selectors ────────────────────────────────────────────
      getFamilyData: (famKey) => get().families[famKey] ?? get().families.main,

      getFamilyEvents: (famKey) => {
        const fam = get().families[famKey] ?? get().families.main
        return [...(fam.events ?? [])].sort((a, b) => b.date.localeCompare(a.date))
      },

      getFamilyReports: (famKey) =>
        get().reports.filter(r => r.patient === famKey).sort((a, b) => b.date.localeCompare(a.date)),

      getFamilyPrescriptions: (famKey) =>
        get().prescriptions.filter(p => p.patient === famKey).sort((a, b) => b.date.localeCompare(a.date)),

      getFamilyMRNumbers: (famKey) =>
        get().mrNumbers.filter(m => m.patient === famKey),
    }),
    {
      name: 'healthbot-v3',
      version: 1,
      migrate: (persistedState: any) => {
        if (!persistedState || typeof persistedState !== 'object') return persistedState
        if (!persistedState.families || typeof persistedState.families !== 'object') return persistedState

        const nextFamilies = { ...persistedState.families }
        Object.entries(nextFamilies).forEach(([key, fam]: any) => {
          if (!fam?.profile) return
          nextFamilies[key] = {
            ...fam,
            profile: {
              ...fam.profile,
              name: neutralizeLegacySeedName(key, fam.profile.name ?? ''),
            },
          }
        })

        return { ...persistedState, families: nextFamilies }
      },
      // Only persist data, not derived functions
      partialize: (s) => ({
        families: s.families,
        reports: s.reports,
        prescriptions: s.prescriptions,
        mrNumbers: s.mrNumbers,
        medDosesTaken: s.medDosesTaken,
        medReminders: s.medReminders,
        apiKey: s.apiKey,
      }),
    }
  )
)
