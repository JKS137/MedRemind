import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, DoseLog } from '../types';
import { scheduleMedicationReminders, cancelMedicationReminders } from './notifications';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const MEDS_KEY = 'medications';
const doseKey = (date: string) => `doses:${date}`;

export async function getMedications(): Promise<Medication[]> {
  const raw = await AsyncStorage.getItem(MEDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addMedication(data: Omit<Medication, 'id'>): Promise<Medication> {
  const meds = await getMedications();
  const newMed: Medication = { ...data, id: uuidv4() };
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify([...meds, newMed]));
  await scheduleMedicationReminders(newMed);
  return newMed;
}

export async function updateMedication(updated: Medication): Promise<void> {
  const meds = await getMedications();
  const next = meds.map(m => (m.id === updated.id ? updated : m));
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(next));
  await scheduleMedicationReminders(updated);
}

export async function deleteMedication(id: string): Promise<void> {
  const meds = await getMedications();
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(meds.filter(m => m.id !== id)));
  await cancelMedicationReminders(id);
}

export async function getDosesForDate(date: string): Promise<DoseLog[]> {
  const raw = await AsyncStorage.getItem(doseKey(date));
  return raw ? JSON.parse(raw) : [];
}

export async function markDose(
  medicationId: string,
  scheduledTime: string,
  date: string,
  status: 'taken' | 'skipped'
): Promise<void> {
  const doses = await getDosesForDate(date);
  const existing = doses.findIndex(
    d => d.medicationId === medicationId && d.scheduledTime === scheduledTime
  );
  const log: DoseLog = {
    medicationId,
    scheduledTime,
    status,
    takenAt: status === 'taken' ? new Date().toISOString() : undefined,
  };
  if (existing >= 0) doses[existing] = log;
  else doses.push(log);
  await AsyncStorage.setItem(doseKey(date), JSON.stringify(doses));
}
