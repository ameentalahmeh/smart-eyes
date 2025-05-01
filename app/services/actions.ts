import { Vibration } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types/navigation';
import { LanguageStrings } from '../types/language';
import { startRecorder, startListening, stopListening } from './speechRecognition';

type navigationType = NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList, undefined>;

let navigation: navigationType;
let language: string = 'en';
let translate: (key: keyof LanguageStrings) => string;
let attempts: number = 0;

export class AppActions {
    private static isCameraActive: boolean = false;

    public static ToMessage = {
        welcome: 'welcomeMessage',
        help: 'helpInstructions',
        name: 'whatName',
        gender: 'whatGender',
        age: 'whatAge',
        done: 'thankYouSetup',
        greeting: 'homeWelcome',
        reset: 'profileReset',
        analyze: 'MoveToCamera',
        close: 'closingApp'
    };

    static async Initialize(nav: navigationType, lng?: string, t?: (key: keyof LanguageStrings) => string) {
        navigation = nav;
        if (lng) language = lng;
        if (t) translate = t;

        await Speech.stop();
        await startRecorder();
    }

    static async Record(): Promise<void> {
        try {
            await Speech.stop();
            Vibration.vibrate([0, 100, 100, 100]);
            await startRecorder();
            const success = await startListening();
            if (!success) throw new Error('Failed to start listening');
        } catch (error) {
            console.error('Error starting voice control:', error);
            AppActions.Speak('error');
        }
    }

    static async Save(): Promise<string> {
        try {
            AppActions.Speak('processingAnswer');
            const text = await stopListening();
            if (text) {
                console.log('Got voice input:', text);
                return text;
            } else {
                AppActions.Speak('error');
            }
            return text;
        } catch (error) {
            console.error('Error saving voice:', error);
            AppActions.Speak('error');
            return '';
        }
    }

    static Speak(message: string, onDone?: () => void, onError?: () => void): void {
        if (!translate) {
            console.error("Translation function 't' is not defined.");
            if (onError) onError();
        }
        const msg = translate(message) || message;

        console.log("Speaking: ", msg);

        Speech.speak(msg, {
            language,
            volume: 1,
            voice: language === 'en' ? 'com.apple.ttsbundle.Samantha-compact' : 'com.apple.ttsbundle.Maged-compact',
            rate: 0.8,
            pitch: 1,
            onDone: () => {
                if (onDone) onDone();
            },
            onError: () => {
                if (onError) onError();
            }
        });
    };

    static Retry(): void {
        attempts += 1;
        if (attempts < 3) {
            AppActions.Speak('retryPrompt');
        } else {
            AppActions.Speak('error');
            attempts = 0;
        }
    };

    static async Shake(): Promise<void> {
        Vibration.vibrate([0, 100, 100, 100]);

        await Speech.stop();

        AppActions.Speak('shakeDetected', () => {
            navigation.replace('Home');
        });
    }

    static async deactivateCamera(): Promise<void> {
        AppActions.isCameraActive = false;
    }

    static isCameraOn(): boolean {
        return AppActions.isCameraActive;
    }
}
