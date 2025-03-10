import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChangeRoleForm = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) {
      alert('All fields are required');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${selectedUser}/role`,
        { newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('User role changed successfully');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to change role');
    }
  };

  return (
    <div>
      <h3>Change User Role</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>User</label>
      <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>

      <label>New Role</label>
      <select onChange={(e) => setNewRole(e.target.value)} value={newRole}>
        <option value="">Select Role</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="management">Management</option>
      </select>

      <button onClick={handleChangeRole}>Change Role</button>
    </div>
  );
};

export default ChangeRoleForm;
