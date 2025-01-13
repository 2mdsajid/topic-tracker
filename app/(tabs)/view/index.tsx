import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';
import { Link, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { FILENAME } from '@/constants/data';
import { Subject, Topic } from '@/constants/types';



const ViewTopics: React.FC = () => {

  const [subjects, setSubjects] = useState<Subject>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Load subjects from the JSON file
  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
      setSelectedSubject('All');
    }, [])
  );

  const fetchSubjects = async () => {
    const fileUri = FileSystem.documentDirectory + FILENAME;
    const fileExists = await FileSystem.getInfoAsync(fileUri);

    if (fileExists.exists) {
      const fileContents = await FileSystem.readAsStringAsync(fileUri);
      const data: Subject = JSON.parse(fileContents);
      setSubjects(data);
      setFilteredTopics(getAllTopics(data));
    } else {
      Alert.alert('No Data', 'No topics found!');
    }
  };

  // Helper to get all topics from all subjects
  const getAllTopics = (data: Subject): Topic[] => {
    return data.flatMap((subject) => subject.topics).sort((a, b) => b.priority - a.priority);
  };

  // Filter topics based on selected subject
  const filterTopics = (subjectName: string) => {
    if (subjectName === 'All') {
      setFilteredTopics(getAllTopics(subjects));
    } else {
      const subject = subjects.find((subj) => subj.name === subjectName);
      setFilteredTopics(subject ? [...subject.topics].sort((a, b) => b.priority - a.priority) : []);
    }
    setSelectedSubject(subjectName);
  };

  // Render stars for priority
  const renderStars = (priority: number) => {
    return Array(priority)
      .fill('⭐')
      .join('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Topics</Text>

      {/* Subject Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => filterTopics(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Subjects" value="All" />
          {subjects.map((subject) => (
            <Picker.Item key={subject.name} label={subject.name} value={subject.name} />
          ))}
        </Picker>
      </View>

      {/* Topics List */}
      <FlatList
        data={filteredTopics}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.topicCard}>
            <Text style={styles.topicTitle}>{item.name}</Text>
            <Text style={styles.topicPriority}>{renderStars(item.priority)}</Text>
            <Text style={styles.topicText}>
              <Text style={styles.bold}>Added:</Text> {new Date(item.added).toDateString()}
            </Text>
            <Text style={styles.topicText}>
              <Text style={styles.bold}>Last Revised:</Text> {item.lastRevision}
            </Text>
            <Text style={styles.topicText}>
              <Text style={styles.bold}>Revisions:</Text> {item.revisions}
            </Text>
            <Link href={`/view/${item.id}`}>
              <Text style={styles.topicText}>View Details</Text>
            </Link>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No topics available for this subject.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
  },
  topicCard: {
    flexDirection: 'column',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  topicPriority: {
    color: '#fbbf24',
    marginBottom: 8,
    fontSize: 16,
  },
  topicText: {
    color: '#4b5563',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  emptyMessage: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default ViewTopics;
