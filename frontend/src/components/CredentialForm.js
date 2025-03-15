import React, { useEffect, useState } from 'react';

const CredentialForm = ({
  title,
  username,
  password,
  selectedOU,
  selectedDivision,
  setTitle,
  setUsername,
  setPassword,
  setSelectedOU,
  setSelectedDivision,
  handleSubmitCredential,
  isEditing,
  user, // Add the user prop here
}) => {
  const [divisions, setDivisions] = useState([]);
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);

  useEffect(() => {
    if (user?.divisionsAndOUs) {
      // Extract unique OUs and Divisions from user.divisionsAndOUs
      const uniqueOUs = [...new Set(user.divisionsAndOUs.map((entry) => entry.ou))];
      const uniqueDivisions = [...new Set(user.divisionsAndOUs.map((entry) => entry.division))];

      setOrganizationalUnits(uniqueOUs);
      setDivisions(uniqueDivisions);
      setFilteredDivisions(uniqueDivisions); // Initially, show all divisions
    }
  }, [user]);

  // Filter divisions based on the selected OU
  useEffect(() => {
    if (selectedOU) {
      // Filter divisions that belong to the selected OU
      const filtered = user.divisionsAndOUs
        .filter((entry) => entry.ou === selectedOU)
        .map((entry) => entry.division);

      // Set filtered divisions
      setFilteredDivisions([...new Set(filtered)]); // Remove duplicates
    } else {
      setFilteredDivisions(divisions); // Reset to all divisions if no OU is selected
    }
  }, [selectedOU, user, divisions]);

  return (
    <form onSubmit={handleSubmitCredential}>
      <label>Title</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Username</label>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

      <label>Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <label>Organizational Unit (OU)</label>
      <select value={selectedOU} onChange={(e) => setSelectedOU(e.target.value)}>
        <option value="">Select Organizational Unit</option>
        {organizationalUnits.map((ou) => (
          <option key={ou} value={ou}>
            {ou || "Unknown OU"}
          </option>
        ))}
      </select>

      <label>Division</label>
      <select 
        value={selectedDivision} 
        onChange={(e) => setSelectedDivision(e.target.value)} 
        disabled={!selectedOU} // Disable if no OU is selected
      >
        <option value="">Select Division</option>
        {filteredDivisions.map((division) => (
          <option key={division} value={division}>
            {division || "Unknown Division"} 
          </option>
        ))}
      </select>

      <button type="submit">{isEditing ? 'Edit' : 'Add'} Credential</button>
    </form>
  );
};

export default CredentialForm;
