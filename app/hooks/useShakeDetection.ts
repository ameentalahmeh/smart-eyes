import { useEffect, useState } from 'react';
import { Vibration } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import * as Speech from 'expo-speech';
import { AppActions } from '../services/actions';
import { useLanguage } from '../contexts/LanguageContext';

// Increased thresholds and timing to make it less sensitive
const SHAKE_THRESHOLD = 5.0;
const MIN_TIME_BETWEEN_SHAKES = 2000;
const CAMERA_DELAY = 5000;

export const useShakeDetection = (onShake: () => void) => {
    const [lastShake, setLastShake] = useState<number>(0);
    const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);
    const { t, language } = useLanguage();

    useEffect(() => {
        let isSubscribed = true;
        let cameraStartTime = 0;

        const startGyroscope = async () => {
            try {
                console.log('Starting gyroscope...');
                const isAvailable = await Gyroscope.isAvailableAsync();
                console.log('Gyroscope available:', isAvailable);

                if (!isAvailable) {
                    console.error('Gyroscope not available');
                    return;
                }

                await Gyroscope.setUpdateInterval(200);
                const newSubscription = Gyroscope.addListener(({ x, y, z }) => {
                    const magnitude = Math.sqrt(x * x + y * y + z * z);
                    const currentTime = Date.now();

                    if (AppActions.isCameraOn()) {
                        cameraStartTime = currentTime;
                    }

                    if (currentTime - cameraStartTime < CAMERA_DELAY) {
                        return;
                    }

                    if (magnitude > SHAKE_THRESHOLD &&
                        currentTime - lastShake > MIN_TIME_BETWEEN_SHAKES &&
                        isSubscribed) {
                        console.log('Shake detected!', { magnitude, threshold: SHAKE_THRESHOLD });
                        setLastShake(currentTime);
                        Vibration.vibrate([0, 400, 200, 400]);
                        Speech.speak(t('returningHome'), { language });
                        onShake();
                    }
                });
                setSubscription(newSubscription);
            } catch (error) {
                console.error('Failed to start gyroscope:', error);
            }
        };

        startGyroscope();

        return () => {
            console.log('Cleaning up gyroscope subscription');
            isSubscribed = false;
            if (subscription) {
                subscription.remove();
            }
        };
    }, [onShake, lastShake, t, language]);
};
