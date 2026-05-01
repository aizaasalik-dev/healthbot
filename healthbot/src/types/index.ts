// ── Core domain types ──────────────────────────────────────────

export type EventType = 'DOCTOR_VISIT' | 'LAB_RESULT' | 'SYMPTOM' | 'PRESCRIPTION'

export interface Medicine {
  name: string
  dose: string
  frequency: string
  duration: string
}

export interface TestResult {
  name: string
  result: string
}

export interface HealthEvent {
  id: string
  date: string          // YYYY-MM-DD
  eventType: EventType
  confirmed: boolean
  aiExtracted: boolean
  doctor?: string
  hospital?: string
  diagnosis?: string
  symptoms?: string
  followUp?: string
  rawNote?: string
  medicines: Medicine[]
  tests: TestResult[]
}

export interface FamilyProfile {
  name: string
  dob: string           // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other' | ''
  blood?: string
  phone?: string
  relation?: string
}

export interface Vitals {
  bp: string
  pulse: string
  weight: string
}

export interface FamilyMember {
  profile: FamilyProfile
  vitals: Vitals
  events: HealthEvent[]
}

export interface Report {
  id: string
  date: string
  title: string
  lab: string
  category: ReportCategory
  patient: string       // family key e.g. 'main' | 'abbu' | 'ami'
  notes: string
  imageDataUrl?: string
}

export type ReportCategory =
  | 'Haematology'
  | 'Biochemistry'
  | 'Thyroid'
  | 'Diabetes'
  | 'Urine'
  | 'Radiology'
  | 'Other'

export interface Prescription {
  id: string
  date: string
  doctor: string
  hospital: string
  diagnosis: string
  patient: string
  imageDataUrl?: string
}

export interface MRNumber {
  id: string
  hospital: string
  mrNo: string
  patient: string
  note?: string
}

export type MedDosesTaken = Record<string, boolean>
// key format: `${famKey}:${YYYY-MM-DD}:${slot}:${medNameLower}`

export interface MedicineReminder {
  enabled: boolean
  time: string // HH:mm
}

export type MedicineReminders = Record<string, MedicineReminder>
// key format: `${famKey}:${medNameLower}`

// ── Store shape ────────────────────────────────────────────────
export interface AppStore {
  // Families map — 'main' always exists
  families: Record<string, FamilyMember>
  reports: Report[]
  prescriptions: Prescription[]
  mrNumbers: MRNumber[]
  medDosesTaken: MedDosesTaken
  medReminders: MedicineReminders
  // Active family key
  activeFam: string
  // API key (stored to localStorage separately)
  apiKey: string
}

// ── UI types ───────────────────────────────────────────────────
export type Page =
  | 'home'
  | 'timeline'
  | 'medicines'
  | 'ask'
  | 'export'
  | 'reports'
  | 'prescriptions'
  | 'mrnumbers'
  | 'detail'

export type AddSheetMode = 'chat' | 'upload' | 'form'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string | AnthropicContent[]
  displayHtml?: string
  imageDataUrl?: string
}

export interface AnthropicContent {
  type: 'text' | 'image'
  text?: string
  source?: {
    type: 'base64'
    media_type: string
    data: string
  }
}
