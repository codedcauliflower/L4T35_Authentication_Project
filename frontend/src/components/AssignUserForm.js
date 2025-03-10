import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignUserForm = ({ users, divisions, organizationalUnits, setSelectedOU }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedOU, setLocalSelectedOU] = useState('');
  const [error, setError] = useState(null);
  const [userDivisionsAndOUs, setUserDivisionsAndOUs] = useState([]);
  const [divisionsAndOUs, setDivisionsAndOUs] = useState([]);

  const token = localStorage.getItem('token');

  // Function to handle the 'X' click to remove the pair
  const handleRemovePair = async (id) => {
    if (userDivisionsAndOUs.length > 1) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/users/${selectedUser}/remove-division`,
          {
            data: { division: userDivisionsAndOUs.find(pair => pair._id === id).division, ou: userDivisionsAndOUs.find(pair => pair._id === id).ou },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setUserDivisionsAndOUs(userDivisionsAndOUs.filter(pair => pair._id !== id));
        }
      } catch (error) {
        console.error(error);
        setError('Failed to remove division-OU pair');
      }
    } else {
      alert('At least one pair must remain assigned to the user.');
    }
  };

  // Function to handle when a user is selected
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);

    // Fetch the user with their division and OU pairs
    const user = users.find(user => user._id === userId);
    if (user && user.divisionsAndOUs) {
      // Get division and OU names by ID
      const updatedDivisionsAndOUs = user.divisionsAndOUs.map(pair => {
        const division = divisions.find(d => d._id === pair.division);
        const ou = organizationalUnits.find(o => o._id === pair.ou);
        return {
          ...pair,
          divisionName: division ? division.name : 'Unknown Division',
          ouName: ou ? ou.name : 'Unknown OU'
        };
      });

      setUserDivisionsAndOUs(updatedDivisionsAndOUs);
    }
  };

  // Handle OU selection
  const handleOUChange = (e) => {
    const newOU = e.target.value;
    setLocalSelectedOU(newOU);
    setSelectedOU(newOU); // Update the state in UserManager to fetch divisions
    setSelectedDivision(''); // Reset division selection
  };

  // Assign the pair to the user
  const handleAssign = async () => {
    if (!selectedUser || !selectedDivision || !selectedOU) {
      alert('All fields are required');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/${selectedUser}/add-division`,
        { division: selectedDivision, ou: selectedOU },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUserDivisionsAndOUs([
          ...userDivisionsAndOUs,
          {
            divisionName: divisions.find(d => d._id === selectedDivision).name,
            ouName: organizationalUnits.find(o => o._id === selectedOU).name,
            division: selectedDivision,
            ou: selectedOU
          }
        ]);
        alert('User assigned successfully');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to assign user');
    }
  };

  useEffect(() => {
    if (selectedUser) {
      // Get the assigned divisions and OUs when user is selected
      const user = users.find(user => user._id === selectedUser);
      if (user && user.divisionsAndOUs) {
        setDivisionsAndOUs(user.divisionsAndOUs);
      }
    }
  }, [selectedUser, users]);

  return (
    <div>
      <h3>Assign User to Division and OU</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>User</label>
      <select onChange={handleUserChange} value={selectedUser}>
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>

      {/* Display current assigned divisions and OUs */}
      <div>
        <h4>Assigned Divisions and OUs</h4>
        {userDivisionsAndOUs.length > 0 ? (
          userDivisionsAndOUs.map(pair => (
            <div key={pair._id}>
              <span>{pair.divisionName} - {pair.ouName}</span>
              <button onClick={() => handleRemovePair(pair._id)}>&times;</button>
            </div>
          ))
        ) : (
          <p>No pairs assigned yet</p>
        )}
      </div>

      <label>Organizational Unit (OU)</label>
      <select onChange={handleOUChange} value={selectedOU}>
        <option value="">Select OU</option>
        {organizationalUnits.map((ou) => (
          <option key={ou._id} value={ou._id}>
            {ou.name}
          </option>
        ))}
      </select>

      <label>Division</label>
      <select onChange={(e) => setSelectedDivision(e.target.value)} value={selectedDivision} disabled={!selectedOU}>
        <option value="">Select Division</option>
        {divisions.length > 0 ? (
          divisions.map((division) => (
            <option key={division._id} value={division._id}>
              {division.name}
            </option>
          ))
        ) : (
          <option disabled>No divisions available</option>
        )}
      </select>

      <button onClick={handleAssign}>Assign</button>
    </div>
  );
};

export default AssignUserForm;
