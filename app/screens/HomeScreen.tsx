import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, BackHandler } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types/navigation';
import { useLanguage, useUser, UserProfile } from '../contexts';
import { AppActions } from 'services/actions';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

type HomeCommand = 'greeting' | 'help' | 'reset' | 'analyze' | 'close';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { t, language } = useLanguage();
    const { setUserProfile } = useUser();
    const [currentCommand, setCurrentCommand] = useState<HomeCommand>('greeting');
    const [isRecording, setIsRecording] = useState(false);

    const mountedRef = useRef(true);

    const { Initialize, Record, Save, Speak, Retry, ToMessage } = AppActions;

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

    // Handle welcome message and setup instructions
    useEffect(() => {
        handleCommand(currentCommand);
    }, [currentCommand]);

    const onError = () => {
        if (mountedRef.current) {
            Speak('error');
        }
    };

    const goNext = (next: HomeCommand) => {
        if (mountedRef.current) {
            setTimeout(() => {
                setCurrentCommand(next);
            }, 1000);
        }
    };

    // Modified handleCommand to handle auto-transition
    const handleCommand = async (cmd: HomeCommand) => {
        if (!mountedRef.current) return;

        const message = ToMessage[cmd] || 'error';

        try {
            await Speech.stop();
            if (cmd === 'greeting') {
                Speak(message, () => goNext('help'), onError);
            } else if (cmd === 'help') {
                Speak(message, undefined, onError);
            } else if (cmd === 'analyze') {
                Speak(message, activateCamera, onError);
            } else if (cmd === 'reset') {
                Speak(message, resetUserProfile, onError);
            } else if (cmd === 'close') {
                Speak(message, closeApp, onError);
            }
        } catch (error) {
            console.error('Error in handleStep:', error);
            await onError();
        }
    };

    const startVoiceInput = async () => {
        if (isRecording || !mountedRef.current) return;
        try {
            await Record();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);
        }
    };

    const stopVoiceInput = async () => {
        if (!isRecording) return;
        try {
            setIsRecording(false);
            const text = await Save();
            if (text) {
                await handleVoiceInput(text);
            } else {
                await handleCommand(currentCommand);
            }
        } catch (error) {
            console.error('Error in given voice handling:', error);
            await handleCommand(currentCommand);
        }
    };

    // Handle voice input
    const handleVoiceInput = async (text: string) => {
        if (!isRecording) return;

        try {
            const normalizedInput = text.toLowerCase();
            console.log('Received command:', normalizedInput);

            if (normalizedInput.includes('reset')) {
                setCurrentCommand('reset');
            } else if (normalizedInput.includes('analyze')) {
                setCurrentCommand('analyze');
            } else if (normalizedInput.includes('close')) {
                setCurrentCommand('close');
            } else {
                Retry();
            }
        } catch (error) {
            console.error('Error in given voice handling:', error);
            Retry();
        }
    };

    const resetUserProfile = () => {
        setUserProfile({} as UserProfile);
    };

    const activateCamera = () => {
        navigation.replace('Camera');
    };

    const closeApp = () => {
        setTimeout(() => {
            BackHandler.exitApp();
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('SmartEyes')}</Text>
            </View>

            <View style={styles.guideContainer}>
                <Text style={styles.guideTitle}>{t('howToUse')}</Text>
                <View style={styles.guideList}>
                    <Text style={styles.guideItem}>1. {t('analyze')}</Text>
                    <Text style={styles.guideItem}>2. {t('resetProfile')}</Text>
                    <Text style={styles.guideItem}>3. {t('closeApp')}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.touchArea}
                onPressIn={startVoiceInput}
                onPressOut={stopVoiceInput}
                accessible={true}
                accessibilityLabel={isRecording ? t('stopVoiceControl') : t('startVoiceControl')}
            >
                <View style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}>
                    <Ionicons
                        name={isRecording ? 'mic' : 'mic-off'}
                        size={80}
                        color="white"
                    />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'lightgray',
    },
    header: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007AFF',
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    guideContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    guideTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    guideList: {
        gap: 12,
    },
    guideItem: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
    },
    touchArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    voiceButtonActive: {
        backgroundColor: '#FF3B30',
    },
});

export default HomeScreen;
