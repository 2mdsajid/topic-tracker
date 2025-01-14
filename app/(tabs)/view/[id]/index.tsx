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
        setTopicDetails({ ...topicDetails, lastRevision: currentDate, revisions: topicDetails.revisions });
        
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
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!topicDetails) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-red-500">Topic not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold mb-4 text-gray-800">Topic Details</Text>
      <View className="bg-white p-4 rounded-lg shadow-md mb-4">
        <Text className="text-lg font-semibold text-gray-700 mb-2">Name:</Text>
        <Text className="text-md text-gray-600 mb-4">{topicDetails.name}</Text>

        <Text className="text-lg font-semibold text-gray-700 mb-2">Priority:</Text>
        <Text className="text-md text-yellow-500 mb-4">{'⭐'.repeat(topicDetails.priority)}</Text>

        <Text className="text-lg font-semibold text-gray-700 mb-2">Revisions:</Text>
        <Text className="text-md text-gray-600 mb-4">{topicDetails.revisions}</Text>

        <Text className="text-lg font-semibold text-gray-700 mb-2">Last Revision:</Text>
        <Text className="text-md text-gray-600 mb-4">{topicDetails.lastRevision}</Text>

        <Text className="text-lg font-semibold text-gray-700 mb-2">Added:</Text>
        <Text className="text-md text-gray-600 mb-4">{topicDetails.added}</Text>
      </View>

      <Button title="Revised Today" onPress={handleRevisedToday} />
    </View>
  );
}
