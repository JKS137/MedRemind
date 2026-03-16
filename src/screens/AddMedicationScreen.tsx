import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addMedication } from '../lib/storage';
import { MedicationForm } from '../types';

const DEFAULT_COLOR = '#2C6E49';

export function AddMedicationScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [withFood, setWithFood] = useState(false);
  const [refillCount, setRefillCount] = useState('30');
  const [refillThreshold, setRefillThreshold] = useState('7');
  const [color, setColor] = useState(DEFAULT_COLOR);

  function updateTime(index: number, value: string) {
    const next = [...times];
    next[index] = value;
    setTimes(next);
  }

  function addTime() {
    setTimes([...times, '08:00']);
  }

  function removeTime(idx: number) {
    if (times.length === 1) return;
    setTimes(times.filter((_, i) => i !== idx));
  }

  async function onSave() {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a medication name.');
      return;
    }

    await addMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      times,
      withFood,
      startDate: new Date().toISOString(),
      active: true,
      refillCount: Number(refillCount) || 0,
      refillThreshold: Number(refillThreshold) || 7,
      color,
    });

    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Add Medication</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Metformin"
        />

        <Text style={styles.label}>Dosage</Text>
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="500mg"
        />

        <Text style={styles.label}>Form</Text>
        <View style={styles.row}> 
          {(['tablet', 'capsule', 'liquid', 'injection'] as MedicationForm[]).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                form === option && styles.chipActive,
              ]}
              onPress={() => setForm(option)}
            >
              <Text style={[styles.chipText, form === option && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Times</Text>
        {times.map((t, idx) => (
          <View key={idx} style={styles.timeRow}>
            <TextInput
              style={[styles.input, styles.timeInput]}
              value={t}
              onChangeText={value => updateTime(idx, value)}
              placeholder="08:00"
            />
            <TouchableOpacity style={styles.removeButton} onPress={() => removeTime(idx)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addTimeButton} onPress={addTime}>
          <Text style={styles.addTimeText}>+ Add time</Text>
        </TouchableOpacity>

        <Text style={styles.label}>With food</Text>
        <TouchableOpacity
          style={[styles.toggle, withFood && styles.toggleActive]}
          onPress={() => setWithFood(v => !v)}
        >
          <Text style={styles.toggleText}>{withFood ? 'Yes' : 'No'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Starting pill count</Text>
        <TextInput
          style={styles.input}
          value={refillCount}
          onChangeText={setRefillCount}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Refill alert threshold (days)</Text>
        <TextInput
          style={styles.input}
          value={refillThreshold}
          onChangeText={setRefillThreshold}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.row}> 
          {['#2C6E49', '#2962FF', '#C97A2E', '#B00020', '#6A1B9A', '#D81B60'].map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveText}>Save Medication</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
    color: '#1A1A1A',
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#2C6E49',
    borderColor: '#2C6E49',
  },
  chipText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 12,
  },
  removeText: {
    color: '#B00020',
    fontWeight: '600',
  },
  addTimeButton: {
    marginTop: 8,
  },
  addTimeText: {
    color: '#2C6E49',
    fontWeight: '600',
  },
  toggle: {
    width: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#2C6E49',
    borderColor: '#2C6E49',
  },
  toggleText: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#2C6E49',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
