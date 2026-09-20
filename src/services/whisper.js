import { getAPIKeys } from './config';
import * as FileSystem from 'expo-file-system';
import * as mime from 'mime';
import axios from 'axios';
import { canUseAI } from './openai';

export const transcribeAudio = async (uri) => {
  try {
    const allowed = await canUseAI();
    if (!allowed) {
      alert("Limit reached: You can only use AI 1000 times per week");
      return null;
    }

    const { OPENAI_API_KEY } = await getAPIKeys();

    const fileType = mime.getType(uri); // Automatically gets correct MIME type
    const fileName = uri.split('/').pop();

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: fileName || 'audio.webm',
      type: fileType || 'audio/webm',
    });
    formData.append('model', 'whisper-1'); // required

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    return response.data.text;
  } catch (error) {
    console.error('Whisper error:', error?.response?.data || error.message);
    return 'Failed to transcribe audio.';
  }
};
