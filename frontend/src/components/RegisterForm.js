import React, { useState, useEffect } from 'react';
import { registerUser } from '../services/api';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user', // default role
    ou: '',
    division: ''
  });

  const [ous, setOUs] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [errorDivisions, setErrorDivisions] = useState('');
  const [successMessage, setSuccessMessage] = useState('');  // Success message state

  // Fetch OUs and Divisions
  useEffect(() => {
    // Fetch OUs
    axios.get('http://localhost:5000/api/ous')
      .then(response => setOUs(response.data))
      .catch(error => console.error('Error fetching OUs:', error));
  
    // Fetch Divisions based on selected OU (Optional, if you want them to change dynamically)
    if (formData.ou) {
      setLoadingDivisions(true);
      axios.get(`http://localhost:5000/api/divisions?ou=${formData.ou}`)
        .then(response => {
          console.log('Divisions response:', response);
  
          // Access the divisions from response.data.divisions
          const divisionsData = response.data.divisions || []; // Fallback to empty array if divisions not found
          if (Array.isArray(divisionsData)) {
            setDivisions(divisionsData);
            setErrorDivisions('');  // Reset error if successful
          } else {
            setDivisions([]);  // If not an array, reset divisions
            setErrorDivisions('Unexpected error: Divisions data is not in the expected format.');
          }
        })
        .catch(error => {
          console.error('Error fetching Divisions:', error);
          setErrorDivisions('Failed to load divisions. Please try again later.');
        })
        .finally(() => setLoadingDivisions(false));
    } else {
      setDivisions([]);  // Reset divisions if no OU is selected
    }
  }, [formData.ou]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await registerUser(formData);
      console.log('User registered successfully:', data);
      setSuccessMessage('Registration successful! You can now log in.');  // Show success message

      // Optionally, clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

      // Reset form data after successful registration
      setFormData({
        username: '',
        password: '',
        role: 'user',
        ou: '',
        division: ''
      });

    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
      
      {/* Display success message */}
      {successMessage && (
        <p className="text-green-500 text-center mb-4">{successMessage}</p>
      )}

      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="ou" className="block text-sm font-medium text-gray-700">Organizational Unit (OU)</label>
        <select 
          id="ou" 
          name="ou" 
          value={formData.ou} 
          onChange={handleChange} 
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select OU</option>
          {ous.map((ou) => (
            <option key={ou._id} value={ou._id}>
              {ou.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="division" className="block text-sm font-medium text-gray-700">Division</label>
        <select 
          id="division" 
          name="division" 
          value={formData.division} 
          onChange={handleChange} 
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loadingDivisions}  // Disable while loading divisions
        >
          <option value="">Select Division</option>
          {loadingDivisions ? (
            <option>Loading...</option>
          ) : errorDivisions ? (
            <option>{errorDivisions}</option>
          ) : (
            divisions.length > 0 ? (
              divisions.map((division) => (
                <option key={division._id} value={division._id}>
                  {division.name}
                </option>
              ))
            ) : (
              <option>No divisions available</option>
            )
          )}
        </select>
      </div>

      <div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Register
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;