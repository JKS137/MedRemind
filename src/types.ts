export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'injection';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  form: MedicationForm;
  times: string[];
  withFood: boolean;
  startDate: string;
  active: boolean;
  refillCount: number;
  refillThreshold: number;
  color: string;
  notes?: string;
};

export type DoseLog = {
  medicationId: string;
  scheduledTime: string;
  status: 'taken' | 'skipped' | 'pending';
  takenAt?: string;
};

export type Settings = {
  userName: string;
  notificationsEnabled: boolean;
  snoozeMinutes: number;
  isPremium: boolean;
  premiumExpiresAt?: string;
};
