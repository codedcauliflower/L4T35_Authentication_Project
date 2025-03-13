import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CredentialForm from './CredentialForm';
import CredentialTable from './CredentialTable';
import { Navigate } from 'react-router-dom'; // For redirecting unauthorized users

const CredentialManager = () => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedOU, setSelectedOU] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCredentialId, setCurrentCredentialId] = useState(null);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  // Fetch credentials only if the user has valid permissions
  useEffect(() => {
    if (!role) return setIsUnauthorized(true); // If no role, deny access

    const fetchData = async () => {
      try {
        const ouResponse = await axios.get('http://localhost:5000/api/ous', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrganizationalUnits(ouResponse.data || []);

        if (selectedOU) {
          const divResponse = await axios.get(`http://localhost:5000/api/divisions?ou=${selectedOU}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDivisions(divResponse.data.divisions || []);
        } else {
          setDivisions([]);
        }

        const credResponse = await axios.get('http://localhost:5000/api/credentials', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredentials(credResponse.data.credentials || []);
      } catch (error) {
        if (error.response?.status === 403) {
          setIsUnauthorized(true);
        } else {
          setError('Failed to fetch data: ' + error.message);
        }
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [token, selectedOU, role]);

  const handleEditCredential = (credential) => {
    if (role !== 'management' && role !== 'admin') {
      alert('Access Denied: You do not have permission to edit credentials.');
      return;
    }
    setIsEditing(true);
    setCurrentCredentialId(credential._id);
    setTitle(credential.title);
    setUsername(credential.username);
    setPassword(credential.password);
    setSelectedDivision(credential.division);
    setSelectedOU(credential.ou);
  };

  const handleSubmitCredential = async () => {
    if (!title || !username || !password || !selectedDivision || !selectedOU) {
      alert('All fields are required');
      return;
    }

    const newCredential = { title, username, password, division: selectedDivision, ou: selectedOU };

    try {
      let response;
      if (isEditing) {
        if (role !== 'management' && role !== 'admin') {
          alert('Access Denied: You do not have permission to update credentials.');
          return;
        }
        response = await axios.put(`http://localhost:5000/api/credentials/${currentCredentialId}`, newCredential, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post('http://localhost:5000/api/credentials', newCredential, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response.data.success) {
        const credResponse = await axios.get('http://localhost:5000/api/credentials', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredentials(credResponse.data.credentials || []);
      }

      setIsEditing(false);
      setTitle('');
      setUsername('');
      setPassword('');
      setSelectedDivision('');
      setSelectedOU('');

      window.location.reload();
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Access Denied');
      } else {
        setError('Failed to save credential');
      }
      console.error('Error handling credential submission:', error);
    }
  };

  if (isUnauthorized) {
    return <Navigate to="/not-authorized" />;
  }

  return (
    <div>
      <h2>Manage Credentials</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && (
        <>
          {/* Only normal users and above can add credentials */}
          {role && (
            <CredentialForm
              title={title}
              username={username}
              password={password}
              selectedOU={selectedOU}
              selectedDivision={selectedDivision}
              organizationalUnits={organizationalUnits}
              divisions={divisions}
              setTitle={setTitle}
              setUsername={setUsername}
              setPassword={setPassword}
              setSelectedOU={setSelectedOU}
              setSelectedDivision={setSelectedDivision}
              handleSubmitCredential={handleSubmitCredential}
              isEditing={isEditing}
            />
          )}

          <h3>Existing Credentials</h3>
          <CredentialTable credentials={credentials} handleEditCredential={handleEditCredential} />
        </>
      )}
    </div>
  );
};

export default CredentialManager;
