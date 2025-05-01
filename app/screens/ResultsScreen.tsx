import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Image, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { AppActions } from '../services/actions';
import { useShakeDetection } from '../hooks/useShakeDetection';
import { useLanguage } from '../contexts/LanguageContext';

type ResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'Results'>;

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ route, navigation }) => {
    const { image, analysis } = route?.params || {};
    const { t, language } = useLanguage();
    const [isReading, setIsReading] = useState<boolean>(false);

    const mountedRef = useRef(true);

    const { Initialize, Speak, Shake } = AppActions;

    // Initialize voice command service
    useEffect(() => {
        const loadRecorder = async () => {
            try {
                await Initialize(navigation, language, t);
            } catch (error) {
                console.error('Error initializing voice command:', error);
                if (mountedRef.current) {
                    Speak('error');
                }
            }
        };

        loadRecorder();
        return () => {
            mountedRef.current = false;
            Speech.stop();
        };
    }, [navigation, language, t]);

    // Handle reading of the analysis result
    useEffect(() => {
        handleResultReading();
    }, []);

    // Speak on error
    const onError = () => {
        if (mountedRef.current) {
            Speak('error');
        }
    };

    const onDone = () => {
        if (mountedRef.current) {
            Speak('analysisComplete', () => setIsReading(false), onError);
        }
    };

    // handle reading the analysis result
    const handleResultReading = useCallback(async () => {
        if (!image || !analysis) {
            navigation.replace('Home');
            return;
        }

        try {
            setIsReading(true);
            await Speak(analysis, onDone, onError);
        } catch (error) {
            console.error('Error reading analysis:', error);
            onError();
        }
    }, [image, analysis, Speak, onDone, onError]);

    // Handle shake detection to back to home screen
    useShakeDetection(useCallback(async () => await Shake(), []));

    if (!image) return null;

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: image.uri }}
                style={styles.image}
                accessibilityLabel={t('analysisResults')}
            />
            <View style={styles.resultContainer}>
                <>
                    {
                        isReading ?
                            <ScrollView contentContainerStyle={styles.scrollContent}>
                                <Text style={styles.resultText}>{analysis}</Text>
                            </ScrollView>
                            :
                            <TouchableOpacity
                                style={styles.buttonContainer}
                                onPress={handleResultReading}
                                accessibilityLabel={t(isReading ? 'pauseReading' : 'readResultAgain')}
                            >
                                <Ionicons
                                    name="reload-outline" // Icon name for the replay button
                                    size={100} // Icon size
                                    color="#fff" // Icon color
                                />
                            </TouchableOpacity>
                    }
                </>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'lightgray',
    },
    image: {
        width: '100%',
        height: '55%',
        resizeMode: 'cover',
        marginBottom: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    resultContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 30,
        justifyContent: 'space-between',
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    resultText: {
        color: '#fff',
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '500',
        textAlign: 'center',
    },
    buttonContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },

});

export default ResultsScreen;
