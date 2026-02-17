import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CreateSessionResponse {
  session_id: string;
  url: string;
  streaming_url: string;
}

export interface SpeakRequest {
  session_id: string;
  text: string;
}

export const avatarApi = {
  // Create a new avatar session
  createSession: async (avatarId?: string, voiceId?: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/avatar/create-session`, {
      avatar_id: avatarId,
      voice_id: voiceId,
      quality: 'high'
    });
    return response.data as CreateSessionResponse;
  },

  // Make avatar speak
  speak: async (sessionId: string, text: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/avatar/speak`, {
      session_id: sessionId,
      text: text
    });
    return response.data;
  },

  // Stop session
  stopSession: async (sessionId: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/avatar/stop?session_id=${sessionId}`);
    return response.data;
  },

  // Get session status
  getSessionStatus: async (sessionId: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/avatar/sessions/${sessionId}`);
    return response.data;
  },

  // List available avatars
  listAvatars: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/avatar/list-avatars`);
    return response.data;
  }
};