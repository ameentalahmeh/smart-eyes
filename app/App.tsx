import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WelcomeScreen, HomeScreen, CameraScreen, ResultsScreen } from './screens';
import { RootStackParamList } from './types/navigation';
import { LanguageProvider, UserProvider, isUserProfileSet } from './contexts';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    const [initialScreen, setInitialScreen] = useState<keyof RootStackParamList>('Welcome');

    // Check if user profile is set and determine initial screen
    useEffect(() => {
        const checkUserProfile = async () => {
            const isProfileSet = await isUserProfileSet();
            setInitialScreen(isProfileSet ? 'Home' : 'Welcome');
        };

        checkUserProfile();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <LanguageProvider>
                <UserProvider>
                    <NavigationContainer>
                        <Stack.Navigator
                            initialRouteName={initialScreen}
                            screenOptions={{
                                headerShown: false,
                                animation: 'fade',
                                gestureEnabled: false,
                            }}
                        >
                            <Stack.Screen name="Welcome" component={WelcomeScreen} />
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen name="Camera" component={CameraScreen} />
                            <Stack.Screen name="Results" component={ResultsScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </UserProvider>
            </LanguageProvider>
        </SafeAreaProvider>
    );
};

export default App;
