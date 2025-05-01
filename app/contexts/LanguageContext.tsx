import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Language, LanguageStrings } from '../types/language';

const translations: Record<Language, LanguageStrings> = {
    en: {
        takePhoto: 'Take photo',
        listening: 'Listening...',
        homeWelcome: 'Welcome to the home screen of the Smart Eyes',
        startVoiceControl: 'Start Voice Control',
        stopVoiceControl: 'Stop Voice Control',
        analyzing: 'Analyzing image...',
        error: 'An error occurred. Please try again.',
        grantPermission: 'Grant Permission',
        needCameraPermission: 'We need your permission to show the camera',
        SmartEyes: 'Smart Eyes',
        analysisResults: 'Analysis Results',
        sayYourName: 'Say your name',
        sayYourAge: 'Say your age',
        sayYourGender: 'Say your gender',
        setupComplete: 'Setup complete!',
        welcomeMessage: 'Welcome to the Smart Eyes!',
        helpInstructions: 'Press and hold to start recording, then release to stop.',
        selectLanguage: 'Please select your preferred language by saying English or Arabic.',
        whatName: 'What is your name?',
        whatAge: 'How old are you? Please say your age as a number.',
        whatGender: 'What is your gender?',
        thankYouSetup: 'Thank you! Your profile has been set up. Going to home screen!',
        processingAnswer: 'Your answer is recorded. Please wait a moment for processing.',
        speakClearly: "Let's try again. Please speak clearly.",
        defaultLanguage: 'Setting English as default. Please say your name.',
        recordingStatus: 'Listening...',
        listeningText: 'Listening...',
        retryLanguage: 'Please say English or Arabic clearly',
        retryName: 'Please say your name clearly',
        retryGender: 'Please say your gender clearly',
        retryAge: 'Please say your age as a number',
        gotIt: 'Got it',
        photoCountdown: "Taking photo in",
        errorTakingPhoto: "Error taking photo. Please try again",
        returningHome: "Returning to home screen",
        profileReset: 'Your profile has been reset',
        moveToCamera: 'Moving to camera',
        closingApp: 'Closing the app',
        howToUse: 'How to use',
        retryPrompt: 'Failed to get your prompt. Please try again clearly',
        readResultAgain: 'Read Results Again',
        readResult: 'Read results',
        stopReading: 'Stop reading',
        photoTaken: 'Photo taken. Analyzing now',
        failToCapture: 'Failed to capture photo. Please try again',
        analysisComplete: 'Analysis complete. Tap on the screen bottom to read results again',
        analysisFailed: 'Analysis failed. Please try again',
        shakeToReturn: 'Shake to return to home screen',
        analyze: 'Tap the microphone button and say "analyze" to take a photo and analyze it',
        resetProfile: 'Tap the microphone button and say "reset" to reset your profile',
        closeApp: 'Tap the microphone button and say "close" to close the app',
        cameraPermissionDenied: 'Camera permission denied. Please enable it in settings.',
        seconds: 'seconds',
        failToSetup: 'Failed to setup your profile. Please try again',
        yourNameIs: 'Your name is',
        yourAgeIs: 'Your age is',
        yourGenderIs: 'Your gender is',
        resumeReading: 'Resume reading',
        pauseReading: 'Pause reading',
        male: 'male',
        female: 'female',
    },
    ar: {
        takePhoto: 'التقط صورة',
        homeWelcome: 'مرحبا بك في الشاشة الرئيسية في مساعد المكفوفين',
        listening: 'جاري الاستماع...',
        startVoiceControl: 'بدء التحكم الصوتي',
        stopVoiceControl: 'إيقاف التحكم الصوتي',
        analyzing: 'جاري تحليل الصورة...',
        error: 'حدث خطأ. حاول مرة أخرى.',
        grantPermission: 'منح الإذن',
        needCameraPermission: 'نحتاج إذنك لعرض الكاميرا',
        SmartEyes: 'مساعد المكفوفين',
        analysisResults: 'نتائج التحليل',
        sayYourName: 'ما هو اسمك',
        sayYourAge: 'كم عمرك',
        sayYourGender: 'ما هو جنسك',
        setupComplete: 'تم الإعداد بنجاح!',
        welcomeMessage: 'مرحبًا بك في مساعد المكفوفين!',
        helpInstructions: 'اضغط مع الاستمرار للتسجيل، ثم أفلت لإيقاف التسجيل.',
        selectLanguage: 'يرجى اختيار لغتك المفضلة عن طريق قول إنجليزي أو عربي.',
        whatName: 'ما اسمك؟',
        whatAge: 'كم عمرك؟ من فضلك قل عمرك كرقم.',
        whatGender: 'ما هو جنسك؟',
        thankYouSetup: 'شكرا لك! تم إعداد ملفك الشخصي. جاري الانتقال إلى الشاشة الرئيسية!',
        processingAnswer: 'تم تسجيل إجابتك. يرجى الانتظار لحظة للمعالجة.',
        speakClearly: 'دعنا نحاول مرة أخرى. من فضلك تحدث بوضوح.',
        defaultLanguage: 'تم تعيين اللغة الإنجليزية كلغة افتراضية. من فضلك قل اسمك.',
        recordingStatus: 'جاري الاستماع...',
        listeningText: 'جاري الاستماع...',
        retryLanguage: 'من فضلك قل إنجليزي أو عربي بوضوح',
        retryName: 'من فضلك قل اسمك بوضوح',
        retryGender: 'من فضلك قل جنسك بوضوح',
        retryAge: 'من فضلك قل عمرك كرقم',
        gotIt: 'تم',
        photoCountdown: "التقاط الصورة في",
        errorTakingPhoto: "خطأ في التقاط الصورة. يرجى المحاولة مرة أخرى",
        returningHome: "العودة إلى الشاشة الرئيسية",
        profileReset: 'تم إعادة تعيين ملفك الشخصي',
        moveToCamera: 'جاري الانتقال إلى الكاميرا',
        closingApp: 'إغلاق التطبيق',
        howToUse: 'كيفية الاستخدام',
        retryPrompt: 'لم استطع فهم التسجيل. الرجاء المحاولة مرة أخرى بوضوح',
        readResultAgain: 'قراءة النتائج مرة أخرى',
        readResult: 'قراءة النتائج',
        stopReading: 'إيقاف القراءة',
        photoTaken: 'تم التصوير بنجاح. جاري التحليل الآن',
        failToCapture: 'فشل التقاط الصورة. يرجى المحاولة مرة أخرى.',
        analysisComplete: 'اكتمل التحليل. اضغط على الشاشة في الأسفل لقراءة النتائج مرة أخرى',
        analysisFailed: 'فشل التحليل. يرجى المحاولة مرة أخرى.',
        shakeToReturn: 'اهتز للعودة إلى الشاشة الرئيسية',
        analyze: 'اضغط على زر الميكروفون وقل "تحليل" لالتقاط صورة وتحليلها',
        resetProfile: 'اضغط على زر الميكروفون وقل "إعادة تعيين" لإعادة تعيين ملفك الشخصي',
        closeApp: 'اضغط على زر الميكروفون وقل "إغلاق" لإغلاق التطبيق',
        cameraPermissionDenied: 'تم رفض إذن الكاميرا. يرجى تمكينه في الإعدادات.',
        seconds: 'ثواني',
        failToSetup: 'فشل إعداد ملفك الشخصي. يرجى المحاولة مرة أخرى',
        yourNameIs: 'اسمك هو',
        yourAgeIs: 'عمرك هو',
        yourGenderIs: 'جنسك هو',
        resumeReading: 'استئناف القراءة',
        pauseReading: 'إيقاف القراءة',
        male: 'ذكر',
        female: 'أنثى',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof LanguageStrings) => string;
}

const LANGUAGE_STORAGE_KEY = '@app_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getDeviceLanguage = (): Language => {
    // Get device locale
    const locale = Localization.getLocales()[0];
    const languageCode = locale?.languageCode;

    // Currently we only support 'en' and 'ar'
    if (languageCode === 'ar') {
        return 'ar';
    }
    return 'en'; // Default to English for all other languages
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => getDeviceLanguage());

    useEffect(() => {
        // Load saved language preference or use device language
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
                    setLanguageState(savedLanguage);
                }
                // If no saved preference, we already initialized with device language
            } catch (error) {
                console.error('Error loading language preference:', error);
                // Keep using device language if there's an error
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (newLanguage: Language) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
            setLanguageState(newLanguage);
        } catch (error) {
            console.error('Error saving language preference:', error);
        }
    };

    const t = (key: keyof LanguageStrings): string => {
        return translations[language][key];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
