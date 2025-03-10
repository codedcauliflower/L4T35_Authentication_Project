import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssignUserForm from './AssignUserForm';
import ChangeRoleForm from './ChangeRoleForm';
import { Navigate } from 'react-router-dom'; // For redirecting unauthorized users

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [selectedOU, setSelectedOU] = useState(""); // Track selected OU
  const [error, setError] = useState(""); // Track error messages
  const [isUnauthorized, setIsUnauthorized] = useState(false); // Track unauthorized state
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role; // Safe access to the role field


  // Set unauthorized state if the user is not an admin
  useEffect(() => {
    if (role !== 'admin') {
      console.log(role)
      setIsUnauthorized(true);
    }
  }, [role]);

  // Fetch users and organizational units
  useEffect(() => {
    if (isUnauthorized) return; // Don't fetch data if the user is unauthorized

    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Users fetched:', userResponse.data);
        setUsers(userResponse.data.users || []);

        const ouResponse = await axios.get('http://localhost:5000/api/ous', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrganizationalUnits(ouResponse.data || []);
      } catch (error) {
        if (error.response?.status === 403) {
          setError('Access Denied: You do not have permission to view this page.');
        } else {
          setError('Failed to fetch data. Please try again.');
        }
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [token, isUnauthorized]);

  // Fetch divisions when selectedOU changes
  useEffect(() => {
    if (!selectedOU || isUnauthorized) return; // Don't fetch divisions if unauthorized or no OU selected

    const fetchDivisions = async () => {
      try {
        const divResponse = await axios.get(`http://localhost:5000/api/divisions?ou=${selectedOU}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Divisions fetched:', divResponse.data);
        setDivisions(divResponse.data.divisions || []);
      } catch (error) {
        if (error.response?.status === 403) {
          setError('Access Denied: You do not have permission to view divisions.');
        } else {
          setError('Failed to fetch divisions. Please try again.');
        }
        console.error('Failed to fetch divisions:', error);
        setDivisions([]);
      }
    };

    fetchDivisions();
  }, [selectedOU, token, isUnauthorized]);

  if (isUnauthorized) {
    return <Navigate to="/not-authorized" />;
  }

  return (
    <div>
      <h2>User Management</h2>

      {error && <p className="bg-red-500 text-white p-3 rounded">{error}</p>}

      {!error && users.length > 0 ? (
        <>
          <AssignUserForm
            users={users}
            divisions={divisions}
            organizationalUnits={organizationalUnits}
            setSelectedOU={setSelectedOU} // Pass down state setter
          />
          <ChangeRoleForm users={users} />
        </>
      ) : (
        !error && <p>Loading users or no users found.</p>
      )}
    </div>
  );
};

export default UserManager;
