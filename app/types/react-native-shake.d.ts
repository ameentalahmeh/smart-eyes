declare module 'react-native-shake' {
    export interface ShakeEventListener {
        remove(): void;
    }

    export default class RNShake {
        static addListener(callback: () => void): ShakeEventListener;
    }
}
