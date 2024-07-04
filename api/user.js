import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUserProfile = async (userId) => {
    try {
        const url = `${API_URL}/api/profile/${userId}`;

        console.log("Getting user profile:", userId, url);

        const response = await axios.get(url);

        return response.data;
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
}

export const updateUserProfile = async (userId, data) => {
    try {
        const url = `${API_URL}/api/profile/${userId}`;

        console.log("Updating user profile:", userId, data, url);

        const response = await axios.put(url, data);

        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}