import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Worker {
  id: string;
  name: string;
  role: string;
}

interface Job {
  id: string;
  job_number: string;
  description: string;
  site: string;
}

const DoseEntryScreen: React.FC = () => {
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [dose, setDose] = useState('');
  const [sourceInstrument, setSourceInstrument] = useState('');
  const [instrumentSerial, setInstrumentSerial] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load workers and jobs on component mount
  useEffect(() => {
    loadWorkersAndJobs();
  }, []);

  const loadWorkersAndJobs = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const workersResponse = await fetch('/api/workers');
      // const jobsResponse = await fetch('/api/jobs');

      // Mock data for now
      const mockWorkers: Worker[] = [
        { id: '1', name: 'John Smith', role: 'Technician' },
        { id: '2', name: 'Jane Doe', role: 'Supervisor' },
        { id: '3', name: 'Bob Wilson', role: 'RPO' },
      ];

      const mockJobs: Job[] = [
        {
          id: '1',
          job_number: 'JOB-001',
          description: 'Reactor Maintenance',
          site: 'Unit 1',
        },
        {
          id: '2',
          job_number: 'JOB-002',
          description: 'Fuel Handling',
          site: 'Unit 2',
        },
        {
          id: '3',
          job_number: 'JOB-003',
          description: 'Waste Processing',
          site: 'Unit 1',
        },
      ];

      setWorkers(mockWorkers);
      setJobs(mockJobs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workers and jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !selectedWorker ||
      !selectedJob ||
      !dose ||
      !sourceInstrument ||
      !instrumentSerial ||
      !location
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const doseValue = parseFloat(dose);
    if (isNaN(doseValue) || doseValue < 0 || doseValue > 1000) {
      Alert.alert('Error', 'Please enter a valid dose value (0-1000 mSv)');
      return;
    }

    try {
      setIsSubmitting(true);

      const doseData = {
        worker_id: selectedWorker,
        job_id: selectedJob,
        timestamp: new Date().toISOString(),
        dose_mSv: doseValue,
        source_instrument: sourceInstrument,
        instrument_serial: instrumentSerial,
        location: location,
        notes: notes || undefined,
      };

      // TODO: Replace with actual API call
      // const response = await fetch('/api/dose', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(doseData),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Dose entry logged successfully');

      // Reset form
      setSelectedWorker('');
      setSelectedJob('');
      setDose('');
      setSourceInstrument('');
      setInstrumentSerial('');
      setLocation('');
      setNotes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to log dose entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading workers and jobs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Dose Entry</Text>
        <Text style={styles.subtitle}>Record radiation dose for worker</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Worker *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedWorker}
              onValueChange={setSelectedWorker}
              enabled={!isSubmitting}
              style={styles.picker}
            >
              <Picker.Item label="Select a worker" value="" />
              {workers.map((worker) => (
                <Picker.Item
                  key={worker.id}
                  label={`${worker.name} (${worker.role})`}
                  value={worker.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedJob}
              onValueChange={setSelectedJob}
              enabled={!isSubmitting}
              style={styles.picker}
            >
              <Picker.Item label="Select a job" value="" />
              {jobs.map((job) => (
                <Picker.Item
                  key={job.id}
                  label={`${job.job_number} - ${job.description} (${job.site})`}
                  value={job.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dose (mSv) *</Text>
          <TextInput
            style={styles.input}
            value={dose}
            onChangeText={setDose}
            placeholder="Enter dose in mSv"
            keyboardType="decimal-pad"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Source Instrument *</Text>
          <TextInput
            style={styles.input}
            value={sourceInstrument}
            onChangeText={setSourceInstrument}
            placeholder="e.g., Dosimeter Model X"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instrument Serial *</Text>
          <TextInput
            style={styles.input}
            value={instrumentSerial}
            onChangeText={setInstrumentSerial}
            placeholder="e.g., SN123456"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Reactor Room A"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Logging...' : 'Log Dose'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoseEntryScreen;
