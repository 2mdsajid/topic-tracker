import { BackHandler, Button, Text, View, Alert, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { FILENAME } from '@/constants/data';
import { Subject, Topic } from '@/constants/types';


export default function TopicPage() {
  const { id: topicId } = useLocalSearchParams(); // Get the topicId from the route
  const [topicDetails, setTopicDetails] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  const handleRevisedToday = () => {
    Alert.alert(
      "Confirm Revision",
      "Are you sure you want to mark this topic as revised today?",
      [
        {
          text: "No",
          onPress: () => console.log("Revision canceled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: updateTopicRevision
        }
      ]
    );
  };

  const updateTopicRevision = async () => {
    try {
      if (topicDetails) {
        const currentDate = new Date().toISOString();

        topicDetails.lastRevision = currentDate;
        topicDetails.revisions += 1;

        // Read the existing subjects from the JSON file
        const fileUri = FileSystem.documentDirectory + FILENAME;
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        const subjects: Subject = JSON.parse(fileContents);

        // Update the specific topic in the subjects array
        for (let subject of subjects) {
          const topicIndex = subject.topics.findIndex((topic) => topic.id === topicId);
          if (topicIndex !== -1) {
            subject.topics[topicIndex] = topicDetails;
            break;
          }
        }

        // Write the updated subjects array back to the JSON file
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(subjects));
        setTopicDetails({...topicDetails,
          lastRevision : currentDate,
          revisions : topicDetails.revisions
        });
        // Notify user of success
        Alert.alert(
          "Success",
          "Topic has been successfully updated with today's revision.",
          [{ text: "OK", onPress: () => console.log("Revision updated successfully") }]
        );
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      Alert.alert("Error", "Failed to update topic. Please try again.");
    }
  };

  useEffect(() => {
    const fetchTopicDetails = async () => {
      try {
        // Read the JSON file
        const fileUri = FileSystem.documentDirectory + FILENAME;
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        const subjects: Subject = JSON.parse(fileContents);

        // Find the topic using the topicId
        for (const subject of subjects) {
          const foundTopic = subject.topics.find((topic) => topic.id === topicId);
          if (foundTopic) {
            setTopicDetails(foundTopic);
            break;
          }
        }
      } catch (error) {
        console.error('Error reading file or finding topic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicDetails();
  }, [topicId]);


  useEffect(() => {
    const backAction = () => {
      router.push('/view');
      return true; // Prevent default back button behavior
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
    );
  }

  if (!topicDetails) {
    return (
      <View style={styles.centeredContainer}>
      <Text style={styles.errorText}>Topic not found.</Text>
    </View>
    );
  }

  return (
    <View style={styles.container}>
    <Text style={styles.header}>Topic Details</Text>
    <View style={styles.card}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{topicDetails.name}</Text>

      <Text style={styles.label}>Priority:</Text>
      <Text style={styles.priority}>{'⭐'.repeat(topicDetails.priority)}</Text>

      <Text style={styles.label}>Revisions:</Text>
      <Text style={styles.value}>{topicDetails.revisions}</Text>

      <Text style={styles.label}>Last Revision:</Text>
      <Text style={styles.value}>{topicDetails.lastRevision}</Text>

      <Text style={styles.label}>Added:</Text>
      <Text style={styles.value}>{topicDetails.added}</Text>
    </View>

    <Button title="Revised Today" onPress={handleRevisedToday} />
  </View>
  );
}


const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 18,
    color: '#4b5563',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  priority: {
    fontSize: 14,
    color: '#fbbf24',
    marginBottom: 8,
  },
});