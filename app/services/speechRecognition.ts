import * as FileSystem from 'expo-file-system';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { speechToText } from './aiApiService';

let recording: Audio.Recording | null = null;
let currentAudioPath: string | null = null;
let cleanupTimeout: NodeJS.Timeout | null = null;

const RECORDING_OPTIONS: Audio.RecordingOptions = {
    android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
    },
    ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.MAX,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
    },
};

const getTranscript = async (audioPath: string): Promise<string> => {
    try {
        const transcript = await speechToText(audioPath);
        console.log('Transcript:', transcript);
        return transcript;
    } catch (error) {
        return '';
    }
};

const configureAudioSession = async (): Promise<boolean> => {
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });

        // Small delay to ensure audio mode is properly set
        await new Promise(resolve => setTimeout(resolve, 200));
        return true;
    } catch (error) {
        console.error('Error configuring audio session:', error);
        return false;
    }
};

const cleanupRecording = async () => {
    try {
        if (recording) {
            try {
                const status = await recording.getStatusAsync();
                if (status.isRecording) {
                    console.log('Stopping active recording during cleanup');
                    await recording.stopAndUnloadAsync();
                }
            } catch (error) {
                console.error('Error stopping recording during cleanup:', error);
            } finally {
                recording = null;
            }
        }

        if (currentAudioPath) {
            try {
                console.log('Deleting audio file:', currentAudioPath);
                await FileSystem.deleteAsync(currentAudioPath, { idempotent: true });
            } catch (error) {
                console.error('Error deleting temp file:', error);
            } finally {
                currentAudioPath = null;
            }
        }
    } catch (error) {
        console.error('Error in cleanup:', error);
    }
};

const resetAudioMode = async () => {
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
    } catch (error) {
        console.error('Error resetting audio mode:', error);
    }
};

export const startRecorder = async (): Promise<void> => {
    try {
        // If there's an existing recording, make sure it's properly cleaned up
        if (recording) {
            const status = await recording.getStatusAsync();
            if (status.isRecording) {
                await recording.stopAndUnloadAsync();
            }
            recording = null;
        }

        // Request permissions first
        const permissionResponse = await Audio.requestPermissionsAsync();
        if (!permissionResponse.granted) {
            console.error('Audio recording permission not granted');
            return;
        }

        // Configure audio session
        const audioConfigured = await configureAudioSession();
        if (!audioConfigured) {
            console.error('Failed to configure audio session');
            return;
        }

        // Create and prepare new recording
        recording = new Audio.Recording();
        await recording.prepareToRecordAsync(RECORDING_OPTIONS);
        await recording.startAsync();

        console.log('Recorder started successfully');
    } catch (error) {
        console.error('Error in startRecorder:', error);
        // Ensure recording is null if anything fails
        recording = null;
        throw error;
    }
};

export const startListening = async (): Promise<boolean> => {
    try {
        if (cleanupTimeout) {
            clearTimeout(cleanupTimeout);
            cleanupTimeout = null;
        }

        await startRecorder();
        if (!recording) {
            console.error('Recording is not initialized');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to start recording after retries:', error);
        return false;
    }
};

export const stopListening = async (): Promise<string> => {
    try {
        if (cleanupTimeout) {
            clearTimeout(cleanupTimeout);
            cleanupTimeout = null;
        }

        if (!recording) {
            console.warn('No active recording to stop');
            return '';
        }

        // Get the current status and ensure we only try to stop if actually recording
        const status = await recording.getStatusAsync();
        if (!status.isRecording) {
            console.warn('Recording is not active');
            recording = null;
            return '';
        }

        // Stop and unload the recording
        await recording.stopAndUnloadAsync();
        console.log('Recording stopped');

        const uri = recording.getURI();
        if (!uri) {
            console.error('No recording URI available');
            recording = null;
            return '';
        }

        currentAudioPath = uri;
        recording = null;

        // Try to get transcript
        const transcript = await getTranscript(uri);

        cleanupTimeout = setTimeout(() => {
            cleanupRecording();
        }, 1000);

        return transcript;
    } catch (error) {
        console.error('Failed to stop recording:', error);
        recording = null;
        return '';
    } finally {
        await resetAudioMode();
    }
};



