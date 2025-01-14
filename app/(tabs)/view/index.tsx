import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

import { Link, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { FILENAME } from '@/constants/data';
import { Subject, Topic } from '@/constants/types';
import { defineBgColorBasedOnRevisions } from '@/constants/functions';


import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';

const ViewTopics: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

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
    if (subjectName === 'all') {
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
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Topics</Text>

      {/* Subject Picker */}
      <View className="mb-4">
        {/* <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => filterTopics(itemValue)}
          style={{ backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8 }}
        >
          <Picker.Item label="All Subjects" value="all" />
          {subjects.map((subject) => (
            <Picker.Item key={subject.name} label={subject.name} value={subject.name} />
          ))}
        </Picker> */}

        <RNPickerSelect
        onValueChange={(value) => filterTopics(value)}
        items={subjects.map((subject) => ({ label: subject.name, value: subject.name }))}
        value={selectedSubject}
        placeholder={{ label: 'All Subjects', value: 'all' }}
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
      </View>

      {/* Topics List */}
      <FlatList
        data={filteredTopics}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => {

          // Determine background color based on revisions
          let bgColor = 'border-gray-500'; // Default color
          if (item.revisions === 0) {
            bgColor = 'border-red-500'; 
          } else if (item.revisions === 1) {
            bgColor = 'border-yellow-500'; 
          } else if (item.revisions >= 2) {
            bgColor = 'border-green-500'; 
          }

          return (
            <TouchableOpacity className={`flex-col mb-4 p-4 rounded-lg border-2 ${bgColor}`}>
              <Text className="text-xl font-bold mb-2">{item.name}</Text>

              <View className="flex flex-row mb-2">
                <Text className="text-yellow-500 text-xs basis-1/2">{renderStars(item.priority)}</Text>
                <Text className="font-bold text-gray-700 text-xs">Revisions:</Text>
                <Text className="text-gray-700 text-xs"> {item.revisions}</Text>
              </View>


              <Text className="text-gray-700 mb-2 text-xs">
                <Text className="font-bold ">Last Revised:</Text> {new Date(item.lastRevision).toDateString()}
              </Text>

              <Link href={`/view/${item.id}`}>
                <Text className="text-blue-800 underline">View Details</Text>
              </Link>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-8">No topics available for this subject.</Text>
        }
      />

    </View>
  );
};

export default ViewTopics;
