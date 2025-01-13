import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert,StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import * as FileSystem from 'expo-file-system';
import { FILENAME } from '@/constants/data';
import { Subject, Topic } from '@/constants/types';
import { generateHexID } from '@/constants/functions';

const AddTopic: React.FC = () => {
  const [topicName, setTopicName] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [revisions, setRevisions] = useState<number>(0);
  const [subject, setSubject] = useState<string>('');
  const router = useRouter();

  // Define the available subjects
  const subjects = [
    { label: 'ENT', value: 'ent' },
    { label: 'Ophthalmology', value: 'optho' },
    { label: 'Forensic Medicine', value: 'forensic' },
    { label: 'Community Medicine', value: 'commed' },
  ];

  const onAddButtonClicked = () => {
    // Check for valid input
    if (!topicName || !priority || !subject) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate priority range
    if (parseInt(priority) < 1 || parseInt(priority) > 5) {
      Alert.alert('Error', 'Priority should be between 1 and 5');
      return;
    }

    Alert.alert(
      'Confirm Add Topic',
      `Are you sure you want to add this topic?\n\nSubject: ${subject}\nName: ${topicName}\nPriority: ${priority}`,
      [
        {
          text: 'No', // No button
          style: 'cancel',
        },
        {
          text: 'Yes', // Yes button
          onPress: addTopic,
        }
      ]
    )
  }

  const addTopic = async () => {

    const newTopic: Topic = {
      id: generateHexID(),
      name: topicName,
      priority: parseInt(priority),
      revisions: revisions || 0,
      lastRevision:new Date().toISOString(),
      added: new Date().toISOString(),
    };

    try {
      // Check if the file exists
      const fileUri = FileSystem.documentDirectory + FILENAME;
      const fileExists = await FileSystem.getInfoAsync(fileUri);

      let subjectsData: Subject = [];

      if (fileExists.exists) {
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        subjectsData = JSON.parse(fileContents);
      }

      // Check if the subject exists, if not add it
      const subjectIndex = subjectsData.findIndex((subj) => subj.name === subject);

      if (subjectIndex === -1) {
        // Add new subject
        subjectsData.push({ name: subject, topics: [newTopic] });
      } else {
        // Add new topic to existing subject
        subjectsData[subjectIndex].topics.push(newTopic);
      }

      // Write the updated subjects data to the JSON file
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(subjectsData), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert('Success', 'Topic added successfully!');
      // Clear the input fields
      setTopicName('');
      setPriority('');
      setRevisions(0);
    } catch (error) {
      console.error('Error saving the topic:', error);
      Alert.alert('Error', 'Failed to save the topic');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Topic</Text>

      {/* Subject Dropdown */}
      <RNPickerSelect
        onValueChange={(value) => setSubject(value)}
        items={subjects}
        placeholder={{ label: 'Select a Subject', value: '' }}
        style={{
          inputAndroid: styles.pickerInput,
          inputIOS: styles.pickerInput, // Ensures compatibility with iOS
        }}
      />

      {/* Topic Name Input */}
      <TextInput
        placeholder="Enter Topic Name"
        value={topicName}
        onChangeText={setTopicName}
        style={styles.input}
      />

      {/* Priority Input */}
      <TextInput
        placeholder="Enter Priority (1-5)"
        value={priority}
        onChangeText={(value) => setPriority(value === '' ? '' : value)}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Add Topic" onPress={onAddButtonClicked} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pickerInput: {
    backgroundColor: 'white',
    marginBottom: 10,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
});

export default AddTopic;
