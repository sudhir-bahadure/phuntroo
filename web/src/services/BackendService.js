import axios from 'axios';

const API_URL = 'http://localhost:8080/api/chat';

export const backendService = {
    sendMessage: async (message, history = []) => {
        try {
            const response = await axios.post(API_URL, {
                message: message,
                history: history // Backend might not use this yet, but good to pass
            });
            return response.data;
        } catch (error) {
            console.error('Backend API Error:', error);
            throw error;
        }
    },

    checkHealth: async () => {
        try {
            // Simple check if backend is reachable (could be a specific health endpoint)
            await axios.get('http://localhost:8080/actuator/health');
            return true;
        } catch (e) {
            return false;
        }
    }
};
