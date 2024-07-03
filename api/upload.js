import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${API_URL}/api/upload`;

        console.log("Uploading file:", file, url);

        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data.fileUrl;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};
