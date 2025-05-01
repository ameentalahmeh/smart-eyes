import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types/navigation';
import { useLanguage, useUser, UserProfile } from '../contexts';
import { AppActions } from 'services/actions';

type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

type SetupStep = 'welcome' | 'help' | 'name' | 'age' | 'gender' | 'done';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
    const { t, language } = useLanguage();
    const { setUserProfile } = useUser();
    const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
    const [isRecording, setIsRecording] = useState(false);
    const [partialProfile, setPartialProfile] = useState<Partial<UserProfile>>({});

    const mountedRef = useRef(true);
    const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Setup pulse animation for recording indicator
    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording, pulseAnim]);

    // Handle welcome message and setup instructions
    useEffect(() => {
        handleStep(currentStep);
    }, [currentStep]);

    // Speak on error
    const onError = () => {
        if (mountedRef.current) {
            Speak('error');
        }
    };

    // Speak go next step/command
    const goNext = (next: SetupStep) => {
        if (mountedRef.current) {
            setTimeout(() => {
                setCurrentStep(next);
            }, 1000);
        }
    };

    // Modified handleStep to handle auto-transition
    const handleStep = async (step: SetupStep) => {
        if (!mountedRef.current) return;

        const message = ToMessage[step] || 'error';

        try {
            await Speech.stop();
            if (step === 'welcome') {
                Speak(message, () => goNext('help'), onError);
            } else if (step === 'help') {
                Speak(message, () => goNext('name'), onError);
            } else if (step === 'done') {
                Speak(message, handleDoneInput, onError);
            } else {
                Speak(message, undefined, onError);
            }
        } catch (error) {
            console.error('Error in handleStep:', error);
            onError();
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
                await handleStep(currentStep);
            }
        } catch (error) {
            console.error('Error in given voice handling:', error);
            await handleStep(currentStep);
        }
    };

    const handleVoiceInput = async (text: string) => {
        if (!isRecording) return;

        try {
            const input = text.toLowerCase();
            console.log('Current step:', currentStep, 'Input:', input);

            switch (currentStep) {
                case 'name':
                    await handleNameInput(input);
                    break;
                case 'gender':
                    await handleGenderInput(input);
                    break;
                case 'age':
                    await handleAgeInput(input);
                    break;
                default:
                    Retry();
                    break;
            }
        } catch (error) {
            console.error('Error in given voice handling:', error);
            Retry();
        }
    };

    const handleNameInput = async (input: string) => {
        setPartialProfile(prev => ({ ...prev, fullName: input }));

        Speak(t('gotIt'));
        Speak(t(`YourNameIs`));
        Speak(input, () => goNext('gender'), onError);
    };

    const handleGenderInput = async (input: string) => {
        let gender: "male" | "female" | undefined;
        const lowerGender = input.toLowerCase();
        if (lowerGender.includes(t('male'))) {
            gender = "male";
        } else if (lowerGender.includes(t('female'))) {
            gender = "female";
        } else {
            Retry();
            return;
        }

        setPartialProfile(prev => ({ ...prev, gender }));

        Speak(t('gotIt'));
        Speak(t(`YourGenderIs`));
        Speak(gender, () => goNext('age'), onError);
    };

    const handleAgeInput = async (input: string) => {
        const age = parseInt(input);
        if (isNaN(age) || age < 0 || age > 120) {
            Retry();
            return;
        }

        setPartialProfile(prev => ({ ...prev, age }));

        Speak(t('gotIt'));
        Speak(t(`YourAgeIs`));
        Speak(age.toString(), () => goNext('done'), onError);
    };

    const handleDoneInput = async () => {
        try {
            setPartialProfile(prev => ({ ...prev, isProfileSet: true }));

            // Save the profile to AsyncStorage or your preferred storage method
            // Assuming setUserProfile is a function that saves the profile
            await setUserProfile(partialProfile as UserProfile);

            // Add a small delay to allow the speech to complete
            setTimeout(() => {
                if (mountedRef.current) {
                    navigation.replace('Home');
                }
            }, 2000);
        } catch (error) {
            console.error('Error saving profile:', error);
            Speak('failToSetup');
        }
    };

    console.log("Step: ", currentStep);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.touchArea}
                onPressIn={startVoiceInput}
                onPressOut={stopVoiceInput}
                accessible={true}
                accessibilityLabel={isRecording ? 'Release to stop recording' : 'Touch and hold to record'}
            >
                <Text style={styles.title}>{t('welcomeMessage')}</Text>
                <Text style={styles.subtitle}>
                    {currentStep === 'help' && t('helpInstructions')}
                    {currentStep === 'name' && t('sayYourName')}
                    {currentStep === 'age' && t('sayYourAge')}
                    {currentStep === 'gender' && t('sayYourGender')}
                </Text>

                {isRecording && (
                    <Animated.View
                        style={[
                            styles.recordingIndicator,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <Text style={styles.recordingText}>
                            {t('listeningText')}
                        </Text>
                    </Animated.View>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    touchArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        color: '#ffffff',
        fontSize: 24,
        marginBottom: 40,
        textAlign: 'center',
        opacity: 0.8,
    },
    recordingIndicator: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
    },
    recordingText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default WelcomeScreen;
