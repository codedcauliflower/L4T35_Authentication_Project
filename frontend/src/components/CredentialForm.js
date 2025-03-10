import React from 'react';

const CredentialForm = ({
  title,
  username,
  password,
  selectedOU,
  selectedDivision,
  organizationalUnits,
  divisions,
  setTitle,
  setUsername,
  setPassword,
  setSelectedOU,
  setSelectedDivision,
  handleSubmitCredential,
  isEditing
}) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label>Organizational Unit (OU):</label>
        <select
          value={selectedOU}
          onChange={(e) => setSelectedOU(e.target.value)}
        >
          <option value="">Select OU</option>
          {organizationalUnits.map((ou) => (
            <option key={ou._id} value={ou._id}>
              {ou.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Division:</label>
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          disabled={selectedOU === selectedDivision}
        >
          <option value="">Select Division</option>
          {divisions.map((division) => (
            <option key={division._id} value={division._id}>
              {division.name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleSubmitCredential}>
        {isEditing ? 'Update Credential' : 'Add Credential'}
      </button>
    </form>
  );
};

export default CredentialForm;
