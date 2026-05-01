import type { FamilyMember, Report, Prescription, MRNumber, AppStore } from '@/types'

export const DEFAULT_MAIN_MEMBER: FamilyMember = {
  profile: { name: 'Your Name', dob: '', gender: '', blood: '', phone: '' },
  vitals: { bp: '118/76', pulse: '72', weight: '54' },
  events: [
    {
      id: 'e1', date: '2026-04-12', eventType: 'DOCTOR_VISIT', confirmed: true, aiExtracted: false,
      doctor: 'Dr Nadia Tariq', hospital: 'Shifa International, Islamabad',
      diagnosis: 'Hypertension (Stage 1)', symptoms: 'Headache, dizziness',
      medicines: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: 'Ongoing' },
        { name: 'Panadol', dose: '500mg', frequency: 'As needed', duration: '5 days' },
      ],
      tests: [{ name: 'Blood pressure', result: '145/92 mmHg' }],
      followUp: 'Follow-up in 2 weeks', rawNote: '',
    },
    {
      id: 'e2', date: '2026-03-28', eventType: 'LAB_RESULT', confirmed: true, aiExtracted: false,
      doctor: 'Chughtai Lab', hospital: '', diagnosis: 'Annual blood workup', symptoms: '',
      medicines: [],
      tests: [
        { name: 'HbA1c', result: '5.8%' }, { name: 'Fasting glucose', result: '102 mg/dL' },
        { name: 'Cholesterol', result: '198 mg/dL' }, { name: 'Hemoglobin', result: '13.2 g/dL' },
      ],
      followUp: '', rawNote: '',
    },
    {
      id: 'e3', date: '2026-03-10', eventType: 'SYMPTOM', confirmed: true, aiExtracted: false,
      diagnosis: 'Shoulder pain — right side', symptoms: 'Worse at night. Self-medicated.',
      medicines: [{ name: 'Voltaren gel', dose: 'Topical', frequency: 'Twice daily', duration: '7 days' }],
      tests: [], followUp: 'See ortho if not better in a week', rawNote: '',
    },
  ],
}

export const DEFAULT_ABBU_MEMBER: FamilyMember = {
  profile: { name: 'Family Member 1', dob: '', gender: '', blood: '', phone: '' },
  vitals: { bp: '145/92', pulse: '78', weight: '78' },
  events: [
    {
      id: 'ab1', date: '2026-04-01', eventType: 'DOCTOR_VISIT', confirmed: true, aiExtracted: false,
      doctor: 'Dr Khalid Mahmood', hospital: 'Agha Khan Hospital',
      diagnosis: 'Hypertension follow-up', symptoms: 'Mild dizziness',
      medicines: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Once daily', duration: 'Ongoing' },
        { name: 'Losartan', dose: '50mg', frequency: 'Once daily', duration: 'Ongoing' },
      ],
      tests: [{ name: 'Blood pressure', result: '145/92 mmHg' }],
      followUp: '1 month follow-up', rawNote: '',
    },
  ],
}

export const DEFAULT_AMI_MEMBER: FamilyMember = {
  profile: { name: 'Family Member 2', dob: '', gender: '', blood: '', phone: '' },
  vitals: { bp: '122/80', pulse: '68', weight: '62' },
  events: [
    {
      id: 'am1', date: '2026-03-15', eventType: 'DOCTOR_VISIT', confirmed: true, aiExtracted: false,
      doctor: 'Dr Sadia Alam', hospital: 'Shifa International',
      diagnosis: 'Diabetes Type 2 management', symptoms: 'Fatigue, frequent thirst',
      medicines: [
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', duration: 'Ongoing' },
        { name: 'Glimepiride', dose: '2mg', frequency: 'Once daily', duration: 'Ongoing' },
      ],
      tests: [{ name: 'HbA1c', result: '7.2%' }, { name: 'Fasting glucose', result: '148 mg/dL' }],
      followUp: '3 months review', rawNote: '',
    },
  ],
}

export const SEED_REPORTS: Report[] = [
  { id: 'r1', date: '2026-03-28', title: 'Blood CP', lab: 'IDC Labs', category: 'Haematology', patient: 'main', notes: 'Normal ranges' },
  { id: 'r2', date: '2026-03-28', title: 'Thyroid Profile', lab: 'BCL Labs', category: 'Thyroid', patient: 'main', notes: 'TSH slightly elevated' },
  { id: 'r3', date: '2026-01-15', title: 'Lipid Profile', lab: 'Chughtai Lab', category: 'Biochemistry', patient: 'main', notes: '' },
  { id: 'r4', date: '2025-11-10', title: 'Urine D/R', lab: 'IDC Labs', category: 'Urine', patient: 'abbu', notes: '' },
  { id: 'r5', date: '2025-09-05', title: 'HbA1c', lab: 'Shifa Lab', category: 'Diabetes', patient: 'main', notes: '5.8%' },
]

export const SEED_PRESCRIPTIONS: Prescription[] = [
  { id: 'p1', date: '2026-04-12', doctor: 'Dr Nadia Tariq', hospital: 'Shifa International', diagnosis: 'Hypertension (Stage 1)', patient: 'main' },
  { id: 'p2', date: '2026-02-14', doctor: 'Dr Imran Butt', hospital: 'PIMS', diagnosis: 'URTI', patient: 'main' },
  { id: 'p3', date: '2025-12-01', doctor: 'Dr Khalid', hospital: 'Agha Khan Hospital', diagnosis: 'Seasonal flu', patient: 'abbu' },
]

export const SEED_MR_NUMBERS: MRNumber[] = [
  { id: 'm1', hospital: 'Shifa International', mrNo: 'SH-2019-44821', patient: 'main', note: '' },
  { id: 'm2', hospital: 'PIMS', mrNo: 'PIMS-87234', patient: 'main', note: '' },
  { id: 'm3', hospital: 'Agha Khan Hospital', mrNo: 'AKH-331092', patient: 'abbu', note: 'Cardiology OPD' },
]

export const DEFAULT_STORE: Omit<AppStore, 'activeFam' | 'apiKey'> = {
  families: {
    main: DEFAULT_MAIN_MEMBER,
    abbu: DEFAULT_ABBU_MEMBER,
    ami: DEFAULT_AMI_MEMBER,
  },
  reports: SEED_REPORTS,
  prescriptions: SEED_PRESCRIPTIONS,
  mrNumbers: SEED_MR_NUMBERS,
  medDosesTaken: {},
  medReminders: {},
}
