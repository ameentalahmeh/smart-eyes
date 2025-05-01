import * as FileSystem from 'expo-file-system';

export const imageToText = async (imageUri: string): Promise<string> => {
    try {

        // Read the file as base64
        let fileContent = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64
        });

        // Send the base64-encoded image data as JSON
        const response = await fetch('http://192.168.1.9:5000/api/itt', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: `data:image/jpeg;base64,${fileContent.replace(/\n/g, '')}`,
                filename: imageUri.split('/').pop() || 'image.jpeg',
                mimetype: 'image/jpeg',
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send image file to analysis API');
        }

        const data = await response.json();
        if (data && data.analysis) {
            return data.analysis;
        }

        throw new Error('No analysis returned from API');

        // For testing, return a mock response
        // return "This image shows a person standing in front of a building. The building appears to be modern with glass windows. The weather seems sunny.";
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
};

export const speechToText = async (audioPath: string): Promise<string> => {
    try {
        // Read the file as base64
        let fileContent = await FileSystem.readAsStringAsync(audioPath, {
            encoding: FileSystem.EncodingType.Base64
        });

        // Send the base64-encoded audio data as JSON
        const response = await fetch('http://192.168.1.9:5000/api/stt', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audio: fileContent.replace(/\n/g, ''),
                filename: audioPath.split('/').pop() || 'audio.wav',
                mimetype: 'audio/wav', // Adjust MIME type if needed
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send audio file to STT API');
        }

        const data = await response.json();
        if (data && data.transcript) {
            return data.transcript;
        }
        throw new Error('No transcript returned from STT API');
    } catch (error) {
        console.error('Speech to text error:', error);
        throw error;
    }
};
