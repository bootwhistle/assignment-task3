import axios from 'axios';
import { getEnvironentVariable } from '../utils';

// Images are hosted on Freeimage.host: https://freeimage.host/page/api
//
// The API key is read from the FREEIMAGE_API_KEY environment variable (see app.config.ts).
// If it is not set, the public key published on the Freeimage.host API page is used.
// To use your own key, start the app with:
// 'FREEIMAGE_API_KEY="insert_your_api_key_here" npx expo start'
//
// When creating your app build or publishing, do not forget to run 'eas secret:push' command
// to import your secret values to EAS.

const imageApi = axios.create({
    baseURL: 'https://freeimage.host/api/1',
    headers: { 'Content-Type': 'multipart/form-data' },
});

export interface UploadedImage {
    url: string;
    thumbnailUrl: string;
    size: number;
}

export const uploadImage = async (imageBase64: string): Promise<UploadedImage> => {
    const data = new FormData();
    data.append('key', getEnvironentVariable('FREEIMAGE_API_KEY'));
    data.append('action', 'upload');
    data.append('format', 'json');
    data.append('source', imageBase64);

    const response = await imageApi.post('/upload', data);
    const { image } = response.data;

    return { url: image.url, thumbnailUrl: image.thumb?.url ?? image.url, size: image.size };
};
