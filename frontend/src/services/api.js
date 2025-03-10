import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Register user
export const registerUser = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;  // Successful response from the backend
    } catch (error) {
      console.error('Error during registration:', error);
      throw error.response ? error.response.data : 'Something went wrong';  // More detailed error message
    }
  };
  

// Login user
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;  // Returns the token and message
  } catch (error) {
    console.error('Error during login', error);
    throw error.response ? error.response.data : 'Something went wrong';
  }
};
