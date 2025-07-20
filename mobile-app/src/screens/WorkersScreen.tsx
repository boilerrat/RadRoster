import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Worker {
  id: string;
  name: string;
  employee_id: string;
  role: 'worker' | 'supervisor' | 'rpo' | 'admin';
  annual_limit_mSv: number;
  last_bioassay?: string;
  is_active: boolean;
}

interface WorkersResponse {
  success: boolean;
  data: {
    workers: Worker[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const WorkersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchWorkers = async (
    pageNum: number = 1,
    refresh: boolean = false
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/workers?page=${pageNum}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${await getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }

      const data: WorkersResponse = await response.json();

      if (refresh) {
        setWorkers(data.data.workers);
      } else {
        setWorkers((prev) => [...prev, ...data.data.workers]);
      }

      setHasMore(pageNum < data.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching workers:', error);
      Alert.alert('Error', 'Failed to load workers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getAuthToken = async (): Promise<string> => {
    // This would typically come from your auth context
    // For now, we'll use a placeholder
    return 'your-auth-token';
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWorkers(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchWorkers(page + 1);
    }
  };

  const handleDeleteWorker = (workerId: string, workerName: string) => {
    Alert.alert(
      'Delete Worker',
      `Are you sure you want to deactivate ${workerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/api/workers/${workerId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${await getAuthToken()}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.ok) {
                setWorkers((prev) => prev.filter((w) => w.id !== workerId));
                Alert.alert('Success', 'Worker deactivated successfully');
              } else {
                throw new Error('Failed to delete worker');
              }
            } catch (error) {
              console.error('Error deleting worker:', error);
              Alert.alert('Error', 'Failed to delete worker');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'rpo':
        return '#7c3aed';
      case 'supervisor':
        return '#059669';
      default:
        return '#3b82f6';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "Not set";
    }
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  if (loading && workers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading workers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workers</Text>
        <Text style={styles.subtitle}>Manage worker information</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddWorker' as never)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Worker</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isCloseToBottom && hasMore && !loading) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {workers.map((worker) => (
          <TouchableOpacity
            key={worker.id}
            style={styles.workerCard}
            onPress={() =>
              navigation.navigate('EditWorker' as never, { worker } as never)
            }
          >
            <View style={styles.workerHeader}>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerId}>ID: {worker.employee_id}</Text>
              </View>
              <View style={styles.workerActions}>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(worker.role) },
                  ]}
                >
                  <Text style={styles.roleText}>
                    {worker.role.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteWorker(worker.id, worker.name)}
                >
                  <Ionicons name="trash-outline" size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.workerDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Annual Limit:</Text>
                <Text style={styles.detailValue}>
                  {worker.annual_limit_mSv} mSv
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Bioassay:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(worker.last_bioassay)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: worker.is_active ? '#059669' : '#dc2626',
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {worker.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {loading && workers.length > 0 && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#1e3a8a" />
            <Text style={styles.loadingMoreText}>Loading more...</Text>
          </View>
        )}

        {!hasMore && workers.length > 0 && (
          <Text style={styles.noMoreText}>No more workers to load</Text>
        )}

        {workers.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Workers Found</Text>
            <Text style={styles.emptyStateText}>
              Add your first worker to get started with dose tracking.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    marginTop: 12,
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
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  workerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  workerId: {
    fontSize: 14,
    color: '#64748b',
  },
  workerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  workerDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  noMoreText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default WorkersScreen;
