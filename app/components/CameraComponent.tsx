import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import * as Speech from 'expo-speech';
import { useLanguage } from '../contexts/LanguageContext';

interface CameraComponentProps {
    onCapture: (photo: CameraCapturedPicture) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
    const { t, language } = useLanguage();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        let isCancelled = false;

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        const speak = async (text: string) => {
            return new Promise<void>((resolve) => {
                Speech.stop();
                Speech.speak(text, {
                    language,
                    onDone: () => {
                        if (!isCancelled) resolve();
                    },
                    onStopped: () => {
                        if (!isCancelled) resolve();
                    },
                    onError: () => {
                        if (!isCancelled) resolve();
                    }
                });
            });
        };

        const takePhoto = async () => {
            if (!permission?.granted) {
                const status = await requestPermission();
                if (!status.granted) {
                    await speak(t('needCameraPermission'));
                    return;
                }
            }

            try {
                // Ensure speech is synchronized
                for (let i = 3; i > 0; i--) {
                    if (isCancelled) return;
                    await speak(`${t('photoCountdown')} ${i} ${t('seconds')}`);
                    await delay(1000);
                }

                if (cameraRef.current && !isCancelled) {
                    const photo = await cameraRef.current.takePictureAsync({
                        quality: 0.8,
                        skipProcessing: true,
                    });

                    if (photo && !isCancelled) {
                        onCapture(photo);
                    }
                }
            } catch (error) {
                console.error('Error taking picture:', error);
                if (!isCancelled) {
                    await speak(t('errorTakingPhoto'));
                }
            }
        };

        // Start the photo capture process
        takePhoto();

        return () => {
            isCancelled = true;
            Speech.stop();
        };
    }, [permission, requestPermission, onCapture, t, language]);

    if (!permission?.granted) {
        return null;
    }

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default CameraComponent;
