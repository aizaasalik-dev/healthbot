import { useMemo } from 'react'
import type { Medicine, HealthEvent } from '@/types'
import { useStore } from '@/store'

export type MedSlots = { morning: Medicine[]; afternoon: Medicine[]; night: Medicine[] }

function assignSlot(m: Medicine): ('morning' | 'afternoon' | 'night')[] {
  const f = m.frequency.toLowerCase()
  if (f.includes('three') || f.includes('3x') || f.includes('tds')) return ['morning', 'afternoon', 'night']
  if (f.includes('twice') || f.includes('2x') || f.includes('bd')) return ['morning', 'night']
  if (f.includes('afternoon') || f.includes('noon')) return ['afternoon']
  if (f.includes('night') || f.includes('evening') || f.includes('bedtime')) return ['night']
  return ['morning']
}

export function useMedSlots(): MedSlots {
  const activeFam = useStore(s => s.activeFam)
  const getFamilyEvents = useStore(s => s.getFamilyEvents)

  return useMemo(() => {
    const events: HealthEvent[] = getFamilyEvents(activeFam)
    const seen = new Set<string>()
    const allMeds: Medicine[] = []

    events.forEach(e =>
      (e.medicines ?? []).forEach(m => {
        const k = m.name.toLowerCase()
        if (!seen.has(k)) { seen.add(k); allMeds.push(m) }
      })
    )

    const morning: Medicine[] = []
    const afternoon: Medicine[] = []
    const night: Medicine[] = []

    allMeds.forEach(m => {
      const slots = assignSlot(m)
      if (slots.includes('morning')) morning.push(m)
      if (slots.includes('afternoon')) afternoon.push(m)
      if (slots.includes('night')) night.push(m)
    })

    return { morning, afternoon, night }
  }, [activeFam, getFamilyEvents])
}
