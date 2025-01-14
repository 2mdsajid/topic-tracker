import { FILENAME, subjects } from '@/constants/data';
import { generateHexID } from '@/constants/functions';
import { Subject, Topic } from '@/constants/types';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Switch, Text, TextInput, View } from 'react-native';

import RNPickerSelect from 'react-native-picker-select';


const AddTopic: React.FC = () => {
  const { topicid } = useLocalSearchParams();

  const [topicName, setTopicName] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [revisions, setRevisions] = useState<number>(0);
  const [subject, setSubject] = useState<string>('');

  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [days, setDays] = useState('');


  const onAddButtonClicked = () => {
    if (!topicName || !priority || !subject) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseInt(priority) < 1 || parseInt(priority) > 5) {
      Alert.alert('Error', 'Priority should be between 1 and 5');
      return;
    }

    Alert.alert(
      'Confirm Add Topic',
      `Are you sure you want to add this topic?\n\nSubject: ${subject}\nName: ${topicName}\nPriority: ${priority}`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: addTopic,
        },
      ]
    );
  };

  const addTopic = async () => {
    // Generate a new topic ID
    const newTopicId = generateHexID(12);

    const newTopic: Topic = {
      id: newTopicId,
      name: topicName,
      priority: parseInt(priority),
      revisions: revisions || 0,
      lastRevision: new Date().toISOString(),
      added: new Date().toISOString(),
    };

    try {
      const fileUri = FileSystem.documentDirectory + FILENAME;
      const fileExists = await FileSystem.getInfoAsync(fileUri);

      let subjectsData: Subject = [];

      if (fileExists.exists) {
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        subjectsData = JSON.parse(fileContents);
      }

      const subjectIndex = subjectsData.findIndex((subj) => subj.name === subject);

      if (subjectIndex === -1) {
        subjectsData.push({ name: subject, topics: [newTopic] });
      } else {
        subjectsData[subjectIndex].topics.push(newTopic);
      }

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(subjectsData), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (isReminderEnabled) {
        await scheduleNotification(newTopicId, topicName)
      }

      Alert.alert('Success', 'Topic added successfully!');
      setTopicName('');
      setPriority('');
      setRevisions(0);
    } catch (error) {
      console.error('Error saving the topic:', error);
      Alert.alert('Error', 'Failed to save the topic');
    }
  };


  const scheduleNotification = async (topicId: String, topic: string) => {
    const daysNumber = parseInt(days);
    if (isNaN(daysNumber) || daysNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days.');
      return;
    }
    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + daysNumber);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder',
        body: `please read ${topic}`,
        data: { id: topicId },  // Store the topic ID in the notification payload
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: daysNumber*24*60*2*30,  // Convert days to seconds
        repeats: false,
      },
    });
  };


  useEffect(() => {
    // Set up the notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);


  return (
    <View className="flex-1 bg-gray-100 p-5">
      <Text className="text-3xl font-bold mb-4">Add Topic</Text>

      {/* Subject Dropdown */}
      <RNPickerSelect
        onValueChange={(value) => setSubject(value)}
        items={subjects}
        placeholder={{ label: 'Select a Subject', value: '' }}
        style={{
          inputAndroid: {
            paddingHorizontal: 5,
            paddingVertical: 0,
            borderRadius: 20,
            marginBottom: 10,
            backgroundColor: 'white',
            fontSize: 16
          },
          inputIOS: { paddingHorizontal: 10, paddingVertical: 12, borderRadius: 8, backgroundColor: 'white', fontSize: 16 },
        }}
      />

      {/* Topic Name Input */}
      <TextInput
        placeholder="Enter Topic Name"
        value={topicName}
        onChangeText={setTopicName}
        className="bg-white rounded-lg p-4 text-base mb-4"
      />

      {/* Priority Input */}
      <TextInput
        placeholder="Enter Priority (1-5)"
        value={priority}
        onChangeText={(value) => setPriority(value === '' ? '' : value)}
        keyboardType="numeric"
        className="bg-white rounded-lg p-4 text-base mb-4"
      />

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl">Enable Reminder</Text>
        <Switch
          value={isReminderEnabled}
          onValueChange={(value) => setIsReminderEnabled(value)}
        />
      </View>

      {isReminderEnabled && (
        <TextInput
          className="bg-white rounded-lg p-4 text-base mb-4"
          placeholder="Enter days for reminder"
          keyboardType="numeric"
          value={days}
          onChangeText={setDays}
        />
      )}

      <Button title="Add Topic" onPress={onAddButtonClicked} />
    </View>
  );
};

export default AddTopic;
