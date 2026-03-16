import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  getTodayDoses,
  getTodayStats,
  getUrgentRefill,
  markDoseTaken,
  TodayDose,
} from '../lib/dashboard';

export function HomeScreen() {
  const [doses, setDoses] = useState<TodayDose[]>([]);
  const [stats, setStats] = useState({ total: 0, taken: 0, pending: 0, skipped: 0 });
  const [refill, setRefill] = useState<{ medicationId: string; name: string; daysRemaining: number } | null>(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isFocused) return;
    load();
  }, [isFocused]);

  async function load() {
    setDoses(await getTodayDoses());
    setStats(await getTodayStats());
    const urgent = await getUrgentRefill();
    setRefill(urgent ? { medicationId: urgent.medication.id, name: urgent.medication.name, daysRemaining: urgent.daysRemaining } : null);
  }

  const progress = stats.total > 0 ? stats.taken / stats.total : 0;
  const progressPercent = Math.round(progress * 100);

  async function handleTakeNow(dose: TodayDose) {
    await markDoseTaken(dose.medication.id, dose.scheduledTime);
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.title}>Today</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <MaterialIcons name="notifications" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Daily Progress</Text>
              <Text style={styles.progressTitle}>Doses taken today</Text>
            </View>
            <Text style={styles.progressValue}>
              {stats.taken}
              <Text style={styles.progressValueSecondary}>/{stats.total}</Text>
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Doses</Text>
          <Text style={styles.sectionTag}>{doses.length} Prescriptions</Text>
        </View>

        {doses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No medications yet.</Text>
            <Text style={styles.emptySub}>Tap + to add your first medication.</Text>
          </View>
        ) : (
          doses.map(dose => {
            const isTaken = dose.status === 'taken';
            const isSkipped = dose.status === 'skipped';
            const isPending = dose.status === 'pending';
            const isUrgent = isPending;

            const cardStyle = [styles.doseCard];
            if (isUrgent) cardStyle.push(styles.doseCardUrgent);

            return (
              <View key={`${dose.medication.id}-${dose.scheduledTime}`} style={cardStyle}>
                <View style={[styles.doseIconWrapper, isUrgent && styles.doseIconWrapperUrgent]}>
                  <MaterialIcons name="pill" size={22} color={isUrgent ? '#D67B28' : '#2C6E49'} />
                </View>
                <View style={styles.doseContent}>
                  <Text style={styles.doseName}>{dose.medication.name} {dose.medication.dosage}</Text>
                  <Text style={isTaken ? styles.doseMetaTaken : isUrgent ? styles.doseMetaUrgent : styles.doseMeta}>
                    <MaterialIcons name={isTaken ? 'check_circle' : isUrgent ? 'alarm' : 'schedule'} size={14} />
                    {isTaken ? ` Taken ${dose.takenAt ? new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` : isUrgent ? ` Due ${dose.scheduledTime}` : ` Scheduled ${dose.scheduledTime}`}
                  </Text>
                </View>
                {isUrgent && (
                  <TouchableOpacity style={styles.takeButton} onPress={() => handleTakeNow(dose)}>
                    <Text style={styles.takeText}>Take Now</Text>
                  </TouchableOpacity>
                )}
                {isTaken && (
                  <View style={styles.statusDotTaken}>
                    <MaterialIcons name="check_circle" size={20} color="#2C6E49" />
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {refill ? (
        <View style={styles.refillCard}>
          <MaterialIcons name="info" size={20} color="#D67B28" />
          <View style={styles.refillTextWrap}>
            <Text style={styles.refillTitle}>Refill Needed</Text>
            <Text style={styles.refillSubtitle} numberOfLines={1}>
              {refill.name} is running low. You have {refill.daysRemaining} days left.
            </Text>
          </View>
          <TouchableOpacity style={styles.refillAction} onPress={() => {}}>
            <Text style={styles.refillActionText}>Order now</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  greeting: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 6,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  progressCard: {
    borderRadius: 20,
    backgroundColor: '#1A4D2E',
    padding: 18,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  progressValue: {
    color: '#E8DFCA',
    fontSize: 36,
    fontWeight: '900',
  },
  progressValueSecondary: {
    fontSize: 18,
    color: 'rgba(232,223,202,0.8)',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E8DFCA',
    borderRadius: 999,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    backgroundColor: 'rgba(43,133,108,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
  },
  emptySub: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  doseCardUrgent: {
    backgroundColor: 'rgba(214,123,40,0.1)',
    borderColor: 'rgba(214,123,40,0.25)',
  },
  doseIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(44,110,73,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  doseIconWrapperUrgent: {
    backgroundColor: 'rgba(214,123,40,0.12)',
  },
  doseContent: {
    flex: 1,
  },
  doseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  doseMeta: {
    marginTop: 6,
    fontSize: 13,
    color: '#6B7280',
  },
  doseMetaTaken: {
    marginTop: 6,
    fontSize: 13,
    color: '#2C6E49',
  },
  doseMetaUrgent: {
    marginTop: 6,
    fontSize: 13,
    color: '#D67B28',
  },
  takeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#D67B28',
  },
  takeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusDotTaken: {
    marginLeft: 12,
  },
  refillCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 88,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(214,123,40,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  refillTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  refillTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  refillSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#4B5563',
  },
  refillAction: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(214,123,40,0.15)',
  },
  refillActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D67B28',
  },
});
