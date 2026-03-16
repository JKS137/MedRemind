import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Medication } from '../types';

type Props = {
  medication: Medication;
  onPress?: () => void;
};

export function MedicationCard({ medication, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: medication.color }]} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={styles.dosage}>{medication.dosage}</Text>
      </View>
      <Text style={styles.times}>{medication.times.join(' · ')}</Text>
      <Text style={styles.meta}>{medication.active ? 'Active' : 'Inactive'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dosage: {
    fontSize: 14,
    color: '#555',
  },
  times: {
    marginTop: 10,
    fontSize: 13,
    color: '#666',
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: '#999',
  },
});
