export type RootStackParamList = {
    Welcome: undefined;
    Home: undefined;
    Camera: undefined;
    Results: {
        image: { uri: string };
        analysis: string;
    };
};
