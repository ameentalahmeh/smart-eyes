import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import * as Speech from 'expo-speech';
import type { CameraCapturedPicture } from 'expo-camera';
import CameraComponent from '../components/CameraComponent';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { useLanguage } from '../contexts';
import { AppActions } from '../services/actions';
import { imageToText } from '../services/aiApiService';

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
    const { t, language } = useLanguage();

    const { Initialize, Speak, Shake } = AppActions;

    // Initialize voice command service
    useEffect(() => {
        const loadRecorder = async () => {
            try {
                await Initialize(navigation, language, t);
            } catch (error) {
                console.error('Error initializing voice command:', error);
                Speak('error');
            }
        };

        loadRecorder();
        return () => {
            Speech.stop();
        };
    }, [language, t, navigation]);


    // Handle camera capture
    const handlePhotoCapture = async (photo: CameraCapturedPicture) => {
        console.log('Photo captured:', photo.uri);
        Speak('photoTaken');

        const result = await imageToText(photo.uri);
        console.log('Analysis result:', result);

        if (result) {
            Speak('analysisComplete');
            navigation.navigate('Results', { image: { uri: photo.uri }, analysis: result });
        } else {
            Speak('failToCapture');
            navigation.navigate('Home');
        }
    };

    // Handle shake detection to trigger photo capture
    useShakeDetection(useCallback(async () => await Shake(), []));

    return (
        <View style={styles.container}>
            <CameraComponent onCapture={handlePhotoCapture} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});
