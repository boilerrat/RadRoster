import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { api } from "../config/api";
import DoseChart from "../components/DoseChart";

interface DoseSummary {
  totalDose: number;
  averageDose: number;
  variance: number;
  forecast: {
    currentDose: number;
    elapsedTimeMinutes: number;
    remainingTimeMinutes: number;
    forecastEndOfShift: number;
    forecastEndOfJob: number;
    hourlyRate: number;
    isOnTrack: boolean;
    warnings: string[];
  };
  entryCount: number;
  lastEntry: string | null;
}

interface Job {
  id: string;
  job_number: string;
  site: string;
  status: string;
  start_time: string;
  planned_duration_min: number;
}

interface DoseEntry {
  id: string;
  worker_id: string;
  job_id: string;
  timestamp: string;
  dose_mSv: number;
  source_instrument: string;
  instrument_serial: string;
  location: string;
  notes?: string;
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [doseSummary, setDoseSummary] = useState<DoseSummary | null>(null);
  const [doseEntries, setDoseEntries] = useState<DoseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchDoseSummary(selectedJob.id);
      fetchDoseEntries(selectedJob.id);
    }
  }, [selectedJob]);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs?status=in_progress&limit=10");

      if (response.data.success) {
        setActiveJobs(response.data.data.jobs);
        // Auto-select first active job if available
        if (response.data.data.jobs.length > 0 && !selectedJob) {
          setSelectedJob(response.data.data.jobs[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      Alert.alert("Error", "Failed to load active jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoseSummary = async (jobId: string) => {
    try {
      setSummaryLoading(true);
      const response = await api.get(`/dose/${jobId}/summary`);

      if (response.data.success) {
        setDoseSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dose summary:", error);
      Alert.alert("Error", "Failed to load dose summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchDoseEntries = async (jobId: string) => {
    try {
      setEntriesLoading(true);
      const response = await api.get(`/dose/job/${jobId}`);

      if (response.data.success) {
        setDoseEntries(response.data.data.doseEntries);
      }
    } catch (error) {
      console.error("Error fetching dose entries:", error);
      Alert.alert("Error", "Failed to load dose entries");
    } finally {
      setEntriesLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "in_progress":
        return "#10b981";
      case "completed":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "in_progress":
        return "Active";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Planned";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crew Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.email}</Text>
      </View>

      <View style={styles.content}>
        {/* Active Jobs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Jobs</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : activeJobs.length === 0 ? (
            <Text style={styles.emptyText}>No active jobs found</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={[
                    styles.jobCard,
                    selectedJob?.id === job.id && styles.selectedJobCard,
                  ]}
                  onPress={() => setSelectedJob(job)}
                >
                  <Text style={styles.jobNumber}>{job.job_number}</Text>
                  <Text style={styles.jobSite}>{job.site}</Text>
                  <View style={styles.jobStatus}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(job.status) },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {getStatusText(job.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Dose Summary Section */}
        {selectedJob && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Dose Summary - {selectedJob.job_number}
            </Text>
            {summaryLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : doseSummary ? (
              <View style={styles.summaryContainer}>
                {/* Summary Stats */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {doseSummary.totalDose.toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Total Dose (mSv)</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {doseSummary.averageDose.toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Average (mSv)</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {doseSummary.entryCount}
                    </Text>
                    <Text style={styles.statLabel}>Entries</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {doseSummary.forecast.hourlyRate.toFixed(2)}
                    </Text>
                    <Text style={styles.statLabel}>Rate (mSv/h)</Text>
                  </View>
                </View>

                {/* Forecast Information */}
                <View style={styles.forecastContainer}>
                  <Text style={styles.forecastTitle}>Forecast</Text>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>Current Dose:</Text>
                    <Text style={styles.forecastValue}>
                      {doseSummary.forecast.currentDose.toFixed(2)} mSv
                    </Text>
                  </View>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>Elapsed Time:</Text>
                    <Text style={styles.forecastValue}>
                      {formatTime(doseSummary.forecast.elapsedTimeMinutes)}
                    </Text>
                  </View>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>Remaining Time:</Text>
                    <Text style={styles.forecastValue}>
                      {formatTime(doseSummary.forecast.remainingTimeMinutes)}
                    </Text>
                  </View>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>End of Shift:</Text>
                    <Text style={styles.forecastValue}>
                      {doseSummary.forecast.forecastEndOfShift.toFixed(2)} mSv
                    </Text>
                  </View>
                  <View style={styles.forecastRow}>
                    <Text style={styles.forecastLabel}>End of Job:</Text>
                    <Text style={styles.forecastValue}>
                      {doseSummary.forecast.forecastEndOfJob.toFixed(2)} mSv
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: doseSummary.forecast.isOnTrack
                            ? "#10b981"
                            : "#ef4444",
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {doseSummary.forecast.isOnTrack
                        ? "On Track"
                        : "Exceeding Limits"}
                    </Text>
                  </View>
                </View>

                {/* Warnings */}
                {doseSummary.forecast.warnings.length > 0 && (
                  <View style={styles.warningsContainer}>
                    <Text style={styles.warningsTitle}>⚠️ Warnings</Text>
                    {doseSummary.forecast.warnings.map((warning, index) => (
                      <Text key={index} style={styles.warningText}>
                        • {warning}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.emptyText}>No dose data available</Text>
            )}
          </View>
        )}

        {/* Dose Chart Section */}
        {selectedJob && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Dose Trend - {selectedJob.job_number}
            </Text>
            {entriesLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : (
              <DoseChart doseEntries={doseEntries} />
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Log Dose</Text>
              <Text style={styles.actionDescription}>
                Record a new dose entry
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>View Workers</Text>
              <Text style={styles.actionDescription}>
                Manage worker information
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Alerts</Text>
              <Text style={styles.actionDescription}>
                View dose limit warnings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionDescription}>
                Generate compliance reports
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
    fontStyle: "italic",
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 150,
  },
  selectedJobCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  jobSite: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  jobStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#64748b",
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 2,
  },
  forecastContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  forecastLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  warningsContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: "#dc2626",
    marginBottom: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 150,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
});

export default DashboardScreen;