import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    fullName: string;
    gender: 'male' | 'female';
    age: number;
    isProfileSet: boolean;
}

interface UserContextType {
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;
    isFirstTime: boolean;
}

// Profile validation function
const isValidProfile = (profile: any): profile is UserProfile => {
    return (
        profile &&
        typeof profile.fullName === 'string' &&
        (profile.gender === 'male' || profile.gender === 'female') &&
        typeof profile.age === 'number' &&
        typeof profile.isProfileSet === 'boolean'
    );
};

// Create context with undefined initial value
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isFirstTime, setIsFirstTime] = useState(true);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const savedProfile = await AsyncStorage.getItem('userProfile');
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);

                // Validate the profile data
                if (isValidProfile(parsedProfile) && parsedProfile.isProfileSet) {
                    setUserProfile(parsedProfile);
                    setIsFirstTime(false);
                } else {
                    // Clear invalid or incomplete profile data
                    await AsyncStorage.removeItem('userProfile');
                    setUserProfile(null);
                    setIsFirstTime(true);
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            // On error, ensure we're in a clean state
            await AsyncStorage.removeItem('userProfile');
            setUserProfile(null);
            setIsFirstTime(true);
        }
    };

    const saveUserProfile = async (profile: UserProfile) => {
        try {
            // Only save to AsyncStorage if the profile is complete
            if (profile.isProfileSet) {
                await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
            }
            setUserProfile(profile);
            setIsFirstTime(false);
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    };

    return (
        <UserContext.Provider value={{ userProfile, setUserProfile: saveUserProfile, isFirstTime }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const isUserProfileSet = async (): Promise<boolean> => {
    const userProfile = await AsyncStorage.getItem('userProfile');
    if (!userProfile) return false;
    return true;
}
