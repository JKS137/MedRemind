import { getDosesForDate, markDose } from './storage';
import { getMedications } from './storage';
import { daysRemaining, isRefillUrgent, decrementRefill } from './refill';
import { DoseLog, Medication } from '../types';

export type TodayDose = {
  medication: Medication;
  scheduledTime: string;
  status: DoseLog['status'];
  takenAt?: string;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

export async function getTodayDoses(): Promise<TodayDose[]> {
  const meds = await getMedications();
  const logs = await getDosesForDate(todayKey());

  const doses: TodayDose[] = [];

  for (const med of meds.filter(m => m.active)) {
    for (const time of med.times) {
      const existing = logs.find(l => l.medicationId === med.id && l.scheduledTime === time);
      doses.push({
        medication: med,
        scheduledTime: time,
        status: existing?.status ?? 'pending',
        takenAt: existing?.takenAt,
      });
    }
  }

  // sort by time for predictable display
  doses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  return doses;
}

export async function getTodayStats() {
  const doses = await getTodayDoses();
  const total = doses.length;
  const taken = doses.filter(d => d.status === 'taken').length;
  const skipped = doses.filter(d => d.status === 'skipped').length;
  const pending = doses.filter(d => d.status === 'pending').length;
  return { total, taken, skipped, pending };
}

export async function getUrgentRefill(): Promise<{ medication: Medication; daysRemaining: number } | null> {
  const meds = await getMedications();
  const urgent = meds
    .filter(m => m.active)
    .map(m => ({ med: m, daysRemaining: daysRemaining(m) }))
    .filter(x => isRefillUrgent(x.med))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (urgent.length === 0) return null;
  return urgent[0];
}

export async function markDoseTaken(medicationId: string, scheduledTime: string) {
  await markDose(medicationId, scheduledTime, todayKey(), 'taken');
  await decrementRefill(medicationId);
}

export async function markDoseSkipped(medicationId: string, scheduledTime: string) {
  await markDose(medicationId, scheduledTime, todayKey(), 'skipped');
}
