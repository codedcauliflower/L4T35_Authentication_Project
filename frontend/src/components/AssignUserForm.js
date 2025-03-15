import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignUserForm = ({ users, divisions: parentDivisions, organizationalUnits, setSelectedOU }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedOU, setLocalSelectedOU] = useState('');
  const [userDivisionsAndOUs, setUserDivisionsAndOUs] = useState([]);
  const [divisionsAndOUs, setDivisionsAndOUs] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch Division based on OU
const fetchDivisionByOU = async (ouId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/divisions?ou=${ouId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.divisions || [];
  } catch (error) {
    console.error('Failed to fetch division:', error);
    setError('Failed to fetch division. Please try again.');
    return [];
  }
};

// Function to handle when a user is selected
useEffect(() => {
  if (!selectedUser) return;

  const user = users.find(user => user._id === selectedUser);
  if (user && user.divisionsAndOUs) {
    const updatedDivisionsAndOUs = user.divisionsAndOUs.map(async (pair) => {
      const ou = organizationalUnits.find(o => o._id === pair.ou);
      
      // Fetch all divisions that belong to this OU
      const divisions = await fetchDivisionByOU(pair.ou);
    
      // Find the correct division by matching the division _id
      const division = divisions.find(d => d._id === pair.division);
    
      return {
        ...pair,
        divisionName: division ? division.name : 'Unknown Division',
        ouName: ou ? ou.name : 'Unknown OU',
      };
    });
    

    // Wait for all async calls to resolve
    Promise.all(updatedDivisionsAndOUs).then((resolvedDivisionsAndOUs) => {
      setUserDivisionsAndOUs(resolvedDivisionsAndOUs);
    });
  }
}, [selectedUser, users, organizationalUnits]);



  // Fetch divisions when the OU is selected
  useEffect(() => {
    if (!selectedOU) return;

    const fetchDivisionsForOU = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/divisions?ou=${selectedOU}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDivisionsAndOUs(response.data.divisions || []);
      } catch (error) {
        console.error('Failed to fetch divisions:', error);
        setError('Failed to fetch divisions. Please try again.');
      }
    };

    fetchDivisionsForOU();
  }, [selectedOU, token]);

  // Handle user selection
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    setSelectedDivision(''); // Reset division selection
  };

  // Handle OU selection
  const handleOUChange = (e) => {
    const newOU = e.target.value;
    setLocalSelectedOU(newOU);
    setSelectedOU(newOU); // Update state in parent (UserManager)
    setSelectedDivision(''); // Reset division selection
  };

  // Handle division assignment
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
            divisionName: parentDivisions.find(d => d._id === selectedDivision).name,
            ouName: organizationalUnits.find(o => o._id === selectedOU).name,
            division: selectedDivision,
            ou: selectedOU,
          },
        ]);
        alert('User assigned successfully');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to assign user');
    }
  };

  // Function to remove division-OU pair from user
  const handleRemovePair = async (id) => {
    if (userDivisionsAndOUs.length > 1) {
      try {
        const pairToRemove = userDivisionsAndOUs.find(pair => pair._id === id);
        const response = await axios.delete(
          `http://localhost:5000/api/users/${selectedUser}/remove-division`,
          {
            data: {
              division: pairToRemove.division,
              ou: pairToRemove.ou,
            },
            headers: { Authorization: `Bearer ${token}` },
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
        {divisionsAndOUs.length > 0 ? (
          divisionsAndOUs.map((division) => (
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
